import {
  WorkflowDocument,
  WorkflowHistory,
} from '@/common/workflow/workflow.interfaces';

/**
 * Map a Store Requisition record to the canonical WorkflowDocument shape
 * that the WorkflowOrchestratorService consumes.
 *
 * Pure function — SR stores requestor and department directly on the header
 * and does not use amount-based stage routing, so navigation_request_data is
 * always empty.
 */
export function srToWorkflowDocument(
  sr: {
    id: string;
    workflow_id: string | null;
    workflow_current_stage: string | null;
    workflow_previous_stage: string | null;
    workflow_history?: unknown;
    requestor_id?: string | null;
    department_id?: string | null;
    department_name?: string | null;
  },
): WorkflowDocument {
  if (!sr.workflow_id) {
    throw new Error(
      `srToWorkflowDocument: SR ${sr.id} has no workflow_id — cannot run workflow actions on an SR without a workflow.`,
    );
  }

  const history = Array.isArray(sr.workflow_history)
    ? (sr.workflow_history as WorkflowHistory[])
    : [];

  const department =
    sr.department_id != null
      ? { id: sr.department_id, name: sr.department_name ?? '' }
      : null;

  return {
    id: sr.id,
    workflow_id: sr.workflow_id,
    workflow_current_stage: sr.workflow_current_stage,
    workflow_previous_stage: sr.workflow_previous_stage,
    workflow_history: history,
    requestor_id: sr.requestor_id ?? null,
    department,
    navigation_request_data: {},
  };
}
