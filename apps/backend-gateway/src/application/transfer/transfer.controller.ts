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
import { TransferService } from './transfer.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateTransferSwaggerDto,
  UpdateTransferSwaggerDto,
  CreateTransferDetailSwaggerDto,
  UpdateTransferDetailSwaggerDto,
} from './swagger/request';
import {
  BaseHttpController,
  Serialize,
  TransferDetailResponseSchema,
  TransferListItemResponseSchema,
  TransferMutationResponseSchema,
  TransferCreateDto,
  TransferUpdateDto,
  TransferDetailCreateDto,
  TransferDetailUpdateDto,
  ITransferUpdate,
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

@Controller('api/:bu_code/transfer')
@ApiTags('Inventory')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class TransferController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(TransferController.name);

  constructor(private readonly transferService: TransferService) {
    super();
  }

  /**
   * Retrieves full details of an inventory transfer including source/destination
   * locations and all line items being moved between storage locations.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('transfer.findOne'))
  @Serialize(TransferDetailResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a Transfer by ID',
    description: 'Retrieves the full details of an inventory transfer including source and destination locations, all items being moved, and their quantities. Used to review or verify a transfer between stores or departments.',
    operationId: 'findOneTransfer',
    tags: ['Inventory', 'Transfer'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
    ],
    responses: {
      200: { description: 'The Transfer was successfully retrieved' },
      404: { description: 'The Transfer was not found' },
    },
  })
  async findOne(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findOne', id, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Lists all inventory transfer records for the business unit with pagination.
   * Used to track movement of goods between warehouses, kitchens, or store rooms.
   */
  @Get()
  @UseGuards(new AppIdGuard('transfer.findAll'))
  @Serialize(TransferListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all Transfers',
    description: 'Lists all inventory transfer records for the business unit with pagination and filtering. Used by store managers to track item movements between locations such as main store to kitchen, or between hotel properties.',
    operationId: 'findAllTransfers',
    tags: ['Inventory', 'Transfer'],
    responses: {
      200: { description: 'Transfer records retrieved successfully' },
      404: { description: 'No Transfer records found' },
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
    this.logger.debug({ function: 'findAll', query, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.transferService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  /**
   * Creates a new inventory transfer to move items between storage locations
   * (e.g., from central warehouse to kitchen or between store rooms).
   */
  @Post()
  @UseGuards(new AppIdGuard('transfer.create'))
  @Serialize(TransferMutationResponseSchema)
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a Transfer',
    description: 'Initiates an inventory transfer to move items from one storage location to another (e.g., main warehouse to kitchen store, or between hotel properties). Specifies source, destination, and items to be transferred.',
    operationId: 'createTransfer',
    tags: ['Inventory', 'Transfer'],
    responses: {
      201: { description: 'The Transfer was successfully created' },
      400: { description: 'Invalid request body' },
    },
  })
  @ApiBody({ type: CreateTransferSwaggerDto })
  async create(
    @Body() createDto: TransferCreateDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'create', createDto, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.create(createDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Updates an existing transfer record's header or line item details
   * while it is still in draft status.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('transfer.update'))
  @Serialize(TransferMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a Transfer',
    description: 'Modifies a transfer record to adjust items, quantities, or locations before the transfer is finalized. Used when store staff need to correct a transfer before items are physically moved.',
    operationId: 'updateTransfer',
    tags: ['Inventory', 'Transfer'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
    ],
    responses: {
      200: { description: 'The Transfer was successfully updated' },
      404: { description: 'The Transfer was not found' },
    },
  })
  @ApiBody({ type: UpdateTransferSwaggerDto })
  async update(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: TransferUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'update', id, updateDto, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const data: ITransferUpdate = { ...updateDto, id };
    const result = await this.transferService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Removes a draft transfer record that was created in error or is no longer needed.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('transfer.delete'))
  @Serialize(TransferMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a Transfer',
    description: 'Removes a transfer record that was created in error or is no longer needed. Only applicable to draft transfers before items have been physically moved.',
    operationId: 'deleteTransfer',
    tags: ['Inventory', 'Transfer'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
    ],
    responses: {
      200: { description: 'The Transfer was successfully deleted' },
      404: { description: 'The Transfer was not found' },
    },
  })
  async delete(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'delete', id, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  // ==================== Transfer Detail CRUD ====================

  /**
   * Lists all line items for a specific transfer, showing which products
   * and quantities are being moved between locations.
   */
  @Get(':id/details')
  @UseGuards(new AppIdGuard('transfer.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all details for a Transfer',
    description: 'Lists all items included in this transfer with their product details, quantities, and unit information. Used to verify the contents of a transfer before or after physical movement of goods.',
    operationId: 'findAllTransferDetails',
    tags: ['Inventory', 'Transfer'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
    ],
    responses: {
      200: { description: 'Transfer details retrieved successfully' },
      404: { description: 'Transfer not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findDetailsByTransferId(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findDetailsByTransferId', id, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.findDetailsByTransferId(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Retrieves a single transfer line item with full product and quantity details.
   */
  @Get(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('transfer.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a specific Transfer detail by ID',
    description: 'Retrieves a specific item line from a transfer with full product, quantity, and location details. Used to inspect a particular item being moved between locations.',
    operationId: 'findTransferDetailById',
    tags: ['Inventory', 'Transfer'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Transfer Detail ID' },
    ],
    responses: {
      200: { description: 'Transfer detail retrieved successfully' },
      404: { description: 'Transfer detail not found' },
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
    this.logger.debug({ function: 'findDetailById', id, detailId, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.findDetailById(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Adds a new line item to a draft transfer, specifying a product
   * and quantity to be moved between locations.
   */
  @Post(':id/details')
  @UseGuards(new AppIdGuard('transfer.update'))
  @Serialize(TransferMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new Transfer detail',
    description: 'Adds a new item to a draft transfer, specifying the product and quantity to be moved between storage locations.',
    operationId: 'createTransferDetail',
    tags: ['Inventory', 'Transfer'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
    ],
    responses: {
      201: { description: 'Transfer detail created successfully' },
      400: { description: 'Cannot add detail to non-draft Transfer' },
      404: { description: 'Transfer not found' },
    },
  })
  @ApiBody({ type: CreateTransferDetailSwaggerDto })
  @HttpCode(HttpStatus.CREATED)
  async createDetail(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: TransferDetailCreateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'createDetail', id, data, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.createDetail(id, data, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Updates an existing transfer line item's product or quantity.
   * Only applicable while the transfer record is in draft status.
   */
  @Put(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('transfer.update'))
  @Serialize(TransferMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a Transfer detail',
    description: 'Modifies an item line on a draft transfer to correct the product, quantity, or other details before the inventory movement is executed.',
    operationId: 'updateTransferDetail',
    tags: ['Inventory', 'Transfer'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Transfer Detail ID' },
    ],
    responses: {
      200: { description: 'Transfer detail updated successfully' },
      400: { description: 'Cannot update detail of non-draft Transfer' },
      404: { description: 'Transfer detail not found' },
    },
  })
  @ApiBody({ type: UpdateTransferDetailSwaggerDto })
  @HttpCode(HttpStatus.OK)
  async updateDetail(
    @Param('id') id: string,
    @Param('detail_id') detailId: string,
    @Param('bu_code') bu_code: string,
    @Body() data: TransferDetailUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'updateDetail', id, detailId, data, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.updateDetail(detailId, data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Removes a line item from a draft transfer record.
   */
  @Delete(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('transfer.update'))
  @Serialize(TransferMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a Transfer detail',
    description: 'Removes an item from a draft transfer when it was added in error or is no longer needed in this inventory movement.',
    operationId: 'deleteTransferDetail',
    tags: ['Inventory', 'Transfer'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Transfer Detail ID' },
    ],
    responses: {
      200: { description: 'Transfer detail deleted successfully' },
      400: { description: 'Cannot delete detail of non-draft Transfer' },
      404: { description: 'Transfer detail not found' },
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
    this.logger.debug({ function: 'deleteDetail', id, detailId, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.deleteDetail(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }
}
