
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
    const apiKey =
      this.configService.get<string>('SMSETHIOPIA_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'SMSETHIOPIA_API_KEY is not configured.',
      );
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          KEY: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ msisdn, text }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        // Do not log or return the provider response body.
        // It may contain sensitive message details.
        console.error(
          'SMSEthiopia request failed with status:',
          response.status,
        );

        throw new InternalServerErrorException(
          `SMSEthiopia rejected the SMS request (${response.status}).`,
        );
      }

      try {
        return JSON.parse(responseText) as unknown;
      } catch {
        return { accepted: true };
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      console.error('SMSEthiopia connection failed.');

      throw new InternalServerErrorException(
        'Could not connect to SMSEthiopia.',
      );
    }
  }
}
