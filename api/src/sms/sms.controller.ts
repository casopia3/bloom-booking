
import { Body, Controller, Post } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('test')
  async testSms(
    @Body()
    body: {
      phone: string;
      message: string;
    },
  ) {
    return this.smsService.sendSms(body.phone, body.message);
  }
}
