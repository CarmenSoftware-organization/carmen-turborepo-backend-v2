import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { StoreRequisitionService } from '../store-requisition.service';
import { MapperLogic } from '@/common/mapper/mapper.logic';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { IUpdateStoreRequisition, StoreRequisition } from '../interface/store-requisition.interface';
import { UserActionProfile, WorkflowHeader, StageStatus } from '../interface/workflow.interface';
import { CreateStoreRequisition, creatorAccess, NavigateForwardResult, NotificationService, NotificationType, stage_status, SubmitStoreRequisition } from '@/common';
import { enum_last_action, enum_stage_role } from '@repo/prisma-shared-schema-tenant';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { ValidateSRBeforeSubmitSchema } from '../dto/store-requisition.dto';
import { RejectStoreRequisitionDto, ReviewStoreRequisitionDto } from '../dto/stage_role/store-requisition.stage-role.dto';
import { InventoryTransactionService } from '@/inventory/inventory-transaction/inventory-transaction.service';

// Re-export for backward compatibility
export { WorkflowHeader, StageStatus } from '../interface/workflow.interface';

@Injectable()
export class StoreRequisitionLogic {
  private readonly logger: BackendLogger = new BackendLogger(
    StoreRequisitionLogic.name,
  );
  constructor(
    private readonly storeRequisitionService: StoreRequisitionService,
    private readonly mapperLogic: MapperLogic,
    @Inject('MASTER_SERVICE')
    private readonly masterService: ClientProxy,
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
    private readonly notificationService: NotificationService,
    private readonly inventoryTransactionService: InventoryTransactionService,
  ) {}

  async create(payload: CreateStoreRequisition, user_id: string, tenant_id: string) {
    this.logger.debug({ function: 'create', data: payload, user_id, tenant_id }, StoreRequisitionLogic.name);
    await this.storeRequisitionService.initializePrismaService(tenant_id, user_id);
    const data = payload.details;
    const extractId = this.populateData(data);
    const foreignValue: Record<string, any> = await this.mapperLogic.populate(extractId, user_id, tenant_id);
    const fromLocation = foreignValue?.location_ids?.find((loc) => loc?.id === data?.from_location_id);
    const toLocation = foreignValue?.location_ids?.find((loc) => loc?.id === data?.to_location_id);
    const createSR = JSON.parse(JSON.stringify({
      ...data,
      workflow_name: foreignValue?.workflow_id?.name,
      department_name: foreignValue?.department_id?.name,
      requestor_name: foreignValue?.user_id?.name,
      from_location_name: fromLocation?.name,
      from_location_code: fromLocation?.code,
      to_location_name: toLocation?.name,
      to_location_code: toLocation?.code,
    }));
    delete createSR.store_requisition_detail;

    const createStoreRequisitionDetail = [];

    for (const detail of data?.store_requisition_detail?.add ?? []) {
      const product = foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id);

      createStoreRequisitionDetail.push({
        ...detail,
        product_name: product?.name,
        product_local_name: product?.local_name,
      });
    }

    const result = await this.storeRequisitionService.create(createSR, createStoreRequisitionDetail);
    return result;
  }

  async save(
    id,
    { stage_role, details: data }: {
      stage_role: enum_stage_role;
      details: any;
    },
    user_id: string,
    tenant_id: string
  ) {
    this.logger.debug({ function: 'save', data, user_id, tenant_id }, StoreRequisitionLogic.name);
    await this.storeRequisitionService.initializePrismaService(tenant_id, user_id);
    let updateSR = {};
    let updateSRDetail: any = {};

    if (stage_role === enum_stage_role.create) {
      const extractId = this.populateData(data);
      const foreignValue: Record<string, any> = await this.mapperLogic.populate(extractId, user_id, tenant_id);

      const fromLocation = foreignValue?.location_ids?.find((loc) => loc?.id === data?.from_location_id);
      const toLocation = foreignValue?.location_ids?.find((loc) => loc?.id === data?.to_location_id);
      updateSR = JSON.parse(JSON.stringify({
        ...data,
        workflow_name: foreignValue?.workflow_id?.name,
        department_name: foreignValue?.department_id?.name,
        requestor_name: foreignValue?.user_id?.name,
        from_location_name: fromLocation?.name,
        from_location_code: fromLocation?.code,
        to_location_name: toLocation?.name,
        to_location_code: toLocation?.code,
      }));

      updateSRDetail = {
        store_requisition_detail: {
          add: [],
          update: [],
          remove: []
        }
      };

      if (data?.store_requisition_detail?.add && data?.store_requisition_detail?.add.length > 0) {
        updateSRDetail.store_requisition_detail.add = data?.store_requisition_detail?.add;
        updateSRDetail?.store_requisition_detail?.add.forEach((detail) => {
          if (detail?.product_id) {
            detail.product_name = foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.name;
            detail.product_local_name = foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.local_name;
            detail.product_code = foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.code;
            detail.product_sku = foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.code;
          }
        });
      }

      if (data?.store_requisition_detail?.update && data?.store_requisition_detail?.update.length > 0) {
        updateSRDetail.store_requisition_detail.update = data?.store_requisition_detail?.update;
        updateSRDetail?.store_requisition_detail?.update.forEach((detail) => {
          if (detail?.product_id) {
            detail.product_name = foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.name;
            detail.product_local_name = foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.local_name;
            detail.product_code = foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.code;
            detail.product_sku = foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.code;
          }
        });
      }

      if (data?.store_requisition_detail?.remove && data?.store_requisition_detail?.remove.length > 0) {
        updateSRDetail.store_requisition_detail.remove = data?.store_requisition_detail?.remove;
      }
    } else if (stage_role === enum_stage_role.approve) {
      const extractIds = this.populateDetail(data as any[]);
      const foreignValue: Record<string, any> = await this.mapperLogic.populate(extractIds, user_id, tenant_id);
      updateSRDetail = [];
      for (const detail of data as any[]) {
        updateSRDetail.push(
          JSON.parse(
            JSON.stringify({
              ...detail,
              product_name: foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.name,
              product_local_name: foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.local_name,
              product_code: foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.code,
              product_sku: foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.code,
            })
          )
        );
      }
    }

    const result = await this.storeRequisitionService.update(id, updateSR, updateSRDetail);
    return result;
  }

  async submit(id: string, payload: SubmitStoreRequisition, user_id: string, bu_code: string) {
    this.logger.debug({ function: 'submit', id, user_id, bu_code }, StoreRequisitionLogic.name);
    await this.storeRequisitionService.initializePrismaService(bu_code, user_id);
    const storeRequisitionResult = await this.storeRequisitionService.findById(id);
    if (storeRequisitionResult.isError()) {
      throw new Error('Store Requisition not found');
    }
    const storeRequisitionData = storeRequisitionResult.value;

    this.validateBeforeSubmit(storeRequisitionData);

    const populateData: Record<string, any> = await this.mapperLogic.populate({
      workflow_id: storeRequisitionData?.workflow_id,
      user_id: user_id,
    }, user_id, bu_code);

    const workflowData = populateData?.workflow_id?.data;

    // Determine current stage - if empty (old data), get first stage then navigate to stage 2
    let currentStageForNavigation = storeRequisitionData?.workflow_current_stage;
    let previousStage = storeRequisitionData?.workflow_current_stage;

    if (!currentStageForNavigation) {
      // Get first stage (draft) then use it to navigate to stage 2
      const firstStageRes = this.masterService.send(
        { cmd: 'workflows.get-workflow-navigation', service: 'workflows' },
        {
          workflowData,
          currentStatus: '',
          requestData: {},
        },
      );
      const firstStageNav: NavigateForwardResult = await firstValueFrom(firstStageRes);
      currentStageForNavigation = firstStageNav.navigation_info.current_stage_info?.name;
      previousStage = currentStageForNavigation;
    }

    const res = this.masterService.send(
      { cmd: 'workflows.get-workflow-navigation', service: 'workflows' },
      {
        workflowData,
        currentStatus: currentStageForNavigation,
        requestData: {},
      },
    );
    const workflowHeader: NavigateForwardResult = await firstValueFrom(res);
    const lastActionAtDate = new Date();

    const workflow_history = storeRequisitionData?.workflow_history?.length > 0 ? storeRequisitionData?.workflow_history : [];
    workflow_history.push({
      action: enum_last_action.submitted,
      datetime: lastActionAtDate.toISOString(),
      user: {
        id: user_id,
        name: populateData?.user_id?.name
      },
      current_stage: previousStage,
      next_stage: workflowHeader.current_stage
    });

    const userAction = await this.buildUserAction(
      workflowHeader.navigation_info.current_stage_info,
      storeRequisitionData.department_id,
      storeRequisitionData.department_name,
      user_id,
      bu_code,
    );

    const workflow: WorkflowHeader = {
      workflow_previous_stage: workflowHeader.previous_stage,
      workflow_current_stage: workflowHeader.current_stage,
      workflow_next_stage: workflowHeader.navigation_info.workflow_next_step,
      user_action: userAction,
      last_action: enum_last_action.submitted,
      last_action_at_date: lastActionAtDate.toISOString(),
      last_action_by_id: user_id,
      last_action_by_name: populateData?.user_id?.name,
      workflow_history
    };

    const result = await this.storeRequisitionService.submit(id, payload, workflow);

    if (result.isOk()) {
      this.sendSubmitNotification(
        result.value,
        workflow,
        user_id,
        populateData?.user_id?.name,
      );
    }

    return result;
  }

  async approve(
    id: string,
    {
      stage_role,
      details
    }: {
      stage_role: enum_stage_role;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      details: any[];
    },
    user_id: string,
    tenant_id: string
  ) {
    await this.storeRequisitionService.initializePrismaService(tenant_id, user_id);
    const updateSRDetail = [];
    const extractIds = this.populateDetail(details);
    const foreignValue: Record<string, any> = await this.mapperLogic.populate(extractIds, user_id, tenant_id);

    for (const detail of details) {
      updateSRDetail.push(
        JSON.parse(
          JSON.stringify({
            ...detail,
            product_name: foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.name,
            product_local_name: foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.local_name,
              product_code: foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.code,
              product_sku: foreignValue?.product_ids?.find((product) => product?.id === detail?.product_id)?.code,
          })
        )
      );
    }

    const storeRequisitionResult = await this.storeRequisitionService.findById(id);
    if (storeRequisitionResult.isError()) {
      throw new Error('Store Requisition not found');
    }
    const storeRequisitionData = storeRequisitionResult.value;

    const populateData: Record<string, any> = await this.mapperLogic.populate({
      workflow_id: storeRequisitionData?.workflow_id,
      user_id: user_id,
    }, user_id, tenant_id);

    const workflowData = populateData?.workflow_id?.data;

    const res = this.masterService.send(
      { cmd: 'workflows.get-workflow-navigation', service: 'workflows' },
      {
        workflowData,
        currentStatus: storeRequisitionData?.workflow_current_stage,
        previousStatus: storeRequisitionData?.workflow_previous_stage,
        requestData: {},
      },
    );
    const workflowHeader: NavigateForwardResult = await firstValueFrom(res);

    const workflow_history = storeRequisitionData?.workflow_history;
    const lastActionAtDate = new Date();
    let workflow = {};

    if (!workflowHeader.navigation_info.workflow_next_step) {
      workflow_history.push({
        action: enum_last_action.approved,
        datetime: lastActionAtDate.toISOString(),
        user: {
          id: user_id,
          name: populateData?.user_id?.name
        },
        current_stage: workflowHeader.previous_stage,
        next_stage: '-'
      });
      workflow = {
        workflow_previous_stage: workflowHeader.previous_stage,
        workflow_current_stage: workflowHeader.current_stage,
        workflow_next_stage: '-',
        user_action: [],
        last_action: enum_last_action.approved,
        last_action_at_date: lastActionAtDate.toISOString(),
        last_action_by_id: user_id,
        last_action_by_name: populateData?.user_id?.name,
        workflow_history: workflow_history
      };
    } else {
      workflow_history.push({
        action: enum_last_action.approved,
        datetime: lastActionAtDate.toISOString(),
        user: {
          id: user_id,
          name: populateData?.user_id?.name
        },
        current_stage: workflowHeader.previous_stage,
        next_stage: workflowHeader.current_stage
      });
      const userAction = await this.buildUserAction(
        workflowHeader.navigation_info.current_stage_info,
        storeRequisitionData.department_id,
        storeRequisitionData.department_name,
        user_id,
        tenant_id,
      );

      workflow = {
        workflow_previous_stage: workflowHeader.previous_stage,
        workflow_current_stage: workflowHeader.current_stage,
        workflow_next_stage: workflowHeader.navigation_info.workflow_next_step,
        user_action: userAction,
        last_action: enum_last_action.approved,
        last_action_at_date: lastActionAtDate.toISOString(),
        last_action_by_id: user_id,
        last_action_by_name: populateData?.user_id?.name,
        workflow_history: workflow_history
      };
    }

    this.logger.debug({ function: 'approve', id, stage_role, details, user_id, tenant_id }, StoreRequisitionLogic.name);
    const result = await this.storeRequisitionService.approve(id, workflow, updateSRDetail);

    // When SR reaches last stage (completed), trigger inventory transfer
    if (!workflowHeader.navigation_info.workflow_next_step) {
      await this.executeTransferOnComplete(storeRequisitionData, updateSRDetail, user_id, tenant_id);
    }

    this.sendApproveNotification(
      storeRequisitionData,
      workflow as WorkflowHeader,
      user_id,
      populateData?.user_id?.name,
    );

    return result;
  }

  /**
   * When SR is completed, transfer issued_qty from from_location to to_location
   * for each detail line. Runs in a single transaction.
   */
  private async executeTransferOnComplete(
    sr: any,
    details: any[],
    user_id: string,
    tenant_id: string,
  ): Promise<void> {
    const fromLocationId = sr.from_location_id;
    const toLocationId = sr.to_location_id;

    if (!fromLocationId || !toLocationId) {
      this.logger.warn(
        { function: 'executeTransferOnComplete', message: 'SR missing from/to location, skipping transfer' },
        StoreRequisitionLogic.name,
      );
      return;
    }

    // Filter details that have issued_qty > 0
    const itemsToTransfer = details.filter((d) => {
      const issuedQty = Number(d.issued_qty) || 0;
      return issuedQty > 0 && d.product_id;
    });

    if (itemsToTransfer.length === 0) return;

    const method = await this.inventoryTransactionService.getCalculationMethod(tenant_id);
    const prisma = this.storeRequisitionService.prismaService;

    await prisma.$transaction(async (tx: any) => {
      for (const detail of itemsToTransfer) {
        const issuedQty = Number(detail.issued_qty);

        await this.inventoryTransactionService.executeTransfer(
          tx,
          {
            product_id: detail.product_id,
            from_location_id: fromLocationId,
            from_location_code: sr.from_location_code || null,
            to_location_id: toLocationId,
            to_location_code: sr.to_location_code || null,
            qty: issuedQty,
            user_id,
          },
          method,
        );
      }

      // Link inventory transaction to SR detail (update inventory_transaction_id)
      // This is optional — SR details already have the issued_qty recorded
    });

    this.logger.log(
      `Transfer completed for SR ${sr.sr_no}: ${itemsToTransfer.length} items from ${fromLocationId} to ${toLocationId}`,
    );
  }

  async reject(
    id: string,
    body: RejectStoreRequisitionDto,
    user_id: string,
    bu_code: string,
  ) {
    this.logger.debug({ function: 'reject', id, user_id, bu_code }, StoreRequisitionLogic.name);
    await this.storeRequisitionService.initializePrismaService(bu_code, user_id);

    const storeRequisitionResult = await this.storeRequisitionService.findById(id);
    if (storeRequisitionResult.isError()) {
      throw new Error('Store Requisition not found');
    }
    const storeRequisitionData = storeRequisitionResult.value;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const populateData: Record<string, any> = await this.mapperLogic.populate(
      { user_id },
      user_id,
      bu_code,
    );

    const workflow_history = storeRequisitionData?.workflow_history || [];
    const lastActionAtDate = new Date();

    workflow_history.push({
      action: enum_last_action.rejected,
      datetime: lastActionAtDate.toISOString(),
      user: {
        id: user_id,
        name: populateData?.user_id?.name,
      },
      current_stage: storeRequisitionData?.workflow_current_stage,
      next_stage: '-',
    });

    const workflow = {
      workflow_previous_stage: storeRequisitionData?.workflow_current_stage,
      workflow_current_stage: storeRequisitionData?.workflow_current_stage,
      workflow_next_stage: '-',
      user_action: [],
      last_action: enum_last_action.rejected,
      last_action_at_date: lastActionAtDate.toISOString(),
      last_action_by_id: user_id,
      last_action_by_name: populateData?.user_id?.name,
      workflow_history,
    };

    const result = await this.storeRequisitionService.reject(id, workflow, body);

    // Send notification for rejection
    this.sendRejectNotification(
      storeRequisitionData,
      user_id,
      populateData?.user_id?.name,
    );

    return result;
  }

  async review(
    id: string,
    body: ReviewStoreRequisitionDto,
    user_id: string,
    bu_code: string,
  ) {
    this.logger.debug({ function: 'review', id, body, user_id, bu_code }, StoreRequisitionLogic.name);
    await this.storeRequisitionService.initializePrismaService(bu_code, user_id);

    const storeRequisitionResult = await this.storeRequisitionService.findById(id);
    if (storeRequisitionResult.isError()) {
      throw new Error('Store Requisition not found');
    }
    const storeRequisitionData = storeRequisitionResult.value;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRes: Observable<any> = this.authService.send(
      { cmd: 'get-user-by-id', service: 'auth' },
      { id: user_id },
    );
    const userResponse = await firstValueFrom(userRes);

    const workflowRes = this.masterService.send(
      { cmd: 'workflows.findOne', service: 'workflows' },
      {
        id: storeRequisitionData.workflow_id,
        user_id,
        bu_code,
      },
    );
    const workflowResponse = await firstValueFrom(workflowRes);
    if (workflowResponse.response.status !== HttpStatus.OK) {
      throw new Error(workflowResponse.response.message);
    }

    const workflowNavRes = this.masterService.send(
      { cmd: 'workflows.navigate-back-to-stage', service: 'workflows' },
      {
        workflow_id: storeRequisitionData.workflow_id,
        user_id,
        bu_code,
        stage: body.des_stage,
        current_stage: storeRequisitionData.workflow_current_stage,
        requestData: {},
      },
    );
    const backToStageRes = await firstValueFrom(workflowNavRes);
    const workflowHeader: NavigateForwardResult = backToStageRes.data;

    const workflow_history = storeRequisitionData?.workflow_history || [];
    const lastActionAtDate = new Date();

    workflow_history.push({
      action: enum_last_action.reviewed,
      datetime: lastActionAtDate.toISOString(),
      user: {
        id: user_id,
        name: userResponse?.data?.name,
      },
      current_stage: storeRequisitionData?.workflow_current_stage,
      next_stage: workflowHeader.navigation_info.workflow_next_step,
    });

    const userAction = await this.buildUserAction(
      workflowHeader.navigation_info.current_stage_info,
      storeRequisitionData.department_id,
      storeRequisitionData.department_name,
      user_id,
      bu_code,
    );

    const workflow = {
      workflow_previous_stage: workflowHeader.previous_stage,
      workflow_current_stage: workflowHeader.current_stage,
      workflow_next_stage: workflowHeader.navigation_info.workflow_next_step,
      user_action: userAction,
      last_action: enum_last_action.reviewed,
      last_action_at_date: lastActionAtDate.toISOString(),
      last_action_by_id: user_id,
      last_action_by_name: userResponse?.data?.name,
      workflow_history,
    };

    const result = await this.storeRequisitionService.review(id, workflow, body);

    // Send notification for review (send back)
    this.sendReviewNotification(
      storeRequisitionData,
      workflow as WorkflowHeader,
      user_id,
      userResponse?.data?.name,
    );

    return result;
  }

  private populateData(data: any) {
    const headerFields = {
      workflow_id: data?.workflow_id,
      requestor_id: data?.requestor_id,
      department_id: data?.department_id,
      user_id: data?.requestor_id,
    };

    const location_ids = [];
    if (data?.from_location_id) location_ids.push(data.from_location_id);
    if (data?.to_location_id) location_ids.push(data.to_location_id);

    const product_ids = [];

    if (data?.store_requisition_detail?.add) {
      for (const detail of data.store_requisition_detail.add) {
        if (detail?.product_id) {
          product_ids.push(detail?.product_id);
        }
      }
    }

    if ((data as IUpdateStoreRequisition)?.store_requisition_detail?.update) {
      for (const detail of (data as IUpdateStoreRequisition).store_requisition_detail.update) {
        if (detail?.product_id) {
          product_ids.push(detail?.product_id);
        }
      }
    }

    const extractId = {
      ...headerFields,
      product_ids,
      location_ids,
    };

    return extractId;
  }

  private populateDetail(data: any[]) {
    const product_ids = [];

    for (const detail of data) {
      if (detail?.product_id) {
        product_ids.push(detail?.product_id);
      }
    }

    return {
      product_ids,
    };
  }

  private validateBeforeSubmit(storeRequisition: StoreRequisition) {
    ValidateSRBeforeSubmitSchema.parse(storeRequisition);
  }

  private distinctData(d: unknown[]): unknown[] {
    return [...new Set(d)];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async buildUserAction(
    currentStageInfo: any,
    department_id: string | null | undefined,
    department_name: string | null | undefined,
    user_id: string,
    bu_code: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ execute: any[] } | null> {
    const userIdsToAssign: string[] = [];

    // Always add assigned_users from workflow stage
    // assigned_users can be either string[] (IDs) or object[] (full profiles)
    const assignedUsers: any[] = currentStageInfo?.assigned_users || [];
    for (const user of assignedUsers) {
      if (typeof user === 'string') {
        userIdsToAssign.push(user);
      } else if (user?.user_id) {
        userIdsToAssign.push(user.user_id);
      }
    }

    // Add all users in department if creator_access flag is set
    if (currentStageInfo?.creator_access === creatorAccess.ALL_PEOPLE_IN_DEPARTMENT_CAN_ACTION && department_id) {
      const res = this.masterService.send(
        { cmd: 'department-users.find-by-department', service: 'department-users' },
        { department_id, user_id, bu_code },
      );
      const usersInDepartment: { data: { user_id: string }[] } = await firstValueFrom(res);
      userIdsToAssign.push(...usersInDepartment.data.map(u => u.user_id));
    }

    // Add HOD users if is_hod flag is set
    if (currentStageInfo?.is_hod === true && department_id) {
      const hodRes = this.masterService.send(
        { cmd: 'department-users.get-hod-in-department', service: 'department-users' },
        { department_id, user_id, bu_code },
      );
      const hodUsers: { data: string[] } = await firstValueFrom(hodRes);
      userIdsToAssign.push(...hodUsers.data);
    }

    if (userIdsToAssign.length === 0) {
      return null;
    }

    // Get distinct user IDs
    const distinctUserIds = [...new Set(userIdsToAssign)];

    // Fetch full user profiles from auth service
    const profilesRes = this.authService.send(
      { cmd: 'get-user-profiles-by-ids', service: 'auth' },
      {
        user_ids: distinctUserIds,
        department: department_id ? { id: department_id, name: department_name } : undefined,
      },
    );
    const profilesResult: { data: UserActionProfile[] } = await firstValueFrom(profilesRes);

    return { execute: profilesResult.data || [] };
  }

  private async sendSubmitNotification(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storeRequisition: Record<string, any>,
    workflow: WorkflowHeader,
    submitterId: string,
    submitterName: string,
  ): Promise<void> {
    try {
      const approverProfiles = workflow.user_action?.execute || [];
      if (approverProfiles.length === 0) return;

      const approverIds = approverProfiles.map(p => p.user_id);
      const srNo = storeRequisition?.sr_no || 'N/A';
      const title = `Store Requisition Submitted: ${srNo}`;
      const message = `${submitterName} has submitted Store Requisition ${srNo} for your approval.`;

      await this.notificationService.sendToUsers({
        to_user_ids: approverIds,
        from_user_id: submitterId,
        title,
        message,
        type: NotificationType.SR,
        metadata: {
          sr_id: storeRequisition?.id,
          sr_no: srNo,
          action: 'submitted',
          current_stage: workflow.workflow_current_stage,
        },
      });

      this.logger.log(`Notification sent to ${approverIds.length} approver(s) for SR ${srNo}`);
    } catch (error) {
      this.logger.error('Failed to send submit notification:', error);
    }
  }

  private async sendApproveNotification(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storeRequisition: Record<string, any>,
    workflow: WorkflowHeader,
    approverId: string,
    approverName: string,
  ): Promise<void> {
    try {
      const srNo = storeRequisition?.sr_no || 'N/A';
      const requestorId = storeRequisition?.requestor_id;
      const isFullyApproved = workflow.workflow_next_stage === '-';

      if (requestorId) {
        const title = isFullyApproved
          ? `Store Requisition Approved: ${srNo}`
          : `Store Requisition Progress: ${srNo}`;
        const message = isFullyApproved
          ? `Your Store Requisition ${srNo} has been fully approved by ${approverName}.`
          : `Your Store Requisition ${srNo} has been approved by ${approverName} and moved to ${workflow.workflow_current_stage}.`;

        await this.notificationService.sendSRNotification(
          requestorId,
          title,
          message,
          {
            sr_id: storeRequisition?.id,
            sr_no: srNo,
            action: 'approved',
            current_stage: workflow.workflow_current_stage,
            is_fully_approved: isFullyApproved,
          },
          approverId,
        );
      }

      if (!isFullyApproved) {
        const nextApproverProfiles = workflow.user_action?.execute || [];
        const nextApproverIds = nextApproverProfiles.map(p => p.user_id);
        if (nextApproverIds.length > 0) {
          await this.notificationService.sendToUsers({
            to_user_ids: nextApproverIds,
            from_user_id: approverId,
            title: `Store Requisition Pending Approval: ${srNo}`,
            message: `Store Requisition ${srNo} requires your approval at stage: ${workflow.workflow_current_stage}.`,
            type: NotificationType.SR,
            metadata: {
              sr_id: storeRequisition?.id,
              sr_no: srNo,
              action: 'pending_approval',
              current_stage: workflow.workflow_current_stage,
            },
          });
        }
      }

      this.logger.log(`Approval notification sent for SR ${srNo}`);
    } catch (error) {
      this.logger.error('Failed to send approve notification:', error);
    }
  }

  private async sendRejectNotification(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storeRequisition: Record<string, any>,
    userId: string,
    userName: string,
  ): Promise<void> {
    try {
      const srNo = storeRequisition?.sr_no || 'N/A';
      const requestorId = storeRequisition?.requestor_id;
      if (requestorId) {
        await this.notificationService.sendSRNotification(
          requestorId,
          `Store Requisition Rejected: ${srNo}`,
          `Your Store Requisition ${srNo} has been rejected by ${userName}.`,
          {
            sr_id: storeRequisition?.id,
            sr_no: srNo,
            action: 'rejected',
          },
          userId,
        );
      }
      this.logger.log(`Reject notification sent for SR ${srNo}`);
    } catch (error) {
      this.logger.error('Failed to send reject notification:', error);
    }
  }

  private async sendReviewNotification(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storeRequisition: Record<string, any>,
    workflow: WorkflowHeader,
    reviewerId: string,
    reviewerName: string,
  ): Promise<void> {
    try {
      const srNo = storeRequisition?.sr_no || 'N/A';
      const requestorId = storeRequisition?.requestor_id;

      if (requestorId) {
        await this.notificationService.sendSRNotification(
          requestorId,
          `Store Requisition Returned: ${srNo}`,
          `Your Store Requisition ${srNo} has been returned by ${reviewerName} to stage: ${workflow.workflow_current_stage}.`,
          {
            sr_id: storeRequisition?.id,
            sr_no: srNo,
            action: 'reviewed',
            current_stage: workflow.workflow_current_stage,
          },
          reviewerId,
        );
      }

      const actionUserProfiles = workflow.user_action?.execute || [];
      const actionUserIds = actionUserProfiles.map(p => p.user_id).filter(id => id !== requestorId);
      if (actionUserIds.length > 0) {
        await this.notificationService.sendToUsers({
          to_user_ids: actionUserIds,
          from_user_id: reviewerId,
          title: `Store Requisition Needs Attention: ${srNo}`,
          message: `Store Requisition ${srNo} has been returned and requires action at stage: ${workflow.workflow_current_stage}.`,
          type: NotificationType.SR,
          metadata: {
            sr_id: storeRequisition?.id,
            sr_no: srNo,
            action: 'review_pending',
            current_stage: workflow.workflow_current_stage,
          },
        });
      }

      this.logger.log(`Review notification sent for SR ${srNo}`);
    } catch (error) {
      this.logger.error('Failed to send review notification:', error);
    }
  }
}
