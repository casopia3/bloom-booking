
import { Module } from '@nestjs/common';
import { ProviderApplicationsController } from './provider-applications.controller';
import { ProviderApplicationsService } from './provider-applications.service';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [SmsModule],
  controllers: [ProviderApplicationsController],
  providers: [ProviderApplicationsService],
})
export class ProviderApplicationsModule {}
