import { stage_status } from '@/procurement/purchase-request/dto/purchase-request-detail.dto';
import { enum_last_action } from '@repo/prisma-shared-schema-tenant';
import { NotificationTypeValue } from '@/notification/dto/notification.dto';

// ---------------------------------------------------------------------------
// Core workflow data structures (previously duplicated in PR, PO, SR)
// ---------------------------------------------------------------------------

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

export interface WorkflowHistory {
  action: enum_last_action;
  datetime: string | Date;
  user: {
    id: string;
    name: string;
  };
  current_stage: string;
  next_stage: string;
}

export interface WorkflowHeader {
  workflow_previous_stage: string;
  workflow_current_stage: string;
  workflow_next_stage: string;
  user_action: { execute: UserActionProfile[] } | null;
  last_action: enum_last_action;
  last_action_at_date: string | Date;
  last_action_by_id: string;
  last_action_by_name: string;
  workflow_history: WorkflowHistory[];
}

export interface StageStatus {
  seq: number;
  status: stage_status;
  name: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Adapter: each service (PR, PO, SR) implements this to configure workflow
// ---------------------------------------------------------------------------

export interface WorkflowDocumentAdapter<TDocument = any> {
  /** Display name for this document type, e.g. "Purchase Request" */
  readonly documentTypeName: string;

  /** Short code, e.g. "PR", "PO", "SR" */
  readonly documentTypeCode: string;

  /** NotificationType value for notifications */
  readonly notificationType: NotificationTypeValue;

  /** Extract the document number for notifications (e.g., pr_no, po_no, sr_no) */
  getDocumentNo(doc: TDocument): string;

  /** Extract workflow_id from document */
  getWorkflowId(doc: TDocument): string;

  /** Extract current workflow stage from document */
  getCurrentStage(doc: TDocument): string | null;

  /** Extract previous workflow stage from document */
  getPreviousStage(doc: TDocument): string | null;

  /** Extract workflow_history array from document */
  getWorkflowHistory(doc: TDocument): WorkflowHistory[];

  /**
   * Get department info for buildUserAction.
   * Return null if department needs to be resolved differently (e.g. PO uses creator's department).
   */
  getDepartmentInfo(doc: TDocument): { id: string; name: string } | null;

  /**
   * Get the requestor/creator user ID for notifications.
   * PO uses buyer_id || created_by_id; PR/SR use requestor_id.
   */
  getNotificationRecipientId(doc: TDocument): string | null;

  /**
   * Build the requestData object for workflow navigation.
   * PR/PO include { amount }, SR returns {}.
   */
  buildNavigationRequestData(doc: TDocument): Record<string, any>;
}
