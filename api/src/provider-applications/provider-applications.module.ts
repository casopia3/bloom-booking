import { Module } from '@nestjs/common';
import { ProviderApplicationsController } from './provider-applications.controller';
import { ProviderApplicationsService } from './provider-applications.service';

@Module({
  controllers: [ProviderApplicationsController],
  providers: [ProviderApplicationsService],
})
export class ProviderApplicationsModule {}