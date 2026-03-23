import { Module } from '@nestjs/common';
import { JournalVoucherService } from './journal-voucher.service';
import { JournalVoucherController } from './journal-voucher.controller';
import { TenantModule } from '@/tenant/tenant.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [TenantModule, CommonModule],
  controllers: [JournalVoucherController],
  providers: [JournalVoucherService],
  exports: [JournalVoucherService],
})
export class JournalVoucherModule {}
