import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post('initialize')
  initialize(
    @Body() dto: InitializePaymentDto,
    @CurrentUser() user: {
      userId: string;
      role: UserRole;
    },
  ) {
    return this.paymentsService.initialize(dto.bookingId, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post('verify/:txRef')
  verify(
    @Param('txRef') txRef: string,
    @CurrentUser() user: {
      userId: string;
      role: UserRole;
    },
  ) {
    return this.paymentsService.verify(txRef, user);
  }
}