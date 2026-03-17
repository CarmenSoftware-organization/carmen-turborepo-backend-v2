import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
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
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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
@ApiTags('Application - Inventory Transaction (TEST)')
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
      'Direct test endpoint for FIFO cost-layer logic. DELETE when GRN approve integration is verified.',
    operationId: 'testCreateInventoryTransactionFromGrn',
    tags: ['[Method] Post'],
    deprecated: true,
  })
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

  /**
   * POST /api/:bu_code/inventory-transaction/test-issue
   * Body: { "product_id": "uuid", "location_id": "uuid", "location_code": "WH-01", "qty": 10 }
   */
  @Post('test-issue')
  @Serialize(InventoryTransactionMutationResponseSchema)
  @ApiOperation({
    summary: 'TEST — Issue stock (consume from inventory)',
    operationId: 'testIssueTransaction',
    tags: ['[Method] Post'],
  })
  @HttpCode(HttpStatus.OK)
  async testIssue(
    @Param('bu_code') bu_code: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.testIssue(body, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * POST /api/:bu_code/inventory-transaction/test-adjustment-in
   * Body: { "product_id": "uuid", "location_id": "uuid", "location_code": "WH-01", "qty": 5, "cost_per_unit": 10.50 }
   */
  @Post('test-adjustment-in')
  @Serialize(InventoryTransactionMutationResponseSchema)
  @ApiOperation({
    summary: 'TEST — Adjustment in (add stock)',
    operationId: 'testAdjustmentInTransaction',
    tags: ['[Method] Post'],
  })
  @HttpCode(HttpStatus.OK)
  async testAdjustmentIn(
    @Param('bu_code') bu_code: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.testAdjustmentIn(body, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * POST /api/:bu_code/inventory-transaction/test-adjustment-out
   * Body: { "product_id": "uuid", "location_id": "uuid", "location_code": "WH-01", "qty": 3 }
   */
  @Post('test-adjustment-out')
  @Serialize(InventoryTransactionMutationResponseSchema)
  @ApiOperation({
    summary: 'TEST — Adjustment out (remove stock)',
    operationId: 'testAdjustmentOutTransaction',
    tags: ['[Method] Post'],
  })
  @HttpCode(HttpStatus.OK)
  async testAdjustmentOut(
    @Param('bu_code') bu_code: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.testAdjustmentOut(body, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * POST /api/:bu_code/inventory-transaction/test-transfer
   * Body: { "product_id": "uuid", "qty": 5, "from_location_id": "uuid", "from_location_code": "WH-01", "to_location_id": "uuid", "to_location_code": "WH-02" }
   */
  @Post('test-transfer')
  @Serialize(InventoryTransactionMutationResponseSchema)
  @ApiOperation({
    summary: 'TEST — Transfer stock between locations',
    operationId: 'testTransferTransaction',
    tags: ['[Method] Post'],
  })
  @HttpCode(HttpStatus.OK)
  async testTransfer(
    @Param('bu_code') bu_code: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.testTransfer(body, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * POST /api/:bu_code/inventory-transaction/test-eop-in
   * Body: { "product_id": "uuid", "location_id": "uuid", "location_code": "WH-01", "qty": 5, "cost_per_unit": 10.50 }
   *
   * EOP In — End of Period adjustment (increase).
   * When period closes, workers count physical stock. If system qty < actual qty,
   * use this to increase system qty to match reality.
   */
  @Post('test-eop-in')
  @Serialize(InventoryTransactionMutationResponseSchema)
  @ApiOperation({
    summary: 'TEST — EOP In (end-of-period stock increase)',
    operationId: 'testEopInTransaction',
    tags: ['[Method] Post'],
  })
  @HttpCode(HttpStatus.OK)
  async testEopIn(
    @Param('bu_code') bu_code: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.testEopIn(body, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * POST /api/:bu_code/inventory-transaction/test-eop-out
   * Body: { "product_id": "uuid", "location_id": "uuid", "location_code": "WH-01", "qty": 3 }
   *
   * EOP Out — End of Period adjustment (decrease).
   * When period closes, workers count physical stock. If system qty > actual qty,
   * use this to decrease system qty to match reality.
   */
  @Post('test-eop-out')
  @Serialize(InventoryTransactionMutationResponseSchema)
  @ApiOperation({
    summary: 'TEST — EOP Out (end-of-period stock decrease)',
    operationId: 'testEopOutTransaction',
    tags: ['[Method] Post'],
  })
  @HttpCode(HttpStatus.OK)
  async testEopOut(
    @Param('bu_code') bu_code: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.testEopOut(body, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * POST /api/:bu_code/inventory-transaction/test-credit-note-qty
   * Body:
   * {
   *   "grn_id": "uuid (the GRN that originated the lots)",
   *   "detail_items": [
   *     {
   *       "product_id": "uuid",
   *       "location_id": "uuid",
   *       "location_code": "WH-01",
   *       "qty": 10,
   *       "cost_per_unit": 100
   *     }
   *   ]
   * }
   */
  @Post('test-credit-note-qty')
  @Serialize(InventoryTransactionMutationResponseSchema)
  @ApiOperation({
    summary: 'TEST — Credit Note Quantity (deduct stock from GRN lot)',
    operationId: 'testCreditNoteQtyTransaction',
    tags: ['[Method] Post'],
  })
  @HttpCode(HttpStatus.OK)
  async testCreditNoteQty(
    @Param('bu_code') bu_code: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.testCreditNoteQty(body, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * POST /api/:bu_code/inventory-transaction/test-credit-note-amount
   * Body:
   * {
   *   "grn_id": "uuid (the GRN that originated the lots)",
   *   "detail_items": [
   *     {
   *       "product_id": "uuid",
   *       "location_id": "uuid",
   *       "location_code": "WH-01",
   *       "amount": 10
   *     }
   *   ]
   * }
   */
  @Post('test-credit-note-amount')
  @Serialize(InventoryTransactionMutationResponseSchema)
  @ApiOperation({
    summary: 'TEST — Credit Note Amount (adjust cost by reversing and re-receiving)',
    operationId: 'testCreditNoteAmountTransaction',
    tags: ['[Method] Post'],
  })
  @HttpCode(HttpStatus.OK)
  async testCreditNoteAmount(
    @Param('bu_code') bu_code: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.testCreditNoteAmount(body, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * GET /api/:bu_code/inventory-transaction/cost-layers?product_id=xxx&location_id=xxx
   */
  @Get('cost-layers')
  @ApiOperation({
    summary: 'TEST — View cost layers for a product',
    operationId: 'getCostLayers',
    tags: ['[Method] Get'],
  })
  @ApiQuery({ name: 'product_id', required: false, type: String })
  @ApiQuery({ name: 'location_id', required: false, type: String })
  async getCostLayers(
    @Param('bu_code') bu_code: string,
    @Query('product_id') product_id: string | undefined,
    @Query('location_id') location_id: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.getCostLayers(product_id, location_id, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * GET /api/:bu_code/inventory-transaction/stock-balance?product_id=xxx
   */
  @Get('stock-balance')
  @ApiOperation({
    summary: 'TEST — View aggregated stock balance per product/location',
    operationId: 'getStockBalance',
    tags: ['[Method] Get'],
  })
  @ApiQuery({ name: 'product_id', required: false, type: String })
  async getStockBalance(
    @Param('bu_code') bu_code: string,
    @Query('product_id') product_id: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.getStockBalance(product_id, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
   * GET /api/:bu_code/inventory-transaction/locations
   */
  @Get('locations')
  @ApiOperation({
    summary: 'TEMP — List active locations for test frontend',
    operationId: 'getLocationsForTest',
    tags: ['[Method] Get'],
  })
  async getLocations(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.getLocations(user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
   * GET /api/:bu_code/inventory-transaction/products
   */
  @Get('products')
  @ApiOperation({
    summary: 'TEMP — List all products for test frontend',
    operationId: 'getProductsForTest',
    tags: ['[Method] Get'],
  })
  async getProducts(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.getProducts(user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
   * GET /api/:bu_code/inventory-transaction/locations/:location_id/products
   */
  @Get('locations/:location_id/products')
  @ApiOperation({
    summary: 'TEMP — List products at a location for test frontend',
    operationId: 'getProductsByLocationForTest',
    tags: ['[Method] Get'],
  })
  async getProductsByLocation(
    @Param('bu_code') bu_code: string,
    @Param('location_id') location_id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.getProductsByLocation(location_id, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
   * GET /api/:bu_code/inventory-transaction/calculation-method
   */
  @Get('calculation-method')
  @ApiOperation({
    summary: 'TEMP — Get calculation method (fifo/average) for this BU',
    operationId: 'getCalculationMethodForTest',
    tags: ['[Method] Get'],
  })
  async getCalculationMethod(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.getCalculationMethod(user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * ⚠️ TEST ONLY — DELETE.
   * POST /api/:bu_code/inventory-transaction/clear-product
   * Body: { "product_id": "uuid" }
   */
  @Post('clear-product')
  @ApiOperation({
    summary: 'TEST — Clear all transactions for a product',
    operationId: 'clearProductTransactions',
    tags: ['[Method] Post'],
    deprecated: true,
  })
  @HttpCode(HttpStatus.OK)
  async clearProductTransactions(
    @Param('bu_code') bu_code: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.inventoryTransactionService.clearProductTransactions(body, user_id, bu_code);
    this.respond(res, result);
  }
}
