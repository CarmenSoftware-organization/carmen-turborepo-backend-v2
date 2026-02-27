import { ApproveQuantityAndUnitSchema, EmbeddedCurrencySchema, EmbeddedDiscountSchema, EmbeddedTaxSchema, EmbeddedVendorSchema, FocSchema, PriceSchema, stage_status } from '@/common'
import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

/* For some reason it's seem union type validate won't work with builded data so I have to duplicate it in PR's folder and fix it later */

export const ApprovePurchaseRequestDetailSchema = z.object({
  id: z.string().uuid(),
  description: z.string().optional().nullable(),
  purchase_reuqest_id: z.string().uuid(),
  stage_status: z.nativeEnum(stage_status),
  stage_message: z.string().nullable(),
})
.merge(ApproveQuantityAndUnitSchema)

  // Approve By Purchase Role

export const PurchaseRoleApprovePurchaseRequestDetailSchema = ApprovePurchaseRequestDetailSchema
.merge(EmbeddedTaxSchema)
.merge(EmbeddedDiscountSchema)
.merge(EmbeddedCurrencySchema)
.merge(EmbeddedVendorSchema)
.merge(PriceSchema)
.merge(FocSchema)

export const ApproveByStageRoleSchema2 = z.discriminatedUnion('stage_role', [
  ApprovePurchaseRequestDetailSchema.extend({
    stage_role: z.literal('approve')
  }),
  PurchaseRoleApprovePurchaseRequestDetailSchema.extend({
    stage_role: z.literal('purchase')
  })
]);

export class ApproveByStageRoleDto2 extends createZodDto(ApproveByStageRoleSchema2) {}