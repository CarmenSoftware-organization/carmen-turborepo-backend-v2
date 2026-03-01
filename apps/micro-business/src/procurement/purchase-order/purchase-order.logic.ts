import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { MapperLogic } from '@/common/mapper/mapper.logic';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { creatorAccess, NavigateForwardResult, NotificationService, NotificationType } from '@/common';
import { enum_last_action, enum_purchase_order_doc_status, enum_stage_role } from '@repo/prisma-shared-schema-tenant';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import {
  ApprovePurchaseOrderDto,
  RejectPurchaseOrderDto,
  ReviewPurchaseOrderDto,
  SavePurchaseOrderDto,
} from './dto/approve-purchase-order.dto';

export interface UserActionProfile {
  user_id: string;
  email: string;
  firstname: string;
  middlename: string;
  lastname: string;
  initials: string;
  department: {
    id: string;
    name: string;
  } | null;
}

export interface WorkflowHeader {
  workflow_previous_stage: string;
  workflow_current_stage: string;
  workflow_next_stage: string;
  user_action: { execute: UserActionProfile[] };
  last_action: enum_last_action;
  last_action_at_date: string | Date;
  last_action_by_id: string;
  last_action_by_name: string;
  workflow_history: WorkflowHistory[];
}

interface WorkflowHistory {
  action: enum_last_action;
  datetime: string | Date;
  user: {
    id: string;
    name: string;
  };
  current_stage: string;
  next_stage: string;
}

@Injectable()
export class PurchaseOrderLogic {
  private readonly logger: BackendLogger = new BackendLogger(
    PurchaseOrderLogic.name,
  );

  constructor(
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly mapperLogic: MapperLogic,
    @Inject('MASTER_SERVICE')
    private readonly masterService: ClientProxy,
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
    private readonly notificationService: NotificationService,
  ) {}

  async save(
    id: string,
    data: SavePurchaseOrderDto,
    user_id: string,
    tenant_id: string,
  ) {
    await this.purchaseOrderService.initializePrismaService(tenant_id, user_id);

    // Extract IDs from add/update details for bulk population
    const extractIds = this.populateSaveData(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const foreignValue: Record<string, any> = await this.mapperLogic.populate(extractIds, user_id, tenant_id);

    // Enrich header with foreign values
    const header = this.enrichSaveHeader(data, foreignValue);

    // Enrich details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const details: Record<string, any> = {};
    if (data.details?.add) {
      details.add = data.details.add.map((d) => this.enrichSaveDetail(d, foreignValue));
    }
    if (data.details?.update) {
      details.update = data.details.update.map((d) => ({
        ...this.enrichSaveDetail(d, foreignValue),
        id: (d as { id: string }).id,
      }));
    }
    if (data.details?.remove) {
      details.remove = data.details.remove;
    }

    this.logger.debug(
      { function: 'save', id, header, details, user_id, tenant_id },
      PurchaseOrderLogic.name,
    );

    return this.purchaseOrderService.save(id, header, details);
  }

  async approve(
    id: string,
    { stage_role, details }: ApprovePurchaseOrderDto,
    user_id: string,
    tenant_id: string,
  ) {
    await this.purchaseOrderService.initializePrismaService(tenant_id, user_id);

    // Validate user's role matches the payload's stage_role
    await this.validateUserStageRole(id, stage_role);

    /* Workflow Station */
    const purchaseOrderResult = await this.purchaseOrderService.findById(id);
    if (purchaseOrderResult.isError()) {
      throw new Error('Purchase Order not found');
    }
    const purchaseOrderData = purchaseOrderResult.value;
    const total_amount = purchaseOrderData?.tb_purchase_order_detail?.reduce(
      (curr, acc) => curr + Number(acc.total_price || 0),
      0,
    );

    const populateData: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any> = await this.mapperLogic.populate(
      {
        workflow_id: purchaseOrderData?.workflow_id,
        user_id: user_id,
      },
      user_id,
      tenant_id,
    );

    const workflowData = populateData?.workflow_id?.data;

    const res = this.masterService.send(
      { cmd: 'workflows.get-workflow-navigation', service: 'workflows' },
      {
        workflowData,
        currentStatus: purchaseOrderData?.workflow_current_stage,
        previousStatus: purchaseOrderData?.workflow_previous_stage,
        requestData: {
          amount: total_amount,
        },
      },
    );
    const workflowHeader: NavigateForwardResult = await firstValueFrom(res);

    const workflow_history = purchaseOrderData?.workflow_history || [];
    const lastActionAtDate = new Date();
    let workflow = {};

    if (!workflowHeader.navigation_info.workflow_next_step) {
      // Final approval - no next stage
      workflow_history.push({
        action: enum_last_action.approved,
        datetime: lastActionAtDate,
        user: {
          id: user_id,
          name: populateData?.user_id?.name,
        },
        current_stage: workflowHeader.navigation_info.current_stage_info.name,
        next_stage: '-',
      });
      workflow = {
        workflow_previous_stage: purchaseOrderData.workflow_current_stage,
        workflow_current_stage: workflowHeader.navigation_info.current_stage_info.name,
        workflow_next_stage: '-',
        user_action: [],
        last_action: enum_last_action.approved,
        last_action_at_date: lastActionAtDate.toISOString(),
        last_action_by_id: user_id,
        last_action_by_name: populateData?.user_id?.name,
        workflow_history: workflow_history,
        po_status: enum_purchase_order_doc_status.sent,
        approval_date: lastActionAtDate,
      };
    } else {
      // More stages to go
      workflow_history.push({
        action: enum_last_action.approved,
        datetime: lastActionAtDate,
        user: {
          id: user_id,
          name: populateData?.user_id?.name,
        },
        current_stage: purchaseOrderData?.workflow_current_stage,
        next_stage: workflowHeader.navigation_info.current_stage_info.name,
      });

      const userAction = await this.buildUserAction(
        workflowHeader.navigation_info.current_stage_info,
        user_id,
        tenant_id,
      );

      workflow = {
        workflow_previous_stage: workflowHeader.navigation_info.workflow_previous_step,
        workflow_current_stage: workflowHeader.navigation_info.current_stage_info.name,
        workflow_next_stage: workflowHeader.navigation_info.next_stage_info?.name,
        user_action: userAction,
        last_action: enum_last_action.approved,
        last_action_at_date: lastActionAtDate.toISOString(),
        last_action_by_id: user_id,
        last_action_by_name: populateData?.user_id?.name,
        workflow_history: workflow_history,
        po_status: enum_purchase_order_doc_status.in_progress,
      };
    }

    this.logger.debug(
      { function: 'approve', id, stage_role, details, user_id, tenant_id },
      PurchaseOrderLogic.name,
    );
    const result = await this.purchaseOrderService.approve(id, workflow, details);

    // Send notification for approval
    this.sendApproveNotification(
      purchaseOrderData,
      workflow as WorkflowHeader,
      user_id,
      populateData?.user_id?.name,
      tenant_id,
    );

    return result;
  }

  async reject(
    id: string,
    { stage_role, details }: RejectPurchaseOrderDto,
    user_id: string,
    tenant_id: string,
  ) {
    await this.purchaseOrderService.initializePrismaService(tenant_id, user_id);

    // Validate user's role matches the payload's stage_role
    await this.validateUserStageRole(id, stage_role);

    const purchaseOrderResult = await this.purchaseOrderService.findById(id);
    if (purchaseOrderResult.isError()) {
      throw new Error('Purchase Order not found');
    }
    const purchaseOrderData = purchaseOrderResult.value;

    const populateData: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any> = await this.mapperLogic.populate(
      { user_id: user_id },
      user_id,
      tenant_id,
    );

    const workflow_history = purchaseOrderData?.workflow_history || [];
    const lastActionAtDate = new Date();

    workflow_history.push({
      action: enum_last_action.rejected,
      datetime: lastActionAtDate,
      user: {
        id: user_id,
        name: populateData?.user_id?.name,
      },
      current_stage: purchaseOrderData?.workflow_current_stage,
      next_stage: '-',
    });

    const workflow = {
      workflow_previous_stage: purchaseOrderData?.workflow_current_stage,
      workflow_current_stage: purchaseOrderData?.workflow_current_stage,
      workflow_next_stage: '-',
      user_action: [],
      last_action: enum_last_action.rejected,
      last_action_at_date: lastActionAtDate.toISOString(),
      last_action_by_id: user_id,
      last_action_by_name: populateData?.user_id?.name,
      workflow_history: workflow_history,
    };

    this.logger.debug(
      { function: 'reject', id, stage_role, details, user_id, tenant_id },
      PurchaseOrderLogic.name,
    );
    const result = await this.purchaseOrderService.reject(id, workflow, details);

    // Send notification for rejection
    this.sendRejectNotification(
      purchaseOrderData,
      user_id,
      populateData?.user_id?.name,
      tenant_id,
    );

    return result;
  }

  async review(
    id: string,
    body: ReviewPurchaseOrderDto,
    user_id: string,
    tenant_id: string,
  ) {
    await this.purchaseOrderService.initializePrismaService(tenant_id, user_id);

    // Validate user's role matches the payload's stage_role
    await this.validateUserStageRole(id, body.stage_role);

    const purchaseOrderResult = await this.purchaseOrderService.findById(id);
    if (purchaseOrderResult.isError()) {
      throw new Error('Purchase Order not found');
    }
    const purchaseOrderData = purchaseOrderResult.value;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRes: Observable<any> = this.authService.send(
      { cmd: 'get-user-by-id', service: 'auth' },
      { id: user_id },
    );
    const userResponse = await firstValueFrom(userRes);

    const total_amount = purchaseOrderData?.tb_purchase_order_detail?.reduce(
      (curr, acc) => curr + Number(acc.total_price || 0),
      0,
    );

    const workflowNavRes = this.masterService.send(
      { cmd: 'workflows.navigate-back-to-stage', service: 'workflows' },
      {
        workflow_id: purchaseOrderData.workflow_id,
        user_id: user_id,
        bu_code: tenant_id,
        stage: body.des_stage,
        current_stage: purchaseOrderData.workflow_current_stage,
        requestData: {
          amount: total_amount,
        },
      },
    );
    const backToStageRes = await firstValueFrom(workflowNavRes);
    const workflowHeader: NavigateForwardResult = backToStageRes.data;

    const workflow_history = purchaseOrderData?.workflow_history || [];
    const lastActionAtDate = new Date();

    workflow_history.push({
      action: enum_last_action.reviewed,
      datetime: lastActionAtDate,
      user: {
        id: user_id,
        name: userResponse?.data?.name,
      },
      current_stage: purchaseOrderData?.workflow_current_stage,
      next_stage: workflowHeader.navigation_info.workflow_next_step,
    });

    const userAction = await this.buildUserAction(
      workflowHeader.navigation_info.current_stage_info,
      user_id,
      tenant_id,
    );

    const workflow = {
      workflow_previous_stage: purchaseOrderData.workflow_current_stage,
      workflow_current_stage: workflowHeader.navigation_info.current_stage_info.name,
      workflow_next_stage: workflowHeader.navigation_info.workflow_next_step,
      user_action: userAction,
      last_action: enum_last_action.reviewed,
      last_action_at_date: lastActionAtDate.toISOString(),
      last_action_by_id: user_id,
      last_action_by_name: userResponse?.data?.name,
      workflow_history: workflow_history,
    };

    this.logger.debug(
      { function: 'review', id, body, user_id, tenant_id },
      PurchaseOrderLogic.name,
    );
    const result = await this.purchaseOrderService.review(id, workflow, body.details);

    // Send notification for review
    this.sendReviewNotification(
      purchaseOrderData,
      workflow as WorkflowHeader,
      user_id,
      userResponse?.data?.name,
      tenant_id,
    );

    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private populateSaveData(data: SavePurchaseOrderDto): Record<string, any> {
    const unit_ids: string[] = [];
    const tax_profile_ids: string[] = [];
    const product_ids: string[] = [];
    const vendor_ids: string[] = [];
    const currency_ids: string[] = [];

    // Header IDs
    if (data.vendor_id) vendor_ids.push(data.vendor_id);
    if (data.currency_id) currency_ids.push(data.currency_id);

    // Collect IDs from add and update details
    const allDetails = [...(data.details?.add || []), ...(data.details?.update || [])];
    for (const detail of allDetails) {
      if (detail.product_id) product_ids.push(detail.product_id);
      if (detail.order_unit_id) unit_ids.push(detail.order_unit_id);
      if (detail.base_unit_id) unit_ids.push(detail.base_unit_id);
      if (detail.tax_profile_id) tax_profile_ids.push(detail.tax_profile_id);
    }

    return { unit_ids, tax_profile_ids, product_ids, vendor_ids, currency_ids };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private enrichSaveHeader(data: SavePurchaseOrderDto, foreignValue: Record<string, any>): Partial<SavePurchaseOrderDto> {
    const header: Record<string, unknown> = {};
    if (data.vendor_id !== undefined) header.vendor_id = data.vendor_id;
    if (data.vendor_id) {
      header.vendor_name = this.findByIdInArray(foreignValue?.vendor_ids, data.vendor_id)?.name || data.vendor_name;
    }
    if (data.delivery_date !== undefined) header.delivery_date = data.delivery_date;
    if (data.currency_id !== undefined) header.currency_id = data.currency_id;
    if (data.currency_id) {
      header.currency_code = this.findByIdInArray(foreignValue?.currency_ids, data.currency_id)?.code || data.currency_code;
    }
    if (data.exchange_rate !== undefined) header.exchange_rate = data.exchange_rate;
    if (data.description !== undefined) header.description = data.description;
    if (data.order_date !== undefined) header.order_date = data.order_date;
    if (data.credit_term_id !== undefined) header.credit_term_id = data.credit_term_id;
    if (data.credit_term_name !== undefined) header.credit_term_name = data.credit_term_name;
    if (data.credit_term_value !== undefined) header.credit_term_value = data.credit_term_value;
    if (data.buyer_id !== undefined) header.buyer_id = data.buyer_id;
    if (data.buyer_name !== undefined) header.buyer_name = data.buyer_name;
    if (data.email !== undefined) header.email = data.email;
    if (data.remarks !== undefined) header.remarks = data.remarks;
    if (data.note !== undefined) header.note = data.note;
    return header;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private enrichSaveDetail(detail: Record<string, any>, foreignValue: Record<string, any>): Record<string, any> {
    return JSON.parse(
      JSON.stringify({
        ...detail,
        product_name:
          this.findByIdInArray(foreignValue?.product_ids, detail.product_id)?.name || detail.product_name,
        order_unit_name:
          this.findByIdInArray(foreignValue?.unit_ids, detail.order_unit_id)?.name || detail.order_unit_name,
        base_unit_name:
          this.findByIdInArray(foreignValue?.unit_ids, detail.base_unit_id)?.name || detail.base_unit_name,
        tax_profile_name:
          this.findByIdInArray(foreignValue?.tax_profile_ids, detail.tax_profile_id)?.name || detail.tax_profile_name,
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private findByIdInArray(arr: Record<string, any>[] | undefined, id: string | undefined): Record<string, any> | null {
    if (!arr || !id) return null;
    return arr.find((item) => item.id === id) || null;
  }

  private async validateUserStageRole(
    id: string,
    payloadStageRole: enum_stage_role,
  ): Promise<void> {
    const purchaseOrderResult = await this.purchaseOrderService.findById(id);
    if (purchaseOrderResult.isError()) {
      throw new BadRequestException('Purchase Order not found');
    }

    const purchaseOrder = purchaseOrderResult.value;
    const userActualRole = purchaseOrder.role;

    if (userActualRole === enum_stage_role.view_only) {
      throw new BadRequestException(
        `User does not have permission to perform this action. User role: ${userActualRole}`,
      );
    }

    if (payloadStageRole !== userActualRole) {
      throw new BadRequestException(
        `Invalid stage_role. Expected: ${userActualRole}, Received: ${payloadStageRole}`,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async buildUserAction(
    currentStageInfo: any,
    user_id: string,
    bu_code: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ execute: any[] } | null> {
    const userIdsToAssign: string[] = [];

    // Always add assigned_users from workflow stage
    const assignedUsers: any[] = currentStageInfo?.assigned_users || [];
    for (const user of assignedUsers) {
      if (typeof user === 'string') {
        userIdsToAssign.push(user);
      } else if (user?.user_id) {
        userIdsToAssign.push(user.user_id);
      }
    }

    // Add all users in department if creator_access flag is set
    if (currentStageInfo?.creator_access === creatorAccess.ALL_PEOPLE_IN_DEPARTMENT_CAN_ACTION) {
      // For PO, we don't have department_id in the same way as PR
    }

    if (userIdsToAssign.length === 0) {
      return null;
    }

    // Get distinct user IDs
    const distinctUserIds = [...new Set(userIdsToAssign)];

    // Fetch full user profiles from auth service
    const profilesRes = this.authService.send(
      { cmd: 'get-user-profiles-by-ids', service: 'auth' },
      { user_ids: distinctUserIds, bu_code },
    );
    const profilesResult: { data: UserActionProfile[] } = await firstValueFrom(profilesRes);

    return { execute: profilesResult.data || [] };
  }

  private async sendApproveNotification(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    purchaseOrder: Record<string, any>,
    workflow: WorkflowHeader,
    user_id: string,
    user_name: string,
    bu_code: string,
  ): Promise<void> {
    try {
      const isFinalApproval = workflow.workflow_next_stage === '-';
      const poNo = purchaseOrder.po_no;

      if (isFinalApproval) {
        const recipientId = purchaseOrder.buyer_id || purchaseOrder.created_by_id;
        if (recipientId) {
          await this.notificationService.sendToUsers({
            to_user_ids: [recipientId],
            from_user_id: user_id,
            title: `Purchase Order Approved: ${poNo}`,
            message: `PO ${poNo} has been approved by ${user_name}`,
            type: NotificationType.PO,
            metadata: {
              type: 'purchase-order',
              id: purchaseOrder.id,
              bu_code: bu_code,
              action: 'approved',
            },
          });
        }
      } else {
        const nextApproverIds = workflow.user_action?.execute?.map((u) => u.user_id) || [];
        if (nextApproverIds.length > 0) {
          await this.notificationService.sendToUsers({
            to_user_ids: nextApproverIds,
            from_user_id: user_id,
            title: `Purchase Order Pending Approval: ${poNo}`,
            message: `PO ${poNo} requires your approval at stage: ${workflow.workflow_current_stage}`,
            type: NotificationType.PO,
            metadata: {
              type: 'purchase-order',
              id: purchaseOrder.id,
              bu_code: bu_code,
              action: 'pending_approval',
            },
          });
        }
      }

      this.logger.log(`Notification sent for PO ${poNo}`);
    } catch (error) {
      this.logger.error(
        { function: 'sendApproveNotification', error: (error as Error).message },
        PurchaseOrderLogic.name,
      );
    }
  }

  private async sendRejectNotification(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    purchaseOrder: Record<string, any>,
    user_id: string,
    user_name: string,
    bu_code: string,
  ): Promise<void> {
    try {
      const poNo = purchaseOrder.po_no;
      const recipientId = purchaseOrder.buyer_id || purchaseOrder.created_by_id;
      if (recipientId) {
        await this.notificationService.sendToUsers({
          to_user_ids: [recipientId],
          from_user_id: user_id,
          title: `Purchase Order Rejected: ${poNo}`,
          message: `PO ${poNo} has been rejected by ${user_name}`,
          type: NotificationType.PO,
          metadata: {
            type: 'purchase-order',
            id: purchaseOrder.id,
            bu_code: bu_code,
            action: 'rejected',
          },
        });
      }

      this.logger.log(`Reject notification sent for PO ${poNo}`);
    } catch (error) {
      this.logger.error(
        { function: 'sendRejectNotification', error: (error as Error).message },
        PurchaseOrderLogic.name,
      );
    }
  }

  private async sendReviewNotification(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    purchaseOrder: Record<string, any>,
    workflow: WorkflowHeader,
    user_id: string,
    user_name: string,
    bu_code: string,
  ): Promise<void> {
    try {
      const poNo = purchaseOrder.po_no;

      // Notify buyer/creator that PO was sent back for review
      const recipientId = purchaseOrder.buyer_id || purchaseOrder.created_by_id;
      if (recipientId) {
        await this.notificationService.sendToUsers({
          to_user_ids: [recipientId],
          from_user_id: user_id,
          title: `Purchase Order Reviewed: ${poNo}`,
          message: `PO ${poNo} has been sent back for review by ${user_name}`,
          type: NotificationType.PO,
          metadata: {
            type: 'purchase-order',
            id: purchaseOrder.id,
            bu_code: bu_code,
            action: 'reviewed',
          },
        });
      }

      // Notify users at the target stage
      const actionUserIds = workflow.user_action?.execute?.map((u) => u.user_id) || [];
      if (actionUserIds.length > 0) {
        await this.notificationService.sendToUsers({
          to_user_ids: actionUserIds,
          from_user_id: user_id,
          title: `Purchase Order Requires Action: ${poNo}`,
          message: `PO ${poNo} has been sent back to stage: ${workflow.workflow_current_stage}`,
          type: NotificationType.PO,
          metadata: {
            type: 'purchase-order',
            id: purchaseOrder.id,
            bu_code: bu_code,
            action: 'review_action_required',
          },
        });
      }

      this.logger.log(`Review notification sent for PO ${poNo}`);
    } catch (error) {
      this.logger.error(
        { function: 'sendReviewNotification', error: (error as Error).message },
        PurchaseOrderLogic.name,
      );
    }
  }
}
