import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DepartmentCommentService } from './department-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateDepartmentCommentDto, UpdateDepartmentCommentDto, AddAttachmentDto } from './dto/department-comment.dto';

@Controller('api')
@ApiTags('Config: Departments')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class DepartmentCommentController {
  private readonly logger: BackendLogger = new BackendLogger(DepartmentCommentController.name);
  constructor(private readonly departmentCommentService: DepartmentCommentService) {}

  @Get(':bu_code/department/:department_id/comments')
  @UseGuards(new AppIdGuard('departmentComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a department', operationId: 'findAllDepartmentComments', tags: ['Master', 'Department Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByDepartmentId(@Param('bu_code') bu_code: string, @Param('department_id', new ParseUUIDPipe({ version: '4' })) department_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.departmentCommentService.findAllByDepartmentId(department_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/department-comment/:id')
  @UseGuards(new AppIdGuard('departmentComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a department comment by ID', operationId: 'findOneDepartmentComment', tags: ['Master', 'Department Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.departmentCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/department-comment')
  @UseGuards(new AppIdGuard('departmentComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new department comment', operationId: 'createDepartmentComment', tags: ['Master', 'Department Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateDepartmentCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateDepartmentCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.departmentCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/department-comment/:id')
  @UseGuards(new AppIdGuard('departmentComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a department comment', operationId: 'updateDepartmentComment', tags: ['Master', 'Department Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateDepartmentCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() updateDto: UpdateDepartmentCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.departmentCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/department-comment/:id')
  @UseGuards(new AppIdGuard('departmentComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a department comment', operationId: 'deleteDepartmentComment', tags: ['Master', 'Department Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.departmentCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/department-comment/:id/attachment')
  @UseGuards(new AppIdGuard('departmentComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a department comment', operationId: 'addAttachmentToDepartmentComment', tags: ['Master', 'Department Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.departmentCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/department-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('departmentComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a department comment', operationId: 'removeAttachmentFromDepartmentComment', tags: ['Master', 'Department Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.departmentCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
