import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ExtraCostDetailResponseDto {
  @ApiProperty({ description: 'Detail ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Extra cost ID' })
  extra_cost_id?: string;

  @ApiPropertyOptional({ description: 'Sequence number' })
  sequence_no?: number;

  @ApiPropertyOptional({ description: 'Extra cost type ID' })
  extra_cost_type_id?: string;

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

export class ExtraCostResponseDto {
  @ApiProperty({ description: 'Extra cost ID' })
  id: string;

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

  @ApiPropertyOptional({ description: 'Created timestamp' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID' })
  updated_by_id?: string;

  @ApiPropertyOptional({ description: 'Detail items', type: [ExtraCostDetailResponseDto] })
  tb_extra_cost_detail?: ExtraCostDetailResponseDto[];
}

export class ExtraCostListResponseDto {
  @ApiProperty({ description: 'List of Extra Cost records', type: [ExtraCostResponseDto] })
  data: ExtraCostResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records' })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number' })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page' })
  perpage?: number;
}

export class ExtraCostMutationResponseDto {
  @ApiProperty({ description: 'Extra Cost ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Response message' })
  message?: string;
}
