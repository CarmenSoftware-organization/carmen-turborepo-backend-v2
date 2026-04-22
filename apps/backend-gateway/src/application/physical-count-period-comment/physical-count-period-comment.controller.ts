import {
  Controller,
  Delete,
  Get,
  Param,
  Body,
  Post,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { PhysicalCountPeriodCommentService } from './physical-count-period-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  CreatePhysicalCountPeriodCommentDto,
  UpdatePhysicalCountPeriodCommentDto,
  AddAttachmentDto,
} from './dto/physical-count-period-comment.dto';

@Controller('api')
@ApiTags('Inventory: Physical Count')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PhysicalCountPeriodCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    PhysicalCountPeriodCommentController.name,
  );

  constructor(
    private readonly physicalCountPeriodCommentService: PhysicalCountPeriodCommentService,
  ) {}

  @Get(':bu_code/physical-count-period/:physical_count_period_id/comments')
  @UseGuards(new AppIdGuard('physicalCountPeriodComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a physical-count-period',
    operationId: 'findAllPhysicalCountPeriodComments',
    tags: ['Inventory', 'PhysicalCountPeriod Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByPhysicalCountPeriodId(
    @Param('bu_code') bu_code: string,
    @Param('physical_count_period_id') physical_count_period_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.physicalCountPeriodCommentService.findAllByPhysicalCountPeriodId(
      physical_count_period_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/physical-count-period-comment/:id')
  @UseGuards(new AppIdGuard('physicalCountPeriodComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a physical-count-period comment by ID',
    operationId: 'findOnePhysicalCountPeriodComment',
    tags: ['Inventory', 'PhysicalCountPeriod Comment'],
    responses: {
      200: { description: 'Comment retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountPeriodCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/physical-count-period-comment')
  @UseGuards(new AppIdGuard('physicalCountPeriodComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new physical-count-period comment',
    operationId: 'createPhysicalCountPeriodComment',
    tags: ['Inventory', 'PhysicalCountPeriod Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreatePhysicalCountPeriodCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreatePhysicalCountPeriodCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountPeriodCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/physical-count-period-comment/:id')
  @UseGuards(new AppIdGuard('physicalCountPeriodComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a physical-count-period comment',
    operationId: 'updatePhysicalCountPeriodComment',
    tags: ['Inventory', 'PhysicalCountPeriod Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdatePhysicalCountPeriodCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePhysicalCountPeriodCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountPeriodCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/physical-count-period-comment/:id')
  @UseGuards(new AppIdGuard('physicalCountPeriodComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a physical-count-period comment',
    operationId: 'deletePhysicalCountPeriodComment',
    tags: ['Inventory', 'PhysicalCountPeriod Comment'],
    responses: {
      200: { description: 'Comment deleted successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountPeriodCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/physical-count-period-comment/:id/attachment')
  @UseGuards(new AppIdGuard('physicalCountPeriodComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a physical-count-period comment',
    operationId: 'addAttachmentToPhysicalCountPeriodComment',
    tags: ['Inventory', 'PhysicalCountPeriod Comment'],
    responses: {
      200: { description: 'Attachment added successfully' },
    },
  } as any)
  @ApiBody({ type: AddAttachmentDto, description: 'Attachment data from file service' })
  @HttpCode(HttpStatus.OK)
  async addAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() attachment: AddAttachmentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountPeriodCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/physical-count-period-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('physicalCountPeriodComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a physical-count-period comment',
    operationId: 'removeAttachmentFromPhysicalCountPeriodComment',
    tags: ['Inventory', 'PhysicalCountPeriod Comment'],
    responses: {
      200: { description: 'Attachment removed successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Param('fileToken') fileToken: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountPeriodCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
