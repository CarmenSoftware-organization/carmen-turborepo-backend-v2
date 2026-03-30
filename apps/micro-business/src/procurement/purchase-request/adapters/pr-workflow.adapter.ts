import { WorkflowDocumentAdapter, WorkflowHistory } from '@/common/workflow/workflow.interfaces';
import { NotificationType } from '@/notification/dto/notification.dto';

export class PRWorkflowAdapter implements WorkflowDocumentAdapter {
  readonly documentTypeName = 'Purchase Request';
  readonly documentTypeCode = 'PR';
  readonly notificationType = NotificationType.PR;

  getDocumentNo(doc: any): string {
    return doc?.pr_no || 'N/A';
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

  buildNavigationRequestData(doc: any): Record<string, any> {
    const totalAmount = doc?.purchase_request_detail?.reduce(
      (sum: number, d: any) => sum + (d.total_price || 0), 0,
    ) || 0;
    return { amount: totalAmount };
  }
}
