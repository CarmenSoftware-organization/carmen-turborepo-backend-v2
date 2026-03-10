import {
  Controller,
  Get,
  Param,
  Post,
  Body,
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
import { PhysicalCountService } from './physical-count.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  PhysicalCountCreateRequestDto,
  PhysicalCountUpdateRequestDto,
  PhysicalCountSaveItemsRequestDto,
  PhysicalCountDetailCommentRequestDto,
} from './swagger/request';
import {
  BaseHttpController,
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
import { PhysicalCountCreateDto, PhysicalCountUpdateDto } from 'src/common/dto/physical-count/physical-count.dto';

@Controller('api')
@ApiTags('Inventory')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class PhysicalCountController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    PhysicalCountController.name,
  );

  constructor(
    private readonly physicalCountService: PhysicalCountService,
  ) {
    super();
  }

  /**
   * Returns the count of physical inventory counts pending the current user's action.
   * Used for dashboard notifications and task prioritization.
   */
  @Get('physical-count/pending')
  @UseGuards(new AppIdGuard('physicalCount.findAllPending.count'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get pending physical count count',
    description: 'Returns the count of physical inventory counts awaiting the current user to record actual stock quantities, used to drive dashboard notifications and task prioritization.',
    operationId: 'findAllPendingPhysicalCountCount',
    tags: ['Inventory', 'Physical Count'],
    responses: {
      200: { description: 'Pending physical count count retrieved successfully' },
    },
  })
  async findAllPendingPhysicalCountCount(
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAllPendingPhysicalCountCount',
        version,
      },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.findAllPendingPhysicalCountCount(
      user_id,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Retrieves a physical inventory count session by ID, including location,
   * period, status, and counted items for review or continuation.
   */
  @Get(':bu_code/physical-count/:id')
  @UseGuards(new AppIdGuard('physicalCount.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a physical count by ID',
    description: 'Retrieves the full details of a physical inventory count session, including the location, period, status, and counted items, for review or continuation of the stock verification process.',
    operationId: 'findOnePhysicalCount',
    tags: ['Inventory', 'Physical Count'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Physical count retrieved successfully' },
      404: { description: 'Physical count not found' },
    },
  })
  async findOne(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all physical inventory count sessions for a business unit with pagination.
   * Allows inventory managers to monitor ongoing and completed stock verifications.
   */
  @Get(':bu_code/physical-count/')
  @UseGuards(new AppIdGuard('physicalCount.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all physical counts',
    description: 'Lists all physical inventory count sessions for a business unit with pagination, allowing inventory managers to monitor ongoing and completed stock verification activities.',
    operationId: 'findAllPhysicalCounts',
    tags: ['Inventory', 'Physical Count'],
    parameters: [
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Physical counts retrieved successfully' },
    },
  })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.physicalCountService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Initiates a new periodic physical inventory count for a storage location,
   * generating the list of products to be verified against system stock levels.
   */
  @Post(':bu_code/physical-count')
  @UseGuards(new AppIdGuard('physicalCount.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new physical count',
    description: 'Initiates a new periodic physical inventory count for a specific storage location and count period, generating the list of products to be verified against system stock levels.',
    operationId: 'createPhysicalCount',
    tags: ['Inventory', 'Physical Count'],
    parameters: [
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      201: { description: 'Physical count created successfully' },
      400: { description: 'Invalid request body' },
    },
  })
  @ApiBody({ type: PhysicalCountCreateRequestDto })
  async create(
    @Body() createDto: PhysicalCountCreateDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies a physical count record (e.g., assigned location or metadata)
   * before the count is finalized and submitted.
   */
  @Patch(':bu_code/physical-count/:id')
  @UseGuards(new AppIdGuard('physicalCount.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a physical count',
    description: 'Modifies a physical count record, such as changing the assigned location or adjusting metadata, before the count is finalized and submitted.',
    operationId: 'updatePhysicalCount',
    tags: ['Inventory', 'Physical Count'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Physical count updated successfully' },
      404: { description: 'Physical count not found' },
    },
  })
  @ApiBody({ type: PhysicalCountUpdateRequestDto })
  async update(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: PhysicalCountUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a physical count created in error. Only draft counts that
   * have not been submitted can be deleted.
   */
  @Delete(':bu_code/physical-count/:id')
  @UseGuards(new AppIdGuard('physicalCount.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a physical count',
    description: 'Removes a physical count that was created in error or is no longer needed. Only draft counts that have not been submitted can be deleted.',
    operationId: 'deletePhysicalCount',
    tags: ['Inventory', 'Physical Count'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Physical count deleted successfully' },
      404: { description: 'Physical count not found' },
    },
  })
  async delete(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  // ==================== Physical Count Detail CRUD ====================

  /**
   * Returns all product line items in a physical count, showing system quantities
   * alongside recorded actual quantities for inventory reconciliation.
   */
  @Get(':bu_code/physical-count/:id/details')
  @UseGuards(new AppIdGuard('physicalCount.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all details for a Physical Count',
    description: 'Returns all product line items included in a physical count, showing system quantities alongside any recorded actual quantities for inventory reconciliation.',
    operationId: 'findAllPhysicalCountDetails',
    tags: ['Inventory', 'Physical Count'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count ID' },
    ],
    responses: {
      200: { description: 'Physical Count details retrieved successfully' },
      404: { description: 'Physical Count not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findDetailsByPhysicalCountId(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findDetailsByPhysicalCountId', id, version },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.findDetailsByPhysicalCountId(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Retrieves a single product line item from a physical count, including its
   * system quantity, actual counted quantity, and variance for investigation.
   */
  @Get(':bu_code/physical-count/:id/details/:detail_id')
  @UseGuards(new AppIdGuard('physicalCount.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a specific Physical Count detail by ID',
    description: 'Retrieves a specific product line item from a physical count, including its system quantity, actual counted quantity, and any variance for detailed investigation.',
    operationId: 'findPhysicalCountDetailById',
    tags: ['Inventory', 'Physical Count'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Physical Count Detail ID' },
    ],
    responses: {
      200: { description: 'Physical Count detail retrieved successfully' },
      404: { description: 'Physical Count detail not found' },
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
    this.logger.debug(
      { function: 'findDetailById', id, detailId, version },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.findDetailById(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Removes a product line item from a draft physical count when it was
   * added in error or is no longer relevant to the current count session.
   */
  @Delete(':bu_code/physical-count/:id/details/:detail_id')
  @UseGuards(new AppIdGuard('physicalCount.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a Physical Count detail',
    description: 'Removes a product line item from a draft physical count, used when items were added in error or are no longer relevant to the current count session.',
    operationId: 'deletePhysicalCountDetail',
    tags: ['Inventory', 'Physical Count'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Physical Count Detail ID' },
    ],
    responses: {
      200: { description: 'Physical Count detail deleted successfully' },
      400: { description: 'Cannot delete detail of non-draft Physical Count' },
      404: { description: 'Physical Count detail not found' },
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
    this.logger.debug(
      { function: 'deleteDetail', id, detailId, version },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.deleteDetail(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }

  // ==================== Mobile-specific endpoints ====================

  /**
   * Persists actual counted quantities entered on a mobile device as a draft,
   * allowing warehouse staff to pause and resume counting without finalizing.
   */
  @Patch(':bu_code/physical-count/:id/save')
  @UseGuards(new AppIdGuard('physicalCount.save'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Save Physical Count items',
    description: 'Persists the actual counted quantities entered by warehouse staff on a mobile device as a draft, allowing them to pause and resume the physical count without finalizing it.',
    operationId: 'savePhysicalCountItems',
    tags: ['Inventory', 'Physical Count'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Physical Count items saved successfully' },
      400: { description: 'Invalid request body' },
      404: { description: 'Physical Count not found' },
    },
  })
  @ApiBody({ type: PhysicalCountSaveItemsRequestDto })
  @HttpCode(HttpStatus.OK)
  async saveItems(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: { items: Array<{ id: string; actual_qty: number }> },
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'saveItems', id, data, version },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.saveItems(id, data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Compares actual counted quantities against system stock levels and calculates
   * variances, enabling staff to review discrepancies before final submission.
   */
  @Patch(':bu_code/physical-count/:id/review')
  @UseGuards(new AppIdGuard('physicalCount.review'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Review Physical Count items',
    description: 'Compares the actual counted quantities against system stock levels and calculates variances for each item, enabling warehouse staff to review discrepancies before final submission.',
    operationId: 'reviewPhysicalCountItems',
    tags: ['Inventory', 'Physical Count'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Physical Count items reviewed successfully with difference list' },
      400: { description: 'Invalid request body' },
      404: { description: 'Physical Count not found' },
    },
  })
  @ApiBody({ type: PhysicalCountSaveItemsRequestDto })
  @HttpCode(HttpStatus.OK)
  async reviewItems(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: { items: Array<{ id: string; actual_qty: number }> },
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'reviewItems', id, data, version },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.reviewItems(id, data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Retrieves the previously calculated variance report for a physical count,
   * showing differences between system and actual quantities for manager approval.
   */
  @Get(':bu_code/physical-count/:id/review')
  @UseGuards(new AppIdGuard('physicalCount.getReview'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get Physical Count review result',
    description: 'Retrieves the previously calculated variance report for a physical count, showing the differences between system and actual quantities so managers can approve or investigate discrepancies.',
    operationId: 'getPhysicalCountReview',
    tags: ['Inventory', 'Physical Count'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Physical Count review result retrieved successfully' },
      404: { description: 'Physical Count not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getReview(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'getReview', id, version },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.getReview(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Finalizes a physical count and automatically generates inventory adjustment
   * records to reconcile system stock levels with actual counted quantities.
   */
  @Patch(':bu_code/physical-count/:id/submit')
  @UseGuards(new AppIdGuard('physicalCount.submit'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Submit Physical Count',
    description: 'Finalizes a physical count and automatically generates inventory adjustment records to reconcile system stock levels with the actual counted quantities.',
    operationId: 'submitPhysicalCount',
    tags: ['Inventory', 'Physical Count'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Physical Count submitted and adjustment created successfully' },
      400: { description: 'Physical Count cannot be submitted' },
      404: { description: 'Physical Count not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async submit(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'submit', id, version },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.submit(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Records an explanatory note on a counted item, such as reasons for variances
   * (e.g., spoilage, breakage) to support audit trails.
   */
  @Post(':bu_code/physical-count/:id/details/:detail_id/comment')
  @UseGuards(new AppIdGuard('physicalCount.createComment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add comment to Physical Count detail',
    description: 'Records an explanatory note on a specific counted item, such as reasons for variances (e.g., spoilage, breakage, or misplacement) to support audit trails.',
    operationId: 'createPhysicalCountDetailComment',
    tags: ['Inventory', 'Physical Count'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Physical Count Detail ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      201: { description: 'Comment created successfully' },
      400: { description: 'Invalid request body' },
      404: { description: 'Physical Count detail not found' },
    },
  })
  @ApiBody({ type: PhysicalCountDetailCommentRequestDto })
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('id') id: string,
    @Param('detail_id') detailId: string,
    @Param('bu_code') bu_code: string,
    @Body() data: { comment: string },
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'createComment', id, detailId, data, version },
      PhysicalCountController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountService.createComment(detailId, data, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }
}
