'use client';

import { useState } from 'react';
import {
  Provider,
  Service,
  Specialist,
  api,
  ApiError,
  BookingType,
  BookingState,
} from '@/lib/api';
import { auth } from '@/lib/auth';
import ServiceStep from './steps/ServiceStep';
import SpecialistStep from './steps/SpecialistStep';
import BookingTypeStep from './steps/BookingTypeStep';
import LocationStep from './steps/LocationStep';
import DateTimeStep from './steps/DateTimeStep';
import PaymentStep from './steps/PaymentStep';
import SummaryStep from './steps/SummaryStep';

type Step =
  | 'service'
  | 'specialist'
  | 'type'
  | 'location'
  | 'datetime'
  | 'payment'
  | 'summary'
  | 'confirming';

const FLOW_STEPS: Step[] = [
  'service',
  'specialist',
  'type',
  'location',
  'datetime',
  'payment',
  'summary',
];

const STEP_LABELS: Record<string, string> = {
  service: 'Services',
  specialist: 'Specialist',
  type: 'Booking Type',
  location: 'Location',
  datetime: 'Date & Time',
  payment: 'Payment',
  summary: 'Summary',
};

export function BookingModal({
  provider,
  services,
  specialists,
  initialServiceId,
  initialSpecialistId,
  onClose,
  onSuccess,
}: {
  provider: Provider;
  services: Service[];
  specialists: Specialist[];
  initialServiceId?: string | null;
  initialSpecialistId?: string | null;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}) {
  const [step, setStep] = useState<Step>('service');
  const [booking, setBooking] = useState<BookingState>({
    serviceIds: initialServiceId ? [initialServiceId] : [],
    specialistId: initialSpecialistId ?? null,
    bookingType: null,
    location: null,
    scheduledAt: null,
    note: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'chapa'>('chapa');
  const [error, setError] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const visibleSteps = FLOW_STEPS.filter(
    (item) => item !== 'location' || booking.bookingType === BookingType.VIP_HOME,
  );
  const currentIndex = visibleSteps.indexOf(step);

  const canProceed = (): boolean => {
    switch (step) {
      case 'service':
        return booking.serviceIds.length > 0;
      case 'specialist':
        return booking.bookingType === BookingType.VIP_HOME
          ? booking.specialistId !== null
          : true;
      case 'type':
        return booking.bookingType !== null;
      case 'location':
        return booking.bookingType === BookingType.VIP_HOME
          ? Boolean(
              booking.location?.address &&
                booking.location.latitude != null &&
                booking.location.longitude != null,
            )
          : true;
      case 'datetime':
        return booking.scheduledAt !== null;
      case 'payment':
        return paymentMethod === 'chapa';
      case 'summary':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const index = visibleSteps.indexOf(step);
    if (index >= 0 && index < visibleSteps.length - 1) {
      setStep(visibleSteps[index + 1]);
      setError(null);
    }
  };

  const handlePrev = () => {
    const index = visibleSteps.indexOf(step);
    if (index > 0) {
      setStep(visibleSteps[index - 1]);
      setError(null);
    }
  };

  const handleConfirm = async () => {
    if (!booking.scheduledAt || !booking.bookingType) {
      setError('Please complete your booking details.');
      return;
    }
    if (!auth.getAccessToken()) {
      setError('Please sign in before booking.');
      return;
    }
    if (paymentMethod !== 'chapa') {
      setError('Please select a payment method.');
      return;
    }

    try {
      setStep('confirming');
      setError(null);

      let bookingId = createdBookingId;
      // Create once; retries reuse the existing booking.
      if (!bookingId) {
        const createdBooking = await api.bookings.create({
          serviceProviderId: provider.id,
          serviceIds: booking.serviceIds,
          bookingType: booking.bookingType,
          scheduledAt: booking.scheduledAt.toISOString(),
          ...(booking.specialistId ? { specialistId: booking.specialistId } : {}),
          ...(booking.location ? { location: booking.location } : {}),
          ...(booking.note.trim() ? { note: booking.note.trim() } : {}),
        });
        bookingId = createdBooking.id;
        setCreatedBookingId(bookingId);
      }

      const payment = await api.payments.initialize(bookingId);
      if (!payment.checkoutUrl) {
        throw new Error('Chapa did not return a checkout URL.');
      }
      window.location.assign(payment.checkoutUrl);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Could not start Chapa payment. Please try again.',
      );
      setStep('summary');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-2xl sm:rounded-card">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="font-display text-xl font-semibold text-gray-900">
            Book {provider.businessName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking"
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step !== 'confirming' && (
          <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
            <div className="flex items-start justify-between gap-1">
              {visibleSteps.map((item, index) => {
                const active = index <= currentIndex;
                return (
                  <div key={item} className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${active ? 'bg-bloom-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {index + 1}
                    </div>
                    <span className={`text-xs ${active ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                      {STEP_LABELS[item]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-6 py-8">
          {step === 'service' && (
            <ServiceStep
              services={services}
              selected={booking.serviceIds}
              onChange={(serviceIds) => setBooking({ ...booking, serviceIds })}
            />
          )}

          {step === 'specialist' && (
            <SpecialistStep
              specialists={specialists}
              selected={booking.specialistId}
              onChange={(specialistId) => setBooking({ ...booking, specialistId })}
              optional={booking.bookingType !== BookingType.VIP_HOME}
            />
          )}

          {step === 'type' && (
            <BookingTypeStep
              supportsVip={Boolean(
                provider.supportsVipHome &&
                  booking.specialistId &&
                  specialists.find((s) => s.id === booking.specialistId)?.supportsVipHome,
              )}
              selected={booking.bookingType}
              onChange={(bookingType) =>
                setBooking({
                  ...booking,
                  bookingType,
                  location: bookingType === BookingType.STANDARD ? null : booking.location,
                })
              }
              vipFee={provider.vipTravelFee}
            />
          )}

          {step === 'location' && booking.bookingType === BookingType.VIP_HOME && (
            <LocationStep
              location={booking.location}
              onChange={(location) => setBooking({ ...booking, location })}
            />
          )}

          {step === 'datetime' && (
            <DateTimeStep
              provider={provider}
              specialist={specialists.find((s) => s.id === booking.specialistId) || null}
              services={services.filter((s) => booking.serviceIds.includes(s.id))}
              selected={booking.scheduledAt}
              onChange={(scheduledAt) => setBooking({ ...booking, scheduledAt })}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              selected={paymentMethod}
              onChange={setPaymentMethod}
              services={services.filter((s) => booking.serviceIds.includes(s.id))}
              vipTravelFee={booking.bookingType === BookingType.VIP_HOME ? Number(provider.vipTravelFee || 0) : 0}
            />
          )}

          {step === 'summary' && (
            <SummaryStep
              provider={provider}
              booking={booking}
              services={services}
              specialists={specialists}
              onChange={(note) => setBooking({ ...booking, note })}
            />
          )}

          {step === 'confirming' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-bloom-200 border-t-bloom-500" />
              <p className="font-medium text-gray-900">Preparing secure Chapa checkout…</p>
              <p className="mt-2 text-sm text-gray-500">Please wait. Do not close this window.</p>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-card border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
              {createdBookingId && (
                <p className="mt-1 text-xs text-red-600">
                  Your booking has already been created. Retrying will reuse this booking.
                </p>
              )}
            </div>
          )}
        </div>

        {step !== 'confirming' && (
          <div className="sticky bottom-0 flex gap-3 border-t border-gray-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={step === 'service' ? onClose : handlePrev}
              className="flex-1 rounded-button border border-gray-300 px-4 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50"
            >
              {step === 'service' ? 'Cancel' : 'Back'}
            </button>
            <button
              type="button"
              onClick={step === 'summary' ? handleConfirm : handleNext}
              disabled={!canProceed()}
              className={`flex-1 rounded-button px-4 py-3 font-semibold text-white transition-colors ${canProceed() ? 'bg-bloom-500 hover:bg-bloom-600' : 'cursor-not-allowed bg-gray-300'}`}
            >
              {step === 'summary' ? 'Continue to Chapa' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
