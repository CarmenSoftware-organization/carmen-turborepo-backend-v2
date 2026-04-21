import { Controller, Delete, Get, Param, Body, Post, Query, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { VendorCommentService } from './vendor-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateVendorCommentDto, UpdateVendorCommentDto, AddAttachmentDto } from './dto/vendor-comment.dto';

@Controller('api')
@ApiTags('Master')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class VendorCommentController {
  private readonly logger: BackendLogger = new BackendLogger(VendorCommentController.name);
  constructor(private readonly vendorCommentService: VendorCommentService) {}

  @Get(':bu_code/vendor/:vendor_id/comments')
  @UseGuards(new AppIdGuard('vendorComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a vendor', operationId: 'findAllVendorComments', tags: ['Master', 'Vendor Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByVendorId(@Param('bu_code') bu_code: string, @Param('vendor_id') vendor_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.vendorCommentService.findAllByVendorId(vendor_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/vendor-comment/:id')
  @UseGuards(new AppIdGuard('vendorComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a vendor comment by ID', operationId: 'findOneVendorComment', tags: ['Master', 'Vendor Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/vendor-comment')
  @UseGuards(new AppIdGuard('vendorComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new vendor comment', operationId: 'createVendorComment', tags: ['Master', 'Vendor Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateVendorCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateVendorCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/vendor-comment/:id')
  @UseGuards(new AppIdGuard('vendorComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a vendor comment', operationId: 'updateVendorComment', tags: ['Master', 'Vendor Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateVendorCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() updateDto: UpdateVendorCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/vendor-comment/:id')
  @UseGuards(new AppIdGuard('vendorComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a vendor comment', operationId: 'deleteVendorComment', tags: ['Master', 'Vendor Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/vendor-comment/:id/attachment')
  @UseGuards(new AppIdGuard('vendorComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a vendor comment', operationId: 'addAttachmentToVendorComment', tags: ['Master', 'Vendor Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/vendor-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('vendorComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a vendor comment', operationId: 'removeAttachmentFromVendorComment', tags: ['Master', 'Vendor Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
