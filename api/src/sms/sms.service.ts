
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly apiUrl = 'https://smsethiopia.com/api/sms/send';

  constructor(private readonly configService: ConfigService) {}

  async sendSms(msisdn: string, text: string) {
    const apiKey = this.configService.get<string>('SMSETHIOPIA_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'SMSETHIOPIA_API_KEY is not configured.',
      );
    }

    console.log('SMSEthiopia SMS request:', {
      msisdn,
      text,
      hasApiKey: Boolean(apiKey),
    });

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          KEY: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          msisdn,
          text,
        }),
      });

      const responseText = await response.text();

      console.log('SMSEthiopia response status:', response.status);
      console.log('SMSEthiopia response:', responseText);

      let data: unknown = null;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        throw new InternalServerErrorException(
          `SMSEthiopia error (${response.status}): ${responseText}`,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      console.error('SMSEthiopia request failed:', error);

      throw new InternalServerErrorException(
        'Could not connect to SMSEthiopia.',
      );
    }
  }
}
