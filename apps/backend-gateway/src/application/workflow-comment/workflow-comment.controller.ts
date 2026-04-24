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
import { WorkflowCommentService } from './workflow-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateWorkflowCommentDto, UpdateWorkflowCommentDto, AddAttachmentDto } from './dto/workflow-comment.dto';

@Controller('api')
@ApiTags('Workflow: Operations')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class WorkflowCommentController {
  private readonly logger: BackendLogger = new BackendLogger(WorkflowCommentController.name);
  constructor(private readonly workflowCommentService: WorkflowCommentService) {}

  @Get(':bu_code/workflow/:workflow_id/comments')
  @UseGuards(new AppIdGuard('workflowComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a workflow', operationId: 'findAllWorkflowComments', tags: ['Master', 'Workflow Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByWorkflowId(@Param('bu_code') bu_code: string, @Param('workflow_id', new ParseUUIDPipe({ version: '4' })) workflow_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.workflowCommentService.findAllByWorkflowId(workflow_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/workflow-comment/:id')
  @UseGuards(new AppIdGuard('workflowComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a workflow comment by ID', operationId: 'findOneWorkflowComment', tags: ['Master', 'Workflow Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.workflowCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/workflow-comment')
  @UseGuards(new AppIdGuard('workflowComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new workflow comment', operationId: 'createWorkflowComment', tags: ['Master', 'Workflow Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateWorkflowCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateWorkflowCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.workflowCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/workflow-comment/:id')
  @UseGuards(new AppIdGuard('workflowComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a workflow comment', operationId: 'updateWorkflowComment', tags: ['Master', 'Workflow Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateWorkflowCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() updateDto: UpdateWorkflowCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.workflowCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/workflow-comment/:id')
  @UseGuards(new AppIdGuard('workflowComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a workflow comment', operationId: 'deleteWorkflowComment', tags: ['Master', 'Workflow Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.workflowCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/workflow-comment/:id/attachment')
  @UseGuards(new AppIdGuard('workflowComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a workflow comment', operationId: 'addAttachmentToWorkflowComment', tags: ['Master', 'Workflow Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.workflowCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/workflow-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('workflowComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a workflow comment', operationId: 'removeAttachmentFromWorkflowComment', tags: ['Master', 'Workflow Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.workflowCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
