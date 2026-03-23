import { Module } from '@nestjs/common';
import { ApplicationConfigService } from './application-config.service';
import { ApplicationConfigController } from './application-config.controller';
import { TenantModule } from '@/tenant/tenant.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [TenantModule, CommonModule],
  controllers: [ApplicationConfigController],
  providers: [ApplicationConfigService],
  exports: [ApplicationConfigService],
})
export class ApplicationConfigModule {}
