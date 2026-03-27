import { enum_stage_role } from '@repo/prisma-shared-schema-tenant';
import { ApproveQuantityAndUnitSchema, CreatePurchaseRequestDetailSchema, EmbeddedCurrencySchema, EmbeddedDepartmentSchema, EmbeddedDiscountSchema, EmbeddedPriceListSchema, EmbeddedTaxSchema, EmbeddedVendorSchema, EmbeddedWorkflowSchema, FocSchema, PriceSchema, stage_status } from '@/common'
import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

/* For some reason it's seem union type validate won't work with builded data so I have to duplicate it in PR's folder and fix it later */

export const ApprovePurchaseRequestDetailSchema = z.object({
  id: z.string().uuid(),
  description: z.string().optional().nullable(),
  purchase_request_id: z.string().uuid(),
  stage_status: z.nativeEnum(stage_status),
  stage_message: z.string().nullable(),
  current_stage_status: z.nativeEnum(stage_status).optional(),
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
  .merge(EmbeddedPriceListSchema)

export const ApproveByStageRoleSchema2 = z.discriminatedUnion('stage_role', [
  z.object({
    stage_role: z.literal(enum_stage_role.approve),
    details: z.array(ApprovePurchaseRequestDetailSchema)
  }),
  z.object({
    stage_role: z.literal(enum_stage_role.purchase),
    details: z.array(PurchaseRoleApprovePurchaseRequestDetailSchema)
  })
]);

export const SavePurchaseRequestSchema = z.discriminatedUnion('stage_role', [
  z.object({
    stage_role: z.literal(enum_stage_role.create),
    details: z.object({
      pr_date: z.string().datetime().pipe(z.coerce.date()).optional(),
      description: z.string().optional().nullable(),
      requestor_id: z.string().uuid().optional(),
    })
      .merge(EmbeddedWorkflowSchema)
      .merge(EmbeddedDepartmentSchema)
      .extend({
        purchase_request_detail: z.object({
          add: z.array(CreatePurchaseRequestDetailSchema).optional(),
          update: z.array(CreatePurchaseRequestDetailSchema.extend({
            id: z.string().uuid(),
          })).optional(),
          remove: z.array(z.object({ id: z.string() })).optional()
        })
      })
  }),
  z.object({
    stage_role: z.literal(enum_stage_role.approve),
    details: z.array(ApprovePurchaseRequestDetailSchema.omit({ stage_status: true, stage_message: true })),
  }),
  z.object({
    stage_role: z.literal(enum_stage_role.purchase),
    details: z.array(PurchaseRoleApprovePurchaseRequestDetailSchema.omit({ stage_status: true, stage_message: true }))
  })
])

// @ts-expect-error discriminatedUnion not supported by createZodDto
export class ApproveByStageRoleDto2 extends createZodDto(ApproveByStageRoleSchema2) { }
// @ts-expect-error discriminatedUnion not supported by createZodDto
export class SavePurchaseRequestDto extends createZodDto(SavePurchaseRequestSchema) { }

export const SwipeApprovePurchaseRequestSchema = z.object({
  pr_ids: z.array(z.string().uuid()).min(1, { message: 'At least one PR ID is required' }),
})
export class SwipeApprovePurchaseRequestDto extends createZodDto(SwipeApprovePurchaseRequestSchema) { }

export const SwipeRejectPurchaseRequestSchema = z.object({
  pr_ids: z.array(z.string().uuid()).min(1, { message: 'At least one PR ID is required' }),
  reject_message: z.string().min(1, { message: 'Reject message is required' }),
})
export class SwipeRejectPurchaseRequestDto extends createZodDto(SwipeRejectPurchaseRequestSchema) { }