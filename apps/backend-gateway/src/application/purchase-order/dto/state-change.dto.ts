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

// ==================== Submit PO ====================

export const SubmitPurchaseOrderDetailSchema = z.object({
  id: z.string().uuid(),
  stage_status: z.nativeEnum(stage_status),
  stage_message: z.string().nullable(),
});

export const SubmitPurchaseOrderSchema = z.object({
  stage_role: z.nativeEnum(stage_role),
  details: z.array(SubmitPurchaseOrderDetailSchema).min(1),
});

export class SubmitPurchaseOrderDto extends createZodDto(SubmitPurchaseOrderSchema) {}

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

// ==================== Save PO (add/update/remove details) ====================

const SavePurchaseOrderDetailSchema = z.object({
  sequence: z.number().int().positive(),
  product_id: z.string().uuid(),
  product_name: z.string().optional(),
  product_local_name: z.string().optional(),
  order_unit_id: z.string().uuid(),
  order_unit_name: z.string().optional(),
  order_unit_conversion_factor: z.number().optional().default(1),
  order_qty: z.number().positive(),
  base_unit_id: z.string().uuid().optional(),
  base_unit_name: z.string().optional(),
  base_qty: z.number().nonnegative().optional(),

  // Pricing
  price: z.number().nonnegative().optional().default(0),
  sub_total_price: z.number().nonnegative().optional().default(0),
  net_amount: z.number().nonnegative().optional().default(0),
  total_price: z.number().nonnegative().optional().default(0),

  // Tax
  tax_profile_id: z.string().uuid().optional(),
  tax_profile_name: z.string().optional(),
  tax_rate: z.number().nonnegative().optional().default(0),
  tax_amount: z.number().nonnegative().optional().default(0),
  is_tax_adjustment: z.boolean().optional().default(false),

  // Discount
  discount_rate: z.number().nonnegative().optional().default(0),
  discount_amount: z.number().nonnegative().optional().default(0),
  is_discount_adjustment: z.boolean().optional().default(false),

  // FOC
  is_foc: z.boolean().optional().default(false),

  // PR detail linkage
  pr_detail: z.array(z.object({
    pr_detail_id: z.string().uuid(),
    order_qty: z.number().positive(),
    order_unit_id: z.string().uuid(),
    order_unit_name: z.string().optional(),
    order_base_qty: z.number().nonnegative(),
    order_base_unit_id: z.string().uuid().optional(),
    order_base_unit_name: z.string().optional(),
  })).min(1),

  // Optional fields
  description: z.string().optional(),
  note: z.string().optional(),
});

const UpdateSavePurchaseOrderDetailSchema = SavePurchaseOrderDetailSchema.extend({
  id: z.string().uuid(),
});

export const SavePurchaseOrderSchema = z.object({
  // Header fields (all optional for save)
  vendor_id: z.string().uuid().optional(),
  vendor_name: z.string().optional(),
  delivery_date: z.string().optional(),
  currency_id: z.string().uuid().optional(),
  currency_code: z.string().optional(),
  exchange_rate: z.number().positive().optional(),
  description: z.string().optional(),
  order_date: z.string().optional(),
  credit_term_id: z.string().uuid().optional(),
  credit_term_name: z.string().optional(),
  credit_term_value: z.number().int().nonnegative().optional(),
  buyer_id: z.string().uuid().optional(),
  buyer_name: z.string().optional(),
  email: z.string().email().optional(),
  remarks: z.string().optional(),
  note: z.string().optional(),
  workflow_id: z.string().uuid().optional(),

  // Details with add/update/remove
  details: z.object({
    add: z.array(SavePurchaseOrderDetailSchema).optional(),
    update: z.array(UpdateSavePurchaseOrderDetailSchema).optional(),
    remove: z.array(z.object({ id: z.string().uuid() })).optional(),
  }).optional(),
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
  vendor_id: '00000000-0000-0000-0000-000000000100',
  delivery_date: '2024-02-01T00:00:00Z',
  details: {
    add: [
      {
        sequence: 2,
        product_id: '00000000-0000-0000-0000-000000000002',
        order_unit_id: '00000000-0000-0000-0000-000000000010',
        order_qty: 50,
        price: 30,
        sub_total_price: 1500,
        net_amount: 1500,
        total_price: 1605,
        tax_rate: 7,
        tax_amount: 105,
        pr_detail: [
          {
            pr_detail_id: '00000000-0000-0000-0000-000000000201',
            order_qty: 50,
            order_unit_id: '00000000-0000-0000-0000-000000000010',
            order_base_qty: 50,
          },
        ],
      },
    ],
    update: [
      {
        id: '00000000-0000-0000-0000-000000000001',
        sequence: 1,
        product_id: '00000000-0000-0000-0000-000000000001',
        order_unit_id: '00000000-0000-0000-0000-000000000010',
        order_qty: 100,
        price: 50,
        sub_total_price: 5000,
        net_amount: 4750,
        total_price: 5082.5,
        tax_rate: 7,
        tax_amount: 332.5,
        discount_rate: 5,
        discount_amount: 250,
        pr_detail: [
          {
            pr_detail_id: '00000000-0000-0000-0000-000000000200',
            order_qty: 100,
            order_unit_id: '00000000-0000-0000-0000-000000000010',
            order_base_qty: 100,
          },
        ],
      },
    ],
    remove: [
      { id: '00000000-0000-0000-0000-000000000003' },
    ],
  },
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
