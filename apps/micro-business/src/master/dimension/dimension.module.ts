import { Module } from '@nestjs/common';
import { DimensionService } from './dimension.service';
import { DimensionController } from './dimension.controller';
import { TenantModule } from '@/tenant/tenant.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [TenantModule, CommonModule],
  controllers: [DimensionController],
  providers: [DimensionService],
  exports: [DimensionService],
})
export class DimensionModule {}
