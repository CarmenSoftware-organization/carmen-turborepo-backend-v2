import { z } from 'zod';
import { enum_stage_role } from '@repo/prisma-shared-schema-tenant';
import { stage_status } from '@/procurement/purchase-request/dto/purchase-request-detail.dto';
import { createZodDto } from 'nestjs-zod';

// Approve PO Detail schema
export const ApprovePurchaseOrderDetailSchema = z.object({
  id: z.string().uuid(),
  stage_status: z.nativeEnum(stage_status),
});

// Approve PO schema
export const ApprovePurchaseOrderSchema = z.object({
  stage_role: z.nativeEnum(enum_stage_role),
  details: z.array(ApprovePurchaseOrderDetailSchema).min(1),
});

export type ApprovePurchaseOrderDto = z.infer<typeof ApprovePurchaseOrderSchema>;
export type ApprovePurchaseOrderDetailDto = z.infer<typeof ApprovePurchaseOrderDetailSchema>;

export class ApprovePurchaseOrderDtoClass extends createZodDto(ApprovePurchaseOrderSchema) {}

// Save PO Detail schema - with qty/price changes
export const SavePurchaseOrderDetailSchema = z.object({
  id: z.string().uuid(),
  stage_status: z.nativeEnum(stage_status),

  // Order quantities
  order_qty: z.number().nonnegative().optional(),
  order_unit_id: z.string().uuid().optional(),
  order_unit_name: z.string().optional(),
  order_unit_conversion_factor: z.number().optional(),

  // Base quantities
  base_qty: z.number().nonnegative().optional(),
  base_unit_id: z.string().uuid().optional(),
  base_unit_name: z.string().optional(),

  // Pricing
  price: z.number().nonnegative().optional(),
  sub_total_price: z.number().nonnegative().optional(),
  net_amount: z.number().nonnegative().optional(),
  total_price: z.number().nonnegative().optional(),
  base_price: z.number().nonnegative().optional(),
  base_sub_total_price: z.number().nonnegative().optional(),
  base_net_amount: z.number().nonnegative().optional(),
  base_total_price: z.number().nonnegative().optional(),

  // Tax
  tax_profile_id: z.string().uuid().optional(),
  tax_profile_name: z.string().optional(),
  tax_rate: z.number().nonnegative().optional(),
  tax_amount: z.number().nonnegative().optional(),
  base_tax_amount: z.number().nonnegative().optional(),
  is_tax_adjustment: z.boolean().optional(),

  // Discount
  discount_rate: z.number().nonnegative().optional(),
  discount_amount: z.number().nonnegative().optional(),
  base_discount_amount: z.number().nonnegative().optional(),
  is_discount_adjustment: z.boolean().optional(),

  // FOC
  is_foc: z.boolean().optional(),

  // Optional fields
  description: z.string().optional(),
  note: z.string().optional(),
});

export const SavePurchaseOrderSchema = z.object({
  stage_role: z.nativeEnum(enum_stage_role),
  details: z.array(SavePurchaseOrderDetailSchema).min(1),
});

export type SavePurchaseOrderDto = z.infer<typeof SavePurchaseOrderSchema>;
export type SavePurchaseOrderDetailDto = z.infer<typeof SavePurchaseOrderDetailSchema>;

export class SavePurchaseOrderDtoClass extends createZodDto(SavePurchaseOrderSchema) {}

// Reject PO Detail schema
export const RejectPurchaseOrderDetailSchema = z.object({
  id: z.string().uuid(),
  stage_status: z.nativeEnum(stage_status),
  stage_message: z.string().nullable(),
});

// Reject PO schema
export const RejectPurchaseOrderSchema = z.object({
  stage_role: z.nativeEnum(enum_stage_role),
  details: z.array(RejectPurchaseOrderDetailSchema).min(1),
});

export type RejectPurchaseOrderDto = z.infer<typeof RejectPurchaseOrderSchema>;
export type RejectPurchaseOrderDetailDto = z.infer<typeof RejectPurchaseOrderDetailSchema>;

export class RejectPurchaseOrderDtoClass extends createZodDto(RejectPurchaseOrderSchema) {}

// Review PO Detail schema
export const ReviewPurchaseOrderDetailSchema = z.object({
  id: z.string().uuid(),
  stage_status: z.nativeEnum(stage_status),
  stage_message: z.string().nullable(),
});

// Review PO schema
export const ReviewPurchaseOrderSchema = z.object({
  stage_role: z.nativeEnum(enum_stage_role),
  des_stage: z.string().nullable(),
  details: z.array(ReviewPurchaseOrderDetailSchema).min(1),
});

export type ReviewPurchaseOrderDto = z.infer<typeof ReviewPurchaseOrderSchema>;
export type ReviewPurchaseOrderDetailDto = z.infer<typeof ReviewPurchaseOrderDetailSchema>;

export class ReviewPurchaseOrderDtoClass extends createZodDto(ReviewPurchaseOrderSchema) {}
