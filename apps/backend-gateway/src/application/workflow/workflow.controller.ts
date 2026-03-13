import { Controller, Get, HttpCode, HttpStatus, Param, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { WorkflowService } from './workflow.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { WorkflowTypeParamDto } from './dto/workflow.dto';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  BaseHttpController,
  Serialize,
  WorkflowDetailResponseSchema,
  WorkflowListItemResponseSchema,
} from '@/common';

@Controller('api/:bu_code/workflow')
@UseGuards(KeycloakGuard)
@ApiTags('Workflow & Approval')
@ApiHeaderRequiredXAppId()
@ApiBearerAuth()
export class WorkflowController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    WorkflowController.name,
  );

  constructor(private readonly workflowService: WorkflowService) {
    super();
  }

  /**
   * Find a workflow by document type
   * ค้นหาขั้นตอนการทำงานตามประเภทเอกสาร
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param workflowType - Workflow type parameter / พารามิเตอร์ประเภทขั้นตอนการทำงาน
   * @param version - API version / เวอร์ชัน API
   * @returns Workflow configuration details / รายละเอียดการกำหนดค่าขั้นตอนการทำงาน
   */
  @Get('/type/:type')
  @UseGuards(new AppIdGuard('workflow.findByType'))
  @Serialize(WorkflowDetailResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get workflow by type',
    description: 'Retrieves the configurable approval workflow for a given document type (e.g., purchase request, store requisition), including approval stages and assigned roles.',
    operationId: 'findWorkflowByType',
    tags: ['Workflow & Approval', 'Workflow'],
    responses: {
      200: { description: 'Workflow retrieved successfully' },
      404: { description: 'Workflow not found for the specified type' },
    },
  })
  async findByType(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param() workflowType: WorkflowTypeParamDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findByType',
        workflowType,
        version,
      },
      WorkflowController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.workflowService.findByType(
      workflowType.type,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Get previous approval stages of a workflow
   * ดึงขั้นตอนอนุมัติก่อนหน้าของขั้นตอนการทำงาน
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param workflow_id - Workflow ID / รหัสขั้นตอนการทำงาน
   * @param stage - Current stage / ขั้นตอนปัจจุบัน
   * @param version - API version / เวอร์ชัน API
   * @returns Previous workflow stages / ขั้นตอนการทำงานก่อนหน้า
   */
  @Get(':workflow_id/previous_stages')
  @UseGuards(KeycloakGuard)
  @Serialize(WorkflowListItemResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get previous stages of a workflow',
    description: 'Retrieves the previous approval stages of a workflow relative to the current stage, used to determine revert/return-to options in the approval chain.',
    operationId: 'getWorkflowPreviousStages',
    tags: ['Workflow & Approval', 'Workflow'],
    responses: {
      200: { description: 'Previous workflow stages retrieved successfully' },
      404: { description: 'Workflow not found' },
    },
  })
  async getPreviousStages(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('workflow_id') workflow_id: string,
    @Query('stage') stage: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getPreviousStages',
        workflow_id,
        stage,
        version,
      },
      WorkflowController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.workflowService.getPreviousStages(
      workflow_id,
      stage,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
