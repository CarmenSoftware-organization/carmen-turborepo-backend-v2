import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================================================
// Create GRN
// ============================================================================

export class CreateGoodReceivedNoteSwaggerDto {
  @ApiProperty({ description: 'Document type (enum: purchase_order, manual, consignment, etc.)', example: 'purchase_order' })
  doc_type: string;

  @ApiPropertyOptional({ description: 'GRN date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  grn_date?: string;

  @ApiPropertyOptional({ description: 'Invoice number', example: 'INV-2026-0100' })
  invoice_no?: string;

  @ApiPropertyOptional({ description: 'Invoice date (ISO 8601)', example: '2026-03-09T00:00:00.000Z' })
  invoice_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Goods received from ABC Supplies' })
  description?: string;

  @ApiPropertyOptional({ description: 'Document status (enum)', example: 'draft' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Exchange rate date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  exchange_rate_date?: string;

  @ApiPropertyOptional({ description: 'Workflow ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workflow_id?: string;

  @ApiPropertyOptional({ description: 'Is consignment', example: false })
  is_consignment?: boolean;

  @ApiPropertyOptional({ description: 'Is cash purchase', example: false })
  is_cash?: boolean;

  @ApiPropertyOptional({ description: 'Signature image URL', example: 'https://example.com/signature.png' })
  signature_image_url?: string;

  @ApiPropertyOptional({ description: 'Received by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  received_by_id?: string;

  @ApiPropertyOptional({ description: 'Received by name' })
  received_by_name?: string;

  @ApiPropertyOptional({ description: 'Received at date (ISO 8601)', example: '2026-03-10T10:30:00.000Z' })
  received_at?: string;

  @ApiPropertyOptional({ description: 'Credit term ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  credit_term_id?: string;

  @ApiPropertyOptional({ description: 'Credit term name', example: 'Net 30' })
  credit_term_name?: string;

  @ApiPropertyOptional({ description: 'Credit term days', example: 30 })
  credit_term_days?: number;

  @ApiPropertyOptional({ description: 'Payment due date (ISO 8601)', example: '2026-04-10T00:00:00.000Z' })
  payment_due_date?: string;

  @ApiPropertyOptional({ description: 'Is active', example: true, default: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Expired date (ISO 8601)', example: '2026-12-31T00:00:00.000Z' })
  expired_date?: string;

  @ApiPropertyOptional({ description: 'Discount rate', example: 0 })
  discount_rate?: number;

  @ApiPropertyOptional({ description: 'Discount amount', example: 0 })
  discount_amount?: number;

  @ApiPropertyOptional({ description: 'Is discount adjustment', example: false })
  is_discount_adjustment?: boolean;

  @ApiPropertyOptional({ description: 'Base discount amount', example: 0 })
  base_discount_amount?: number;

  @ApiPropertyOptional({ description: 'Note', example: 'Please verify item counts' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: {} })
  dimension?: unknown;

  @ApiPropertyOptional({
    description: 'GRN detail line items - contains "add" array of items to receive',
    example: {
      add: [
        {
          purchase_order_detail_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          product_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
          location_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
          tax_profile_id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
          tax_profile_name: 'VAT 7%',
          tax_rate: 7,
          tax_amount: 70,
          base_tax_amount: 70,
          total_amount: 1070,
        },
      ],
    },
  })
  good_received_note_detail?: {
    add?: {
      purchase_order_detail_id?: string;
      product_id?: string;
      location_id?: string;
      tax_profile_id?: string;
      tax_profile_name?: string;
      tax_rate?: number;
      tax_amount?: number;
      base_tax_amount?: number;
      total_amount?: number;
    }[];
  };

  @ApiPropertyOptional({
    description: 'Extra cost - shipping, handling, or other additional charges',
    example: {
      name: 'Shipping Fee',
      allocate_extracost_type: 'by_amount',
      note: 'Express delivery charge',
      info: {},
      dimension: {},
      extra_cost_detail: {
        add: [
          {
            extra_cost_type_id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
            amount: 500,
            tax_profile_id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
            tax_profile_name: 'VAT 7%',
            tax_rate: 7,
            tax_amount: 35,
            base_tax_amount: 35,
            total_amount: 535,
            tax_type: 'inclusive',
            note: 'Express shipping',
            info: {},
            dimension: {},
          },
        ],
      },
    },
  })
  extra_cost?: {
    name?: string;
    allocate_extracost_type?: string;
    note?: string;
    info?: unknown;
    dimension?: unknown;
    extra_cost_detail?: {
      add?: {
        extra_cost_type_id: string;
        amount?: number;
        tax_profile_id?: string;
        tax_profile_name?: string;
        tax_rate?: number;
        tax_amount?: number;
        base_tax_amount?: number;
        total_amount?: number;
        tax_type?: string;
        note?: string;
        info?: unknown;
        dimension?: unknown;
      }[];
    };
  };
}

// ============================================================================
// Update GRN
// ============================================================================

export class UpdateGoodReceivedNoteSwaggerDto {
  @ApiPropertyOptional({ description: 'Name' })
  name?: string;

  @ApiPropertyOptional({ description: 'GRN number (system generated)' })
  grn_no?: string;

  @ApiPropertyOptional({ description: 'Invoice number', example: 'INV-2026-0100' })
  invoice_no?: string;

  @ApiPropertyOptional({ description: 'Invoice date (ISO 8601)', example: '2026-03-09T00:00:00.000Z' })
  invoice_f?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Updated GRN description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Document status (enum)', example: 'draft' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'Document type (enum)', example: 'purchase_order' })
  doc_type?: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Currency rate', example: 1.0 })
  currency_rate?: number;

  @ApiPropertyOptional({ description: 'Is consignment', example: false })
  is_consignment?: boolean;

  @ApiPropertyOptional({ description: 'Is cash purchase', example: false })
  is_cash?: boolean;

  @ApiPropertyOptional({ description: 'Signature image URL', example: 'https://example.com/signature.png' })
  signature_image_url?: string;

  @ApiPropertyOptional({ description: 'Received by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  received_by_id?: string;

  @ApiPropertyOptional({ description: 'Received at date (ISO 8601)', example: '2026-03-10T10:30:00.000Z' })
  received_at?: string;

  @ApiPropertyOptional({ description: 'Credit term ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  credit_term_id?: string;

  @ApiPropertyOptional({ description: 'Payment due date (ISO 8601)', example: '2026-04-10T00:00:00.000Z' })
  payment_due_date?: string;

  @ApiPropertyOptional({ description: 'Is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Note', example: 'Updated note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: {} })
  dimension?: unknown;

  @ApiPropertyOptional({
    description: 'GRN detail line items - add new items, update existing, or remove by ID',
    example: {
      add: [
        {
          purchase_order_detail_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          product_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
          location_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
          tax_profile_id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
          tax_profile_name: 'VAT 7%',
          tax_rate: 7,
          tax_amount: 70,
          base_tax_amount: 70,
          total_amount: 1070,
        },
      ],
      update: [
        {
          id: 'f6a7b8c9-d0e1-2345-abcd-456789012345',
          good_received_note_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          sequence_no: 1,
          product_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
          location_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
          tax_profile_id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
          tax_profile_name: 'VAT 7%',
          tax_rate: 7,
          tax_amount: 70,
          base_tax_amount: 70,
          total_amount: 1070,
          tax_type: 'inclusive',
        },
      ],
      remove: [
        { id: 'g7b8c9d0-e1f2-3456-bcde-567890123456' },
      ],
    },
  })
  good_received_note_detail?: {
    add?: {
      purchase_order_detail_id?: string;
      product_id?: string;
      location_id?: string;
      tax_profile_id?: string;
      tax_profile_name?: string;
      tax_rate?: number;
      tax_amount?: number;
      base_tax_amount?: number;
      total_amount?: number;
    }[];
    update?: {
      id: string;
      good_received_note_id?: string;
      sequence_no?: number;
      product_id?: string;
      location_id?: string;
      tax_profile_id?: string;
      tax_profile_name?: string;
      tax_rate?: number;
      tax_amount?: number;
      base_tax_amount?: number;
      total_amount?: number;
      tax_type?: string;
    }[];
    remove?: {
      id: string;
    }[];
  };

  @ApiPropertyOptional({
    description: 'Extra cost - add new, update existing, or remove by ID',
    example: {
      id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      name: 'Shipping Fee',
      allocate_extracost_type: 'by_amount',
      extra_cost_detail: {
        add: [
          {
            extra_cost_type_id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
            amount: 500,
            tax_profile_id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
            tax_rate: 7,
            tax_amount: 35,
            total_amount: 535,
          },
        ],
        update: [
          {
            id: 'f6a7b8c9-d0e1-2345-abcd-456789012345',
            extra_cost_type_id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
            amount: 600,
          },
        ],
        remove: [
          { id: 'g7b8c9d0-e1f2-3456-bcde-567890123456' },
        ],
      },
    },
  })
  extra_cost?: {
    id?: string;
    name?: string;
    allocate_extracost_type?: string;
    extra_cost_detail?: {
      add?: {
        extra_cost_type_id: string;
        amount?: number;
        tax_profile_id?: string;
        tax_profile_name?: string;
        tax_rate?: number;
        tax_amount?: number;
        base_tax_amount?: number;
        total_amount?: number;
        tax_type?: string;
        note?: string;
        info?: unknown;
        dimension?: unknown;
      }[];
      update?: {
        id: string;
        extra_cost_type_id: string;
        amount?: number;
        tax_profile_id?: string;
        tax_profile_name?: string;
        tax_rate?: number;
        tax_amount?: number;
        base_tax_amount?: number;
        total_amount?: number;
        tax_type?: string;
        note?: string;
        info?: unknown;
        dimension?: unknown;
      }[];
      remove?: {
        id: string;
      }[];
    };
  };
}

// ============================================================================
// Other GRN actions
// ============================================================================

export class RejectGoodReceivedNoteSwaggerDto {
  @ApiPropertyOptional({ description: 'Reason for rejection', example: 'Items damaged during transit' })
  reason?: string;
}

export class ConfirmGoodReceivedNoteSwaggerDto {
  @ApiPropertyOptional({ description: 'Confirmation data (JSON)', example: {} })
  data?: unknown;
}

export class CreateGrnCommentSwaggerDto {
  @ApiProperty({ description: 'Comment text', example: 'Checked all items, quantities match.' })
  comment: string;
}
