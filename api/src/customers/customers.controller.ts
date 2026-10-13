// NEW FILE: api/src/customers/customers.controller.ts

import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CustomersService } from './customers.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMine(@CurrentUser() user: { userId: string }) {
    return this.customersService.findMine(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMine(@Body() dto: UpdateCustomerDto, @CurrentUser() user: { userId: string }) {
    return this.customersService.updateMine(user, dto);
  }
}