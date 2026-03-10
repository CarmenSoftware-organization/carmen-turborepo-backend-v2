import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { InventoryTransactionService } from './inventory-transaction.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TestCreateFromGrnRequestDto } from './swagger/request';
import {
  BaseHttpController,
  Serialize,
  InventoryTransactionMutationResponseSchema,
} from '@/common';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

/**
 * ⚠️ TEST ONLY — DELETE this entire controller when GRN approve integration is verified.
 */
@Controller('api/:bu_code/inventory-transaction')
@ApiTags('Inventory')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class InventoryTransactionController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    InventoryTransactionController.name,
  );

  constructor(
    private readonly inventoryTransactionService: InventoryTransactionService,
  ) {
    super();
  }

  /**
   * ⚠️ TEST ONLY — DELETE when GRN approve integration is verified.
   *
   * Direct endpoint to test FIFO inventory transaction creation.
   *
   * POST /api/:bu_code/inventory-transaction/test-create-from-grn
   *
   * Body:
   * {
   *   "grn_id": "uuid",
   *   "grn_no": "GRN-2026-001",
   *   "grn_date": "2026-02-25T00:00:00.000Z",
   *   "detail_items": [
   *     {
   *       "detail_item_id": "uuid",
   *       "product_id": "uuid",
   *       "location_id": "uuid",
   *       "location_code": "WH-01",
   *       "received_base_qty": 30,
   *       "base_net_amount": 100
   *     }
   *   ]
   * }
   */
  @Post('test-create-from-grn')
  @Serialize(InventoryTransactionMutationResponseSchema)
  @ApiOperation({
    summary: '⚠️ TEST ONLY — Create inventory transaction from GRN payload',
    description:
      'Test endpoint that simulates creating FIFO cost-layer inventory transactions from a Goods Received Note payload. Used only for verifying inventory valuation logic before full GRN approval integration is complete.',
    operationId: 'testCreateInventoryTransactionFromGrn',
    tags: ['Inventory', 'Inventory Transaction'],
    deprecated: true,
  })
  @ApiBody({ type: TestCreateFromGrnRequestDto })
  @HttpCode(HttpStatus.OK)
  async testCreateFromGrn(
    @Param('bu_code') bu_code: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      { function: 'testCreateFromGrn' },
      InventoryTransactionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.testCreateFromGrn(
      body,
      user_id,
      bu_code,
    );
    this.respond(res, result);
  }
}
