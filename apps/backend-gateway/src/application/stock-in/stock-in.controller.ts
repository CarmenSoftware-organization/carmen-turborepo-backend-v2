import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Req,
  Res,
  Query,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { StockInService } from './stock-in.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateStockInSwaggerDto,
  UpdateStockInSwaggerDto,
  CreateStockInDetailSwaggerDto,
  UpdateStockInDetailSwaggerDto,
} from './swagger/request';
import {
  BaseHttpController,
  Serialize,
  StockInDetailResponseSchema,
  StockInListItemResponseSchema,
  StockInMutationResponseSchema,
  StockInCreateDto,
  StockInUpdateDto,
  StockInDetailCreateDto,
  StockInDetailUpdateDto,
  IStockInUpdate,
} from '@/common';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/:bu_code/stock-in')
@ApiTags('Inventory')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class StockInController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(StockInController.name);

  constructor(private readonly stockInService: StockInService) {
    super();
  }

  /**
   * Retrieves full details of a stock-in record including all line items and
   * quantities added to inventory. Used to review manual inventory adjustments.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('stockIn.findOne'))
  @Serialize(StockInDetailResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a Stock In by ID',
    description: 'Retrieves the full details of a stock-in transaction including all items added to inventory, their quantities, costs, and the reason for the addition (e.g., GRN receipt, return, or manual adjustment).',
    operationId: 'findOneStockIn',
    tags: ['Inventory', 'Stock In'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock In ID' },
    ],
    responses: {
      200: { description: 'The Stock In was successfully retrieved' },
      404: { description: 'The Stock In was not found' },
    },
  })
  async findOne(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findOne', id, version }, StockInController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockInService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Lists all stock-in records for the business unit with pagination.
   * Used by inventory managers to track manual additions to stock levels.
   */
  @Get()
  @UseGuards(new AppIdGuard('stockIn.findAll'))
  @Serialize(StockInListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all Stock In records',
    description: 'Lists all inventory addition records for the business unit with pagination and filtering. Used by inventory managers to track all stock additions from goods receiving, returns, and manual adjustments.',
    operationId: 'findAllStockIn',
    tags: ['Inventory', 'Stock In'],
    responses: {
      200: { description: 'Stock In records retrieved successfully' },
      404: { description: 'No Stock In records found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findAll', query, version }, StockInController.name);

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.stockInService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  /**
   * Creates a new stock-in record to manually add items to inventory.
   * Used for inventory adjustments such as opening balances, found items,
   * or corrections outside the normal GRN receiving process.
   */
  @Post()
  @UseGuards(new AppIdGuard('stockIn.create'))
  @Serialize(StockInMutationResponseSchema)
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a Stock In',
    description: 'Records an inventory addition to increase stock levels. Used for manual adjustments such as recording returned items, correcting inventory discrepancies found during physical counts, or adding opening stock balances.',
    operationId: 'createStockIn',
    tags: ['Inventory', 'Stock In'],
    responses: {
      201: { description: 'The Stock In was successfully created' },
      400: { description: 'Invalid request body' },
    },
  })
  @ApiBody({ type: CreateStockInSwaggerDto })
  async create(
    @Body() createDto: StockInCreateDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'create', createDto, version }, StockInController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockInService.create(createDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Updates an existing stock-in record's header or line item details
   * while it is still in draft status.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('stockIn.update'))
  @Serialize(StockInMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a Stock In',
    description: 'Modifies an existing stock-in record to correct quantities, costs, or item details before the transaction is finalized. Used when receiving staff need to amend an inventory addition.',
    operationId: 'updateStockIn',
    tags: ['Inventory', 'Stock In'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock In ID' },
    ],
    responses: {
      200: { description: 'The Stock In was successfully updated' },
      404: { description: 'The Stock In was not found' },
    },
  })
  @ApiBody({ type: UpdateStockInSwaggerDto })
  async update(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: StockInUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'update', id, updateDto, version }, StockInController.name);

    const { user_id } = ExtractRequestHeader(req);
    const data: IStockInUpdate = { ...updateDto, id };
    const result = await this.stockInService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Removes a draft stock-in record that was created in error or is no longer needed.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('stockIn.delete'))
  @Serialize(StockInMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a Stock In',
    description: 'Removes a stock-in record that was created in error. Only applicable to draft transactions that have not yet been committed to inventory.',
    operationId: 'deleteStockIn',
    tags: ['Inventory', 'Stock In'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock In ID' },
    ],
    responses: {
      200: { description: 'The Stock In was successfully deleted' },
      404: { description: 'The Stock In was not found' },
    },
  })
  async delete(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'delete', id, version }, StockInController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockInService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  // ==================== Stock In Detail CRUD ====================

  /**
   * Lists all line items for a specific stock-in record, showing which products
   * and quantities are being added to inventory.
   */
  @Get(':id/details')
  @UseGuards(new AppIdGuard('stockIn.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all details for a Stock In',
    description: 'Lists all individual items being added to inventory in this stock-in transaction, including product details, quantities, unit costs, and storage locations.',
    operationId: 'findAllStockInDetails',
    tags: ['Inventory', 'Stock In'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock In ID' },
    ],
    responses: {
      200: { description: 'Stock In details retrieved successfully' },
      404: { description: 'Stock In not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findDetailsByStockInId(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findDetailsByStockInId', id, version }, StockInController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockInService.findDetailsByStockInId(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Retrieves a single stock-in line item with full product and quantity details.
   */
  @Get(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('stockIn.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a specific Stock In detail by ID',
    description: 'Retrieves a specific item line from a stock-in transaction with full product, quantity, and cost details. Used to inspect or verify a particular inventory addition.',
    operationId: 'findStockInDetailById',
    tags: ['Inventory', 'Stock In'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock In ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Stock In Detail ID' },
    ],
    responses: {
      200: { description: 'Stock In detail retrieved successfully' },
      404: { description: 'Stock In detail not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findDetailById(
    @Param('id') id: string,
    @Param('detail_id') detailId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findDetailById', id, detailId, version }, StockInController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockInService.findDetailById(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Adds a new line item to a draft stock-in record, specifying a product
   * and quantity to be added to inventory.
   */
  @Post(':id/details')
  @UseGuards(new AppIdGuard('stockIn.update'))
  @Serialize(StockInMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new Stock In detail',
    description: 'Adds a new item line to a draft stock-in transaction, specifying the product, quantity, and cost to be added to inventory.',
    operationId: 'createStockInDetail',
    tags: ['Inventory', 'Stock In'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock In ID' },
    ],
    responses: {
      201: { description: 'Stock In detail created successfully' },
      400: { description: 'Cannot add detail to non-draft Stock In' },
      404: { description: 'Stock In not found' },
    },
  })
  @ApiBody({ type: CreateStockInDetailSwaggerDto })
  @HttpCode(HttpStatus.CREATED)
  async createDetail(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: StockInDetailCreateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'createDetail', id, data, version }, StockInController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockInService.createDetail(id, data, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Updates an existing stock-in line item's product or quantity.
   * Only applicable while the stock-in record is in draft status.
   */
  @Put(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('stockIn.update'))
  @Serialize(StockInMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a Stock In detail',
    description: 'Modifies an item line on a draft stock-in transaction to correct the product, quantity, or cost details before the transaction is committed to inventory.',
    operationId: 'updateStockInDetail',
    tags: ['Inventory', 'Stock In'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock In ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Stock In Detail ID' },
    ],
    responses: {
      200: { description: 'Stock In detail updated successfully' },
      400: { description: 'Cannot update detail of non-draft Stock In' },
      404: { description: 'Stock In detail not found' },
    },
  })
  @ApiBody({ type: UpdateStockInDetailSwaggerDto })
  @HttpCode(HttpStatus.OK)
  async updateDetail(
    @Param('id') id: string,
    @Param('detail_id') detailId: string,
    @Param('bu_code') bu_code: string,
    @Body() data: StockInDetailUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'updateDetail', id, detailId, data, version }, StockInController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockInService.updateDetail(detailId, data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Removes a line item from a draft stock-in record.
   */
  @Delete(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('stockIn.update'))
  @Serialize(StockInMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a Stock In detail',
    description: 'Removes an item line from a draft stock-in transaction when the item was added in error or is no longer needed in this inventory addition.',
    operationId: 'deleteStockInDetail',
    tags: ['Inventory', 'Stock In'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock In ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Stock In Detail ID' },
    ],
    responses: {
      200: { description: 'Stock In detail deleted successfully' },
      400: { description: 'Cannot delete detail of non-draft Stock In' },
      404: { description: 'Stock In detail not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async deleteDetail(
    @Param('id') id: string,
    @Param('detail_id') detailId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'deleteDetail', id, detailId, version }, StockInController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockInService.deleteDetail(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }
}
