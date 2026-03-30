import { WorkflowDocumentAdapter, WorkflowHistory } from '@/common/workflow/workflow.interfaces';
import { NotificationType } from '@/notification/dto/notification.dto';

export class SRWorkflowAdapter implements WorkflowDocumentAdapter {
  readonly documentTypeName = 'Store Requisition';
  readonly documentTypeCode = 'SR';
  readonly notificationType = NotificationType.SR;

  getDocumentNo(doc: any): string {
    return doc?.sr_no || 'N/A';
  }

  getWorkflowId(doc: any): string {
    return doc?.workflow_id;
  }

  getCurrentStage(doc: any): string | null {
    return doc?.workflow_current_stage || null;
  }

  getPreviousStage(doc: any): string | null {
    return doc?.workflow_previous_stage || null;
  }

  getWorkflowHistory(doc: any): WorkflowHistory[] {
    return doc?.workflow_history?.length > 0 ? doc.workflow_history : [];
  }

  getDepartmentInfo(doc: any): { id: string; name: string } | null {
    if (!doc?.department_id) return null;
    return { id: doc.department_id, name: doc.department_name };
  }

  getNotificationRecipientId(doc: any): string | null {
    return doc?.requestor_id || null;
  }

  buildNavigationRequestData(): Record<string, any> {
    return {};
  }
}
