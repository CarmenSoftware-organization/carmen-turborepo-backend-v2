import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ExtraCostDetailItemRequest {
  @ApiProperty({ description: 'Extra cost type ID' })
  extra_cost_type_id: string;

  @ApiPropertyOptional({ description: 'Name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Amount' })
  amount?: number;

  @ApiPropertyOptional({ description: 'Tax profile ID' })
  tax_profile_id?: string;

  @ApiPropertyOptional({ description: 'Tax profile name' })
  tax_profile_name?: string;

  @ApiPropertyOptional({ description: 'Tax rate' })
  tax_rate?: number;

  @ApiPropertyOptional({ description: 'Tax amount' })
  tax_amount?: number;

  @ApiPropertyOptional({ description: 'Is tax adjustment' })
  is_tax_adjustment?: boolean;
}

export class ExtraCostCreateRequest {
  @ApiPropertyOptional({ description: 'Name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Good received note ID' })
  good_received_note_id?: string;

  @ApiPropertyOptional({ description: 'Allocate extra cost type' })
  allocate_extra_cost_type?: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Detail items', type: [ExtraCostDetailItemRequest] })
  details?: ExtraCostDetailItemRequest[];
}

class ExtraCostDetailUpdateItemRequest extends ExtraCostDetailItemRequest {
  @ApiPropertyOptional({ description: 'Detail ID (for update)' })
  id?: string;
}

class ExtraCostDetailOperations {
  @ApiPropertyOptional({ description: 'Detail items to add', type: [ExtraCostDetailItemRequest] })
  add?: ExtraCostDetailItemRequest[];

  @ApiPropertyOptional({ description: 'Detail items to update', type: [ExtraCostDetailUpdateItemRequest] })
  update?: ExtraCostDetailUpdateItemRequest[];

  @ApiPropertyOptional({ description: 'Detail IDs to delete', type: [String] })
  delete?: string[];
}

export class ExtraCostUpdateRequest {
  @ApiPropertyOptional({ description: 'Name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Good received note ID' })
  good_received_note_id?: string;

  @ApiPropertyOptional({ description: 'Allocate extra cost type' })
  allocate_extra_cost_type?: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Detail operations (add/update/delete)', type: ExtraCostDetailOperations })
  details?: ExtraCostDetailOperations;
}
