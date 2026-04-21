import { Controller, Delete, Get, Param, Body, Post, Query, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { DeliveryPointCommentService } from './delivery-point-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateDeliveryPointCommentDto, UpdateDeliveryPointCommentDto, AddAttachmentDto } from './dto/delivery-point-comment.dto';

@Controller('api')
@ApiTags('Master')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class DeliveryPointCommentController {
  private readonly logger: BackendLogger = new BackendLogger(DeliveryPointCommentController.name);
  constructor(private readonly deliveryPointCommentService: DeliveryPointCommentService) {}

  @Get(':bu_code/delivery-point/:delivery_point_id/comments')
  @UseGuards(new AppIdGuard('deliveryPointComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a delivery-point', operationId: 'findAllDeliveryPointComments', tags: ['Master', 'DeliveryPoint Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByDeliveryPointId(@Param('bu_code') bu_code: string, @Param('delivery_point_id') delivery_point_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.deliveryPointCommentService.findAllByDeliveryPointId(delivery_point_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/delivery-point-comment/:id')
  @UseGuards(new AppIdGuard('deliveryPointComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a delivery-point comment by ID', operationId: 'findOneDeliveryPointComment', tags: ['Master', 'DeliveryPoint Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.deliveryPointCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/delivery-point-comment')
  @UseGuards(new AppIdGuard('deliveryPointComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new delivery-point comment', operationId: 'createDeliveryPointComment', tags: ['Master', 'DeliveryPoint Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateDeliveryPointCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateDeliveryPointCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.deliveryPointCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/delivery-point-comment/:id')
  @UseGuards(new AppIdGuard('deliveryPointComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a delivery-point comment', operationId: 'updateDeliveryPointComment', tags: ['Master', 'DeliveryPoint Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateDeliveryPointCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() updateDto: UpdateDeliveryPointCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.deliveryPointCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/delivery-point-comment/:id')
  @UseGuards(new AppIdGuard('deliveryPointComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a delivery-point comment', operationId: 'deleteDeliveryPointComment', tags: ['Master', 'DeliveryPoint Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.deliveryPointCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/delivery-point-comment/:id/attachment')
  @UseGuards(new AppIdGuard('deliveryPointComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a delivery-point comment', operationId: 'addAttachmentToDeliveryPointComment', tags: ['Master', 'DeliveryPoint Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.deliveryPointCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/delivery-point-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('deliveryPointComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a delivery-point comment', operationId: 'removeAttachmentFromDeliveryPointComment', tags: ['Master', 'DeliveryPoint Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.deliveryPointCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
