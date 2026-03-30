import { WorkflowDocumentAdapter, WorkflowHistory } from '@/common/workflow/workflow.interfaces';
import { NotificationType } from '@/notification/dto/notification.dto';

export class POWorkflowAdapter implements WorkflowDocumentAdapter {
  readonly documentTypeName = 'Purchase Order';
  readonly documentTypeCode = 'PO';
  readonly notificationType = NotificationType.PO;

  getDocumentNo(doc: any): string {
    return doc?.po_no || 'N/A';
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

  /**
   * PO uses the creator's department (looked up separately via getCreatorDepartment),
   * so this returns null — the PO logic passes departmentOverride to the orchestrator.
   */
  getDepartmentInfo(): { id: string; name: string } | null {
    return null;
  }

  getNotificationRecipientId(doc: any): string | null {
    return doc?.buyer_id || doc?.created_by_id || null;
  }

  buildNavigationRequestData(doc: any): Record<string, any> {
    const totalAmount = doc?.tb_purchase_order_detail?.reduce(
      (sum: number, d: any) => sum + Number(d.total_price || 0), 0,
    ) || 0;
    return { amount: totalAmount };
  }
}
