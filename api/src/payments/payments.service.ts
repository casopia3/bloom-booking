import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface RequestingUser {
  userId: string;
  role: UserRole;
}

interface ChapaInitializeResponse {
  status: string;
  message: string;
  data?: {
    checkout_url?: string;
    tx_ref?: string;
  };
}

interface ChapaVerifyResponse {
  status?: string;
  message?: string;
  data?: {
    status?: string;
    tx_ref?: string;
    amount?: string | number;
    currency?: string;
  };
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async initialize(bookingId: string, requester: RequestingUser) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        customer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      requester.role !== UserRole.SUPER_ADMIN &&
      booking.customer.userId !== requester.userId
    ) {
      throw new ForbiddenException(
        'You cannot initialize payment for this booking',
      );
    }

    if (!booking.payment) {
      throw new NotFoundException(
        'Payment record not found for this booking',
      );
    }

    if (booking.payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException(
        'This booking has already been paid',
      );
    }

    const secretKey = process.env.CHAPA_SECRET_KEY;

    if (!secretKey) {
      throw new InternalServerErrorException(
        'CHAPA_SECRET_KEY is not configured',
      );
    }

    // Chapa limits tx_ref to 50 characters. Keep an existing saved
    // reference unchanged; generate a compact reference for new/retried payments.
    let txRef = booking.payment.chapaTxRef;

    if (!txRef || booking.payment.status === PaymentStatus.FAILED) {
      // A compact reference that does not include the full booking ID.
      // Timestamp + random suffix makes collisions very unlikely.
      txRef = `bloom-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 10)}`.slice(0, 50);
    }

    if (txRef.length > 50) {
      throw new BadRequestException(
        'The saved Chapa transaction reference exceeds 50 characters. Please contact support.',
      );
    }

    const amount = booking.payment.amount.toString();
    const customerName = booking.customer.name?.trim() || 'Bloom Customer';
    const nameParts = customerName.split(/\s+/);
    const firstName = nameParts[0] || 'Bloom';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    const appBaseUrl = (
      process.env.APP_BASE_URL || 'http://localhost:3001'
    ).replace(/\/+$/, '');

    const payload = {
      amount,
      currency: 'ETB',
      email: booking.customer.user.email || 'customer@bloombooking.com',
      first_name: firstName,
      last_name: lastName,
      phone_number: booking.customer.user.phone,
      tx_ref: txRef,
      // Return to the existing booking details page.
      return_url: `${appBaseUrl}/bookings/${booking.id}?tx_ref=${encodeURIComponent(txRef)}`,
      customization: {
        title: 'Bloom Booking',
        // Chapa limits this field to 50 characters.
        description: 'Bloom Booking payment',
      },
    };

    try {
      const response = await fetch(
        'https://api.chapa.co/v1/transaction/initialize',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const result = (await response.json()) as ChapaInitializeResponse;

      if (!response.ok || result.status !== 'success') {
        throw new BadRequestException(
          result.message || 'Chapa payment initialization failed',
        );
      }

      const returnedTxRef = result.data?.tx_ref || txRef;
      const checkoutUrl = result.data?.checkout_url;

      if (!checkoutUrl) {
        throw new BadRequestException(
          'Chapa did not return a checkout URL',
        );
      }

      if (returnedTxRef.length > 50) {
        throw new BadRequestException(
          'Chapa returned a transaction reference exceeding 50 characters',
        );
      }

      await this.prisma.payment.update({
        where: { id: booking.payment.id },
        data: {
          chapaTxRef: returnedTxRef,
          chapaStatus: 'pending',
        },
      });

      return {
        success: true,
        bookingId: booking.id,
        paymentId: booking.payment.id,
        amount,
        currency: 'ETB',
        txRef: returnedTxRef,
        checkoutUrl,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Chapa initialization error:', error);

      throw new InternalServerErrorException(
        'Unable to initialize Chapa payment',
      );
    }
  }

  async verify(txRef: string, requester: RequestingUser) {
    const payment = await this.prisma.payment.findUnique({
      where: { chapaTxRef: txRef },
      include: {
        booking: {
          include: {
            customer: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment transaction not found');
    }

    if (
      requester.role !== UserRole.SUPER_ADMIN &&
      payment.booking.customer.userId !== requester.userId
    ) {
      throw new ForbiddenException(
        'You cannot verify this payment',
      );
    }

    // Return the saved result for a payment already marked successful.
    if (payment.status === PaymentStatus.SUCCESS) {
      return {
        success: true,
        status: 'SUCCESS',
        txRef,
        bookingId: payment.booking.id,
        amount: payment.amount.toString(),
      };
    }

    const secretKey = process.env.CHAPA_SECRET_KEY;

    if (!secretKey) {
      throw new InternalServerErrorException(
        'CHAPA_SECRET_KEY is not configured',
      );
    }

    let result: ChapaVerifyResponse;
    let responseOk: boolean;

    try {
      const response = await fetch(
        `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      responseOk = response.ok;
      result = (await response.json()) as ChapaVerifyResponse;
    } catch (error) {
      console.error('Chapa verification request failed:', error);

      throw new InternalServerErrorException(
        'Unable to verify payment with Chapa',
      );
    }

    if (!responseOk || !result.data) {
      throw new BadRequestException(
        result.message || 'Chapa verification failed',
      );
    }

    const data = result.data;
    const chapaStatus = data.status?.toLowerCase();

    // Confirm the returned transaction reference matches our record.
    if (data.tx_ref !== txRef) {
      throw new BadRequestException(
        'Chapa transaction reference does not match',
      );
    }

    // Compare amounts to two decimal places.
    const expectedAmount = Number(payment.amount);
    const receivedAmount = Number(data.amount);

    if (
      data.amount === undefined ||
      !Number.isFinite(receivedAmount) ||
      Math.round(receivedAmount * 100) !==
        Math.round(expectedAmount * 100)
    ) {
      throw new BadRequestException(
        'Verified payment amount does not match the booking amount',
      );
    }

    if (data.currency?.toUpperCase() !== 'ETB') {
      throw new BadRequestException(
        'Verified payment currency does not match ETB',
      );
    }

    if (chapaStatus === 'success') {
      // Do not overwrite an already successful payment or its paidAt.
      await this.prisma.payment.updateMany({
        where: {
          id: payment.id,
          status: { not: PaymentStatus.SUCCESS },
        },
        data: {
          status: PaymentStatus.SUCCESS,
          chapaStatus: 'success',
          paidAt: new Date(),
        },
      });

      return {
        success: true,
        status: 'SUCCESS',
        txRef,
        bookingId: payment.booking.id,
        amount: payment.amount.toString(),
      };
    }

    if (
      chapaStatus === 'failed' ||
      chapaStatus === 'cancelled' ||
      chapaStatus === 'incomplete'
    ) {
      await this.prisma.payment.updateMany({
        where: {
          id: payment.id,
          status: { not: PaymentStatus.SUCCESS },
        },
        data: {
          status: PaymentStatus.FAILED,
          chapaStatus,
        },
      });

      return {
        success: false,
        status: chapaStatus.toUpperCase(),
        txRef,
        bookingId: payment.booking.id,
      };
    }

    // Pending or unknown statuses must not be treated as payment failure.
    await this.prisma.payment.updateMany({
      where: {
        id: payment.id,
        status: { not: PaymentStatus.SUCCESS },
      },
      data: {
        status: PaymentStatus.PENDING,
        chapaStatus: chapaStatus || 'pending',
      },
    });

    return {
      success: false,
      status: chapaStatus || 'pending',
      txRef,
      bookingId: payment.booking.id,
    };
  }
}
