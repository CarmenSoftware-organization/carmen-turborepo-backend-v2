import { Module } from '@nestjs/common';
import { CountStockService } from './count-stock.service';
import { CountStockController } from './count-stock.controller';
import { TenantModule } from '@/tenant/tenant.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [TenantModule, CommonModule],
  controllers: [CountStockController],
  providers: [CountStockService],
  exports: [CountStockService],
})
export class CountStockModule {}
