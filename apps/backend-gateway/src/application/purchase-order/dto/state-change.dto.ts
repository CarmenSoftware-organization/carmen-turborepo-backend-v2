import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// ==================== Enums ====================

enum stage_status {
  submit = 'submit',
  pending = 'pending',
  approve = 'approve',
  reject = 'reject',
  review = 'review',
}

enum stage_role {
  create = 'create',
  approve = 'approve',
  purchase = 'purchase',
  view_only = 'view_only',
  issue = 'issue',
}

// ==================== Approve PO ====================

export const ApprovePurchaseOrderDetailSchema = z.object({
  id: z.string().uuid(),
  stage_status: z.nativeEnum(stage_status),
});

export const ApprovePurchaseOrderSchema = z.object({
  stage_role: z.nativeEnum(stage_role),
  details: z.array(ApprovePurchaseOrderDetailSchema).min(1),
});

export class ApprovePurchaseOrderDto extends createZodDto(ApprovePurchaseOrderSchema) {}

// ==================== Save PO (with qty/price changes) ====================

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
  stage_role: z.nativeEnum(stage_role),
  details: z.array(SavePurchaseOrderDetailSchema).min(1),
});

export class SavePurchaseOrderDto extends createZodDto(SavePurchaseOrderSchema) {}

// ==================== Reject PO ====================

export const RejectPurchaseOrderDetailSchema = z.object({
  id: z.string().uuid(),
  stage_status: z.nativeEnum(stage_status),
  stage_message: z.string().nullable(),
});

export const RejectPurchaseOrderSchema = z.object({
  stage_role: z.nativeEnum(stage_role),
  details: z.array(RejectPurchaseOrderDetailSchema).min(1),
});

export class RejectPurchaseOrderDto extends createZodDto(RejectPurchaseOrderSchema) {}

// ==================== Review PO ====================

export const ReviewPurchaseOrderDetailSchema = z.object({
  id: z.string().uuid(),
  stage_status: z.nativeEnum(stage_status),
  stage_message: z.string().nullable(),
});

export const ReviewPurchaseOrderSchema = z.object({
  stage_role: z.nativeEnum(stage_role),
  des_stage: z.string().nullable(),
  details: z.array(ReviewPurchaseOrderDetailSchema).min(1),
});

export class ReviewPurchaseOrderDto extends createZodDto(ReviewPurchaseOrderSchema) {}

// ==================== Swagger Examples ====================

export const EXAMPLE_APPROVE_PO = {
  stage_role: 'approve',
  details: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      stage_status: 'approve',
    },
  ],
};

export const EXAMPLE_SAVE_PO = {
  stage_role: 'purchase',
  details: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      stage_status: 'pending',
      order_qty: 100,
      order_unit_id: '00000000-0000-0000-0000-000000000010',
      order_unit_name: 'KG',
      order_unit_conversion_factor: 1,
      base_qty: 100,
      base_unit_id: '00000000-0000-0000-0000-000000000010',
      base_unit_name: 'KG',
      price: 50,
      sub_total_price: 5000,
      net_amount: 4750,
      total_price: 5082.5,
      base_price: 50,
      base_sub_total_price: 5000,
      base_net_amount: 4750,
      base_total_price: 5082.5,
      tax_profile_id: '00000000-0000-0000-0000-000000000020',
      tax_profile_name: 'VAT 7%',
      tax_rate: 7,
      tax_amount: 332.5,
      base_tax_amount: 332.5,
      is_tax_adjustment: false,
      discount_rate: 5,
      discount_amount: 250,
      base_discount_amount: 250,
      is_discount_adjustment: false,
      is_foc: false,
    },
  ],
};

export const EXAMPLE_REJECT_PO = {
  stage_role: 'approve',
  details: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      stage_status: 'reject',
      stage_message: 'Price is too high, please renegotiate with vendor',
    },
  ],
};

export const EXAMPLE_REVIEW_PO = {
  stage_role: 'approve',
  des_stage: 'purchase',
  details: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      stage_status: 'review',
      stage_message: 'Please verify the delivery date with vendor',
    },
  ],
};
