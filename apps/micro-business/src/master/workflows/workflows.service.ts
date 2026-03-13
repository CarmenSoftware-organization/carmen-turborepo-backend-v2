import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import {
  enum_workflow_type,
  PrismaClient,
} from '@repo/prisma-shared-schema-tenant';
import {
  ICreateWorkflow,
  IUpdateWorkflow,
} from './interface/workflows.interface';
import { TenantService } from '@/tenant/tenant.service';
import { IPaginate } from '@/common/shared-interface/paginate.interface';
import QueryParams from '@/common/libs/paginate.query';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { isUUID } from 'class-validator';
import {
  ERROR_MISSING_BU_CODE,
  ERROR_MISSING_TENANT_ID,
  ERROR_MISSING_USER_ID,
} from '@/common/constant';
import order from '@/common/helpers/order_by';
import getPaginationParams from '@/common/helpers/pagination.params';
import {
  TryCatch,
  Result,
  ErrorCode,
  WorkflowResponseSchema,
  WorkflowListItemResponseSchema,
  WorkflowByTypeResponseSchema,
} from '@/common';

@Injectable()
export class WorkflowsService {
  get bu_code(): string {
    if (this._bu_code) {
      return String(this._bu_code);
    }
    throw new HttpException(
      ERROR_MISSING_BU_CODE,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  get userId(): string {
    if (isUUID(this._userId, 4)) {
      return String(this._userId);
    }
    throw new HttpException(
      ERROR_MISSING_USER_ID,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  set bu_code(value: string) {
    this._bu_code = value;
  }

  set userId(value: string) {
    this._userId = value;
  }

  private _bu_code?: string;
  private _userId?: string;

  /**
   * Initialize the Prisma service for the tenant
   * เริ่มต้นบริการ Prisma สำหรับผู้เช่า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param userId - User ID / รหัสผู้ใช้
   */
  async initializePrismaService(
    bu_code: string,
    userId: string,
  ): Promise<void> {
    this._prismaService = await this.tenantService.prismaTenantInstance(
      bu_code,
      userId,
    );
  }

  private _prismaService: PrismaClient | undefined;

  get prismaService(): PrismaClient {
    if (!this._prismaService) {
      throw new HttpException(
        'Prisma service is not initialized',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return this._prismaService;
  }

  private readonly logger: BackendLogger = new BackendLogger(
    WorkflowsService.name,
  );

  constructor(private readonly tenantService: TenantService) {}

  /**
   * Find a single workflow by ID
   * ค้นหาขั้นตอนการทำงานรายการเดียวตาม ID
   * @param id - Workflow ID / รหัสขั้นตอนการทำงาน
   * @returns Workflow detail / รายละเอียดขั้นตอนการทำงาน
   */
  @TryCatch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- result.value accessed by controller
  async findOne(id: string): Promise<Result<any>> {
    this.logger.debug(
      { function: 'findOne', id, user_id: this.userId, bu_code: this.bu_code },
      WorkflowsService.name,
    );

    const workflow = await this.prismaService.tb_workflow.findFirst({
      where: {
        id: id,
      },
    });

    if (!workflow) {
      return Result.error('Workflow not found', ErrorCode.NOT_FOUND);
    }

    // Serialize response data
    const serializedWorkflow = WorkflowResponseSchema.parse(workflow);

    return Result.ok(serializedWorkflow);
  }

  /**
   * Find all workflows with pagination
   * ค้นหาขั้นตอนการทำงานทั้งหมดแบบแบ่งหน้า
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @returns Paginated list of workflows / รายการขั้นตอนการทำงานแบบแบ่งหน้า
   */
  @TryCatch
  async findAll(paginate: IPaginate): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'findAll',
        user_id: this.userId,
        tenant_id: this.bu_code,
        paginate,
      },
      WorkflowsService.name,
    );
    const defaultSearchFields = ['name'];

    const q = new QueryParams(
      paginate.page,
      paginate.perpage,
      paginate.search,
      paginate.searchfields,
      defaultSearchFields,
      typeof paginate.filter === 'object' && !Array.isArray(paginate.filter)
        ? paginate.filter
        : {},
      paginate.sort,
      paginate.advance,
    );

    const pagination = getPaginationParams(q.page, q.perpage);
    const workflows = await this.prismaService.tb_workflow.findMany({
      where: q.where(),
      orderBy: q.orderBy(),
      ...pagination,
    });

    const total = await this.prismaService.tb_workflow.count({
      where: q.where(),
    });

    // Serialize response data
    const serializedWorkflows = workflows.map((workflow) =>
      WorkflowListItemResponseSchema.parse(workflow),
    );

    return Result.ok({
      paginate: {
        total: total,
        page: q.perpage < 0 ? 1 : q.page,
        perpage: q.perpage < 0 ? 1 : q.perpage,
        pages: total === 0 || q.perpage < 0 ? 1 : Math.ceil(total / q.perpage),
      },
      data: serializedWorkflows,
    });
  }

  /**
   * Find active workflows by type and check if user can create requests
   * ค้นหาขั้นตอนการทำงานที่ใช้งานอยู่ตามประเภทและตรวจสอบว่าผู้ใช้สามารถสร้างคำขอได้หรือไม่
   * @param type - Workflow type (e.g., purchase_request) / ประเภทขั้นตอนการทำงาน
   * @param user_id - User ID to check create permission / รหัสผู้ใช้สำหรับตรวจสอบสิทธิ์การสร้าง
   * @returns List of workflows with can_create flag / รายการขั้นตอนการทำงานพร้อมสถานะสิทธิ์การสร้าง
   */
  @TryCatch
  async findByType(
    type: string,
    user_id: string,
  ): Promise<Result<unknown>> {
    // Normalize: append _workflow if not already present (e.g. "purchase_request" → "purchase_request_workflow")
    const normalizedType = type.endsWith('_workflow') ? type : `${type}_workflow`;

    this.logger.debug(
      {
        function: 'findByType',
        type,
        normalizedType,
        user_id,
      },
      WorkflowsService.name,
    );

    const results = await this.prismaService.tb_workflow.findMany({
      where: {
        workflow_type: normalizedType as enum_workflow_type,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        data: true,
      },
    });

    // Process workflows with proper async handling
    const workflows = await Promise.all(
      results.map(async (workflow) => {
        const data = workflow.data as unknown as Record<string, unknown>;
        let can_create = false;

        if (data && typeof data === 'object') {
          const usersInCreateRequestStage = await this.findAllUsersInStages(
            'Create Request',
            data,
          );
          const userFound = usersInCreateRequestStage.find(
            (user) => user.user_id === user_id,
          );
          can_create = !!userFound;
        }

        return {
          id: workflow.id,
          name: workflow.name,
          can_create,
        };
      }),
    );

    // Serialize response data
    const serializedWorkflows = workflows.map((workflow) =>
      WorkflowByTypeResponseSchema.parse(workflow),
    );

    return Result.ok({
      paginate: {
        total: workflows.length,
        page: 1,
        perpage: workflows.length,
        pages: 1,
      },
      data: serializedWorkflows,
    });
  }

  /**
   * Find all users assigned to a specific workflow stage
   * ค้นหาผู้ใช้ทั้งหมดที่ได้รับมอบหมายในขั้นตอนการทำงานที่ระบุ
   * @param stage_name - Name of the workflow stage / ชื่อขั้นตอนการทำงาน
   * @param data - Workflow data containing stages / ข้อมูลขั้นตอนการทำงานที่มีขั้นตอนต่างๆ
   * @returns List of users in the specified stage / รายการผู้ใช้ในขั้นตอนที่ระบุ
   */
  async findAllUsersInStages(
    stage_name: string,
    data: object,
  ): Promise<
    {
      user_id: string;
      email: string;
      firstname: string;
      lastname: string;
      department: string;
      initials: string;
    }[]
  > {
    // mock data structure
    // const xx = {
    //   stages: [
    //     {
    //       sla: '24',
    //       name: 'Create Request',
    //       role: 'create',
    //       sla_unit: 'hours',
    //       description: 'Initial stage for creating and submitting requests',
    //       hide_fields: { total_price: false, price_per_unit: false },
    //       assigned_users: [
    //         {
    //           email: 'system-admin@blueledgers.com',
    //           user_id: 'fe007ceb-9320-41ed-92ac-d6ea1f66b3c1',
    //           initials: 'ss',
    //           lastname: 'system-admin',
    //           firstname: 'system-admin',
    //           department: {},
    //           middlename: '',
    //         },
    //         {
    //           email: 'admin@blueledgers.com',
    //           user_id: '3c5280a7-492e-421d-b739-7447455ce99e',
    //           initials: 'aa',
    //           lastname: 'admin',
    //           firstname: 'admin',
    //           department: {
    //             id: '7e739b3a-6026-450d-95e4-133198672a89',
    //             name: 'Kitchen',
    //           },
    //           middlename: '',
    //         },
    //       ],
    //       creator_access: 'only_creator',
    //       available_actions: {
    //         reject: {
    //           is_active: false,
    //           recipients: {
    //             next_step: false,
    //             requestor: false,
    //             current_approve: false,
    //           },
    //         },
    //         submit: {
    //           is_active: true,
    //           recipients: {
    //             next_step: true,
    //             requestor: true,
    //             current_approve: false,
    //           },
    //         },
    //         approve: {
    //           is_active: false,
    //           recipients: {
    //             next_step: false,
    //             requestor: false,
    //             current_approve: false,
    //           },
    //         },
    //         sendback: {
    //           is_active: false,
    //           recipients: {
    //             next_step: false,
    //             requestor: false,
    //             current_approve: false,
    //           },
    //         },
    //       },
    //     },
    //     {
    //       sla: '24',
    //       name: 'HOD',
    //       role: 'approve',
    //       is_hod: true,
    //       sla_unit: 'hours',
    //       description: '',
    //       hide_fields: { total_price: false, price_per_unit: false },
    //       assigned_users: [],
    //       creator_access: 'only_creator',
    //       available_actions: {
    //         reject: {
    //           is_active: true,
    //           recipients: {
    //             next_step: false,
    //             requestor: true,
    //             current_approve: false,
    //           },
    //         },
    //         submit: {
    //           is_active: false,
    //           recipients: {
    //             next_step: false,
    //             requestor: false,
    //             current_approve: false,
    //           },
    //         },
    //         approve: {
    //           is_active: true,
    //           recipients: {
    //             next_step: true,
    //             requestor: true,
    //             current_approve: false,
    //           },
    //         },
    //         sendback: {
    //           is_active: true,
    //           recipients: {
    //             next_step: false,
    //             requestor: true,
    //             current_approve: false,
    //           },
    //         },
    //       },
    //       sla_warning_notification: {
    //         recipients: { requestor: false, current_approve: false },
    //       },
    //     },
    //     {
    //       sla: '24',
    //       name: 'Purchase',
    //       role: 'purchase',
    //       sla_unit: 'hours',
    //       description: '',
    //       hide_fields: { total_price: false, price_per_unit: false },
    //       assigned_users: [],
    //       creator_access: 'only_creator',
    //       available_actions: {
    //         reject: {
    //           is_active: true,
    //           recipients: {
    //             next_step: false,
    //             requestor: true,
    //             current_approve: false,
    //           },
    //         },
    //         submit: {
    //           is_active: false,
    //           recipients: {
    //             next_step: false,
    //             requestor: false,
    //             current_approve: false,
    //           },
    //         },
    //         approve: {
    //           is_active: true,
    //           recipients: {
    //             next_step: true,
    //             requestor: true,
    //             current_approve: false,
    //           },
    //         },
    //         sendback: {
    //           is_active: true,
    //           recipients: {
    //             next_step: false,
    //             requestor: true,
    //             current_approve: false,
    //           },
    //         },
    //       },
    //       sla_warning_notification: {
    //         recipients: { requestor: false, current_approve: false },
    //       },
    //     },
    //     {
    //       sla: '0',
    //       name: 'Completed',
    //       role: 'approve',
    //       sla_unit: 'hours',
    //       description: 'Workflow completed successfully',
    //       hide_fields: { total_price: false, price_per_unit: false },
    //       assigned_users: [],
    //       creator_access: 'only_creator',
    //       available_actions: {
    //         reject: {
    //           is_active: false,
    //           recipients: {
    //             next_step: false,
    //             requestor: false,
    //             current_approve: false,
    //           },
    //         },
    //         submit: {
    //           is_active: false,
    //           recipients: {
    //             next_step: false,
    //             requestor: false,
    //             current_approve: false,
    //           },
    //         },
    //         approve: {
    //           is_active: false,
    //           recipients: {
    //             next_step: false,
    //             requestor: false,
    //             current_approve: false,
    //           },
    //         },
    //         sendback: {
    //           is_active: false,
    //           recipients: {
    //             next_step: false,
    //             requestor: false,
    //             current_approve: false,
    //           },
    //         },
    //       },
    //     },
    //   ],
    //   products: [],
    //   notifications: [],
    //   routing_rules: [],
    //   notification_templates: [],
    //   document_reference_pattern: 'PR-{YYYY}-{MM}-{####}',
    // };

    const usersInStage: {
      user_id: string;
      email: string;
      firstname: string;
      lastname: string;
      department: string;
      initials: string;
    }[] = [];
    if (data && typeof data === 'object' && 'stages' in data) {
      const stages = (data as unknown as Record<string, unknown>).stages;
      if (Array.isArray(stages)) {
        const stage = stages.find((s: Record<string, unknown>) => s.name === stage_name);
        if (stage && 'assigned_users' in stage) {
          const assigned_users = stage.assigned_users;
          if (Array.isArray(assigned_users)) {
            for (const user of assigned_users) {
              if ('user_id' in user) {
                usersInStage.push(user);
              }
            }
          }
        }
      }
    }
    return usersInStage;
  }

  /**
   * Find all active workflows by their IDs
   * ค้นหาขั้นตอนการทำงานที่ใช้งานอยู่ทั้งหมดตามรหัส ID
   * @param ids - Array of workflow IDs / อาร์เรย์ของรหัสขั้นตอนการทำงาน
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param user_id - User ID / รหัสผู้ใช้
   * @returns List of workflows / รายการขั้นตอนการทำงาน
   */
  @TryCatch
  async findAllWorkflowByIds(
    ids: string[],
    bu_code: string,
    user_id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- result.value iterated by controller
  ): Promise<Result<any>> {
    this.logger.debug(
      { function: 'findAllWorkflowByIds', ids, bu_code, user_id },
      WorkflowsService.name,
    );

    const workflows = await this.prismaService.tb_workflow.findMany({
      where: {
        id: {
          in: ids,
        },
        is_active: true,
      },
    });

    // Serialize response data
    const serializedWorkflows = workflows.map((workflow) =>
      WorkflowListItemResponseSchema.parse(workflow),
    );

    return Result.ok(serializedWorkflows);
  }

  /**
   * Create a new workflow
   * สร้างขั้นตอนการทำงานใหม่
   * @param data - Workflow creation data / ข้อมูลสำหรับสร้างขั้นตอนการทำงาน
   * @returns Created workflow ID / รหัสขั้นตอนการทำงานที่สร้างแล้ว
   */
  @TryCatch
  async create(data: ICreateWorkflow): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'create',
        data,
        user_id: this.userId,
        tenant_id: this.bu_code,
      },
      WorkflowsService.name,
    );

    const foundWorkflow = await this.prismaService.tb_workflow.findFirst({
      where: {
        name: data.name,
        workflow_type: data.workflow_type,
      },
    });

    if (foundWorkflow) {
      return Result.error('Workflow already exists', ErrorCode.ALREADY_EXISTS);
    }

    const createWorkflow = await this.prismaService.tb_workflow.create({
      data: {
        ...data,
        created_by_id: this.userId,
      },
    });

    return Result.ok({ id: createWorkflow.id });
  }

  /**
   * Update an existing workflow
   * อัปเดตขั้นตอนการทำงานที่มีอยู่
   * @param data - Workflow update data / ข้อมูลสำหรับอัปเดตขั้นตอนการทำงาน
   * @returns Updated workflow ID / รหัสขั้นตอนการทำงานที่อัปเดตแล้ว
   */
  @TryCatch
  async update(data: IUpdateWorkflow): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'update',
        data,
        user_id: this.userId,
        tenant_id: this.bu_code,
      },
      WorkflowsService.name,
    );

    const workflow = await this.prismaService.tb_workflow.findFirst({
      where: {
        id: data.id,
      },
    });

    if (!workflow) {
      return Result.error('Workflow not found', ErrorCode.NOT_FOUND);
    }

    const updateWorkflow = await this.prismaService.tb_workflow.update({
      where: {
        id: data.id,
      },
      data: {
        ...data,
        updated_by_id: this.userId,
      },
    });

    return Result.ok({ id: updateWorkflow.id });
  }

  /**
   * Soft delete a workflow
   * ลบขั้นตอนการทำงานแบบ soft delete
   * @param id - Workflow ID / รหัสขั้นตอนการทำงาน
   * @returns null on success / null เมื่อสำเร็จ
   */
  @TryCatch
  async delete(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, user_id: this.userId, tenant_id: this.bu_code },
      WorkflowsService.name,
    );

    const workflow = await this.prismaService.tb_workflow.findFirst({
      where: {
        id: id,
      },
    });

    if (!workflow) {
      return Result.error('Workflow not found', ErrorCode.NOT_FOUND);
    }

    await this.prismaService.tb_workflow.update({
      where: {
        id: id,
      },
      data: {
        is_active: false,
        deleted_by_id: this.userId,
        deleted_at: new Date().toISOString(),
      },
    });

    // const deleteWorkflow = await prisma.tb_workflow.update({
    //   where: {
    //     id: id,
    //   },
    //   data: {
    //     is_active: false,
    //     updated_by_id: this.userId,
    //   },
    // });

    return Result.ok(null);
  }
}
