import { Module } from '@nestjs/common';
import { ExtraCostService } from './extra-cost.service';
import { ExtraCostController } from './extra-cost.controller';
import { TenantModule } from '@/tenant/tenant.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [TenantModule, CommonModule],
  controllers: [ExtraCostController],
  providers: [ExtraCostService],
  exports: [ExtraCostService],
})
export class ExtraCostModule {}
