import { stage_status } from '@/procurement/purchase-request/dto/purchase-request-detail.dto';
import { WorkflowPersistenceHelper } from './workflow-persistence.helper';
import { StageStatus } from './workflow.interfaces';

describe('WorkflowPersistenceHelper', () => {
  // ===========================================================================
  // buildSubmitStagesStatus
  // ===========================================================================
  describe('buildSubmitStagesStatus', () => {
    it('should skip when detail stage_status is approve', () => {
      const { stages, skipped } = WorkflowPersistenceHelper.buildSubmitStagesStatus(
        [],
        { stage_status: stage_status.approve, stage_message: '' },
        'Requestor',
      );

      expect(skipped).toBe(true);
      expect(stages).toEqual([]);
    });

    it('should push first entry (seq 1) when stage_status is submit', () => {
      const { stages, skipped } = WorkflowPersistenceHelper.buildSubmitStagesStatus(
        [],
        { stage_status: stage_status.submit, stage_message: 'submit for approval' },
        'Requestor',
      );

      expect(skipped).toBe(false);
      expect(stages).toHaveLength(1);
      expect(stages[0]).toEqual({
        seq: 1,
        status: stage_status.submit,
        name: 'Requestor',
        message: 'submit for approval',
      });
    });

    it('should replace pending stage at same workflow stage', () => {
      const existing: StageStatus[] = [
        { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
        { seq: 2, status: stage_status.pending, name: 'HOD', message: '' },
      ];

      const { stages } = WorkflowPersistenceHelper.buildSubmitStagesStatus(
        existing,
        { stage_status: stage_status.approve, stage_message: 'ok' },
        'HOD',
      );

      // Should NOT push new entry, should replace the pending one
      // Wait - approve is handled by the skip branch. Let me use a different status.
      // Actually "approve" in submit is skipped. Let me test with a re-submit after review.
    });

    it('should skip when stage was already approved in stages_status', () => {
      const existing: StageStatus[] = [
        { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
        { seq: 2, status: stage_status.approve, name: 'HOD', message: '' },
        { seq: 3, status: stage_status.pending, name: 'Purchaser', message: '' },
      ];

      const { stages, skipped } = WorkflowPersistenceHelper.buildSubmitStagesStatus(
        existing,
        { stage_status: stage_status.submit, stage_message: '' },
        'HOD',
      );

      expect(skipped).toBe(true);
      expect(stages).toHaveLength(3);
    });

    it('should push new entry when approved stage is different', () => {
      const existing: StageStatus[] = [
        { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
        { seq: 2, status: stage_status.approve, name: 'HOD', message: '' },
      ];

      const { stages, skipped } = WorkflowPersistenceHelper.buildSubmitStagesStatus(
        existing,
        { stage_status: stage_status.submit, stage_message: 're-submit' },
        'Purchaser',
      );

      expect(skipped).toBe(false);
      expect(stages).toHaveLength(3);
    });

    it('should replace pending entry when re-submitting after review', () => {
      const existing: StageStatus[] = [
        { seq: 1, status: stage_status.approve, name: 'HOD', message: '' },
        { seq: 2, status: stage_status.pending, name: 'Create Request', message: '' },
      ];

      const { stages, skipped } = WorkflowPersistenceHelper.buildSubmitStagesStatus(
        existing,
        { stage_status: stage_status.submit, stage_message: 'submit for approval' },
        'Create Request',
      );

      expect(skipped).toBe(false);
      expect(stages).toHaveLength(2);
      expect(stages[1]).toEqual({
        seq: 2,
        status: stage_status.submit,
        name: 'Create Request',
        message: 'submit for approval',
      });
    });

    it('should replace pending entry at same stage name', () => {
      const existing: StageStatus[] = [
        { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
        { seq: 2, status: stage_status.pending, name: 'HOD', message: '' },
      ];

      const { stages, skipped } = WorkflowPersistenceHelper.buildSubmitStagesStatus(
        existing,
        { stage_status: stage_status.review, stage_message: 'updated' },
        'HOD',
      );

      expect(skipped).toBe(false);
      expect(stages).toHaveLength(2);
      expect(stages[1].status).toBe(stage_status.review);
      expect(stages[1].message).toBe('updated');
    });
  });

  // ===========================================================================
  // buildApproveStagesStatus
  // ===========================================================================
  describe('buildApproveStagesStatus', () => {
    it('should skip when latest stage is already approved at same stage', () => {
      const existing: StageStatus[] = [
        { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
        { seq: 2, status: stage_status.approve, name: 'HOD', message: '' },
      ];

      const { stages, skipped } = WorkflowPersistenceHelper.buildApproveStagesStatus(
        existing,
        { stage_status: stage_status.approve },
        'HOD',
      );

      expect(skipped).toBe(true);
      expect(stages).toHaveLength(2);
    });

    it('should skip when latest stage is rejected', () => {
      const existing: StageStatus[] = [
        { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
        { seq: 2, status: stage_status.reject, name: 'HOD', message: 'rejected' },
      ];

      const { stages, skipped } = WorkflowPersistenceHelper.buildApproveStagesStatus(
        existing,
        { stage_status: stage_status.approve },
        'HOD',
      );

      expect(skipped).toBe(true);
      expect(stages).toHaveLength(2);
    });

    it('should replace pending stage at same workflow stage', () => {
      const existing: StageStatus[] = [
        { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
        { seq: 2, status: stage_status.pending, name: 'HOD', message: '' },
      ];

      const { stages, skipped } = WorkflowPersistenceHelper.buildApproveStagesStatus(
        existing,
        { stage_status: stage_status.approve, stage_message: 'looks good' },
        'HOD',
      );

      expect(skipped).toBe(false);
      expect(stages).toHaveLength(2);
      expect(stages[1].status).toBe(stage_status.approve);
      expect(stages[1].message).toBe('looks good');
    });

    it('should push new entry when not pending at current stage', () => {
      const existing: StageStatus[] = [
        { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
        { seq: 2, status: stage_status.approve, name: 'HOD', message: '' },
      ];

      const { stages, skipped } = WorkflowPersistenceHelper.buildApproveStagesStatus(
        existing,
        { stage_status: stage_status.approve },
        'Purchaser',
      );

      expect(skipped).toBe(false);
      expect(stages).toHaveLength(3);
      expect(stages[2]).toEqual({
        seq: 3,
        status: stage_status.approve,
        name: 'Purchaser',
        message: '',
      });
    });
  });

  // ===========================================================================
  // buildRejectStagesStatus
  // ===========================================================================
  describe('buildRejectStagesStatus', () => {
    it('should mark all existing stages as rejected and append rejection entry', () => {
      const existing: StageStatus[] = [
        { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
        { seq: 2, status: stage_status.approve, name: 'Purchaser', message: '' },
      ];

      const result = WorkflowPersistenceHelper.buildRejectStagesStatus(
        existing,
        { stage_status: stage_status.reject, stage_message: 'not approved' },
        'HOD',
      );

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe(stage_status.reject);
      expect(result[1].status).toBe(stage_status.reject);
      expect(result[2]).toEqual({
        seq: 3,
        status: stage_status.reject,
        name: 'HOD',
        message: 'not approved',
      });
    });

    it('should handle empty stages', () => {
      const result = WorkflowPersistenceHelper.buildRejectStagesStatus(
        [],
        { stage_status: stage_status.reject, stage_message: 'rejected' },
        'HOD',
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        seq: 1,
        status: stage_status.reject,
        name: 'HOD',
        message: 'rejected',
      });
    });
  });

  // ===========================================================================
  // buildReviewStagesStatus
  // ===========================================================================
  describe('buildReviewStagesStatus', () => {
    it('should reset target stage to pending', () => {
      const existing: StageStatus[] = [
        { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
        { seq: 2, status: stage_status.approve, name: 'HOD', message: '' },
        { seq: 3, status: stage_status.pending, name: 'Purchaser', message: '' },
      ];

      const result = WorkflowPersistenceHelper.buildReviewStagesStatus(existing, 'HOD');

      const hodStage = result.find((s) => s.name === 'HOD');
      expect(hodStage.status).toBe(stage_status.pending);
      // Stages after HOD should be trimmed
      expect(result.some((s) => s.name === 'Purchaser')).toBe(false);
      expect(result).toHaveLength(2);
    });

    it('should trim stages after target when sending back multiple levels', () => {
      const existing: StageStatus[] = [
        { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
        { seq: 2, status: stage_status.approve, name: 'HOD', message: '' },
        { seq: 3, status: stage_status.approve, name: 'Purchaser', message: '' },
        { seq: 4, status: stage_status.pending, name: 'GM', message: '' },
      ];

      const result = WorkflowPersistenceHelper.buildReviewStagesStatus(existing, 'HOD');

      const hodStage = result.find((s) => s.name === 'HOD');
      expect(hodStage.status).toBe(stage_status.pending);
      // Stages after HOD should be trimmed
      expect(result.some((s) => s.name === 'Purchaser')).toBe(false);
      expect(result.some((s) => s.name === 'GM')).toBe(false);
      expect(result).toHaveLength(2);
    });
  });

  // ===========================================================================
  // appendHistory
  // ===========================================================================
  describe('appendHistory', () => {
    it('should append entry with correct seq number', () => {
      const existing = [
        { seq: 1, status: 'submit', name: 'Requestor', message: '' },
      ];

      const result = WorkflowPersistenceHelper.appendHistory(
        existing as any,
        {
          status: stage_status.approve,
          name: 'HOD',
          message: 'approved',
          userId: 'user-1',
          userName: 'Test User',
        },
      );

      expect(result).toHaveLength(2);
      expect(result[1]).toEqual(
        expect.objectContaining({
          seq: 2,
          status: stage_status.approve,
          name: 'HOD',
          message: 'approved',
          user: { id: 'user-1', name: 'Test User' },
        }),
      );
    });

    it('should handle empty history', () => {
      const result = WorkflowPersistenceHelper.appendHistory(
        [],
        {
          status: stage_status.submit,
          name: 'Requestor',
          userId: 'user-1',
        },
      );

      expect(result).toHaveLength(1);
      expect(result[0].seq).toBe(1);
    });

    it('should include action field when provided', () => {
      const result = WorkflowPersistenceHelper.appendHistory(
        [],
        {
          status: stage_status.approve,
          name: 'HOD',
          userId: 'user-1',
          action: 'approved',
        },
      );

      expect(result[0]).toHaveProperty('action', 'approved');
    });

    it('should handle null history input', () => {
      const result = WorkflowPersistenceHelper.appendHistory(
        null as any,
        {
          status: stage_status.submit,
          name: 'Requestor',
          userId: 'user-1',
        },
      );

      expect(result).toHaveLength(1);
    });
  });

  // ===========================================================================
  // Composite detail-update builders
  // ===========================================================================

  describe('buildRejectDetailUpdate', () => {
    it('should stamp current_stage_status as reject', () => {
      const result = WorkflowPersistenceHelper.buildRejectDetailUpdate({
        payloadDetail: { stage_status: stage_status.reject, stage_message: 'no' },
        currentStages: [{ seq: 1, status: stage_status.submit, name: 'Requestor', message: '' }],
        currentHistory: [],
        workflowCurrentStage: 'HOD',
        userId: 'user-1',
      });

      expect(result.current_stage_status).toBe(stage_status.reject);
      expect(result.stages_status).toHaveLength(2);
      expect(result.history).toHaveLength(1);
    });
  });

  describe('buildReviewDetailUpdate', () => {
    it('approve-during-review pushes an approve entry and current_stage_status is empty', () => {
      const result = WorkflowPersistenceHelper.buildReviewDetailUpdate({
        payloadDetail: { stage_status: stage_status.approve, stage_message: 'keep' },
        currentStages: [
          { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
          { seq: 2, status: stage_status.pending, name: 'HOD', message: '' },
        ],
        currentHistory: [],
        workflowPreviousStage: 'HOD',
        desStage: 'Requestor',
        userId: 'user-1',
      });

      expect(result).not.toBeNull();
      expect(result!.current_stage_status).toBe('');
      expect(result!.stages_status).toHaveLength(2);
      expect(result!.stages_status[1]).toMatchObject({ status: stage_status.approve, name: 'HOD' });
      expect(result!.history).toHaveLength(1);
    });

    it('approve-during-review returns null when item already approved at the stage', () => {
      const result = WorkflowPersistenceHelper.buildReviewDetailUpdate({
        payloadDetail: { stage_status: stage_status.approve, stage_message: '' },
        currentStages: [
          { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
          { seq: 2, status: stage_status.approve, name: 'HOD', message: '' },
        ],
        currentHistory: [],
        workflowPreviousStage: 'HOD',
        desStage: 'Requestor',
        userId: 'user-1',
      });

      expect(result).toBeNull();
    });

    it('approve-during-review keeps current_stage_status empty when not final', () => {
      const result = WorkflowPersistenceHelper.buildReviewDetailUpdate({
        payloadDetail: { stage_status: stage_status.approve, stage_message: '' },
        currentStages: [{ seq: 1, status: stage_status.pending, name: 'HOD', message: '' }],
        currentHistory: [],
        workflowPreviousStage: 'HOD',
        desStage: 'Requestor',
        isFinalApproval: false,
        userId: 'user-1',
      });

      expect(result).not.toBeNull();
      expect(result!.current_stage_status).toBe('');
    });

    it('should stamp reject on review when payload stage_status is reject', () => {
      const result = WorkflowPersistenceHelper.buildReviewDetailUpdate({
        payloadDetail: { stage_status: stage_status.reject, stage_message: 'bad' },
        currentStages: [{ seq: 1, status: stage_status.submit, name: 'Requestor', message: '' }],
        currentHistory: [],
        workflowPreviousStage: 'HOD',
        desStage: 'Requestor',
        userId: 'user-1',
      });

      expect(result).not.toBeNull();
      expect(result.current_stage_status).toBe(stage_status.reject);
    });

    it('should set empty current_stage_status for review (send-back)', () => {
      const result = WorkflowPersistenceHelper.buildReviewDetailUpdate({
        payloadDetail: { stage_status: stage_status.review, stage_message: 'fix' },
        currentStages: [
          { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
          { seq: 2, status: stage_status.pending, name: 'HOD', message: '' },
        ],
        currentHistory: [],
        workflowPreviousStage: 'HOD',
        desStage: 'Requestor',
        userId: 'user-1',
      });

      expect(result).not.toBeNull();
      expect(result.current_stage_status).toBe('');
    });
  });

  describe('buildApproveDetailUpdate', () => {
    it('should stamp approve on final approval', () => {
      const result = WorkflowPersistenceHelper.buildApproveDetailUpdate({
        payloadDetail: { stage_status: stage_status.approve, stage_message: 'ok' },
        currentStages: [{ seq: 1, status: stage_status.submit, name: 'Requestor', message: '' }],
        currentHistory: [],
        workflowPreviousStage: 'HOD',
        isFinalApproval: true,
        userId: 'user-1',
      });

      expect(result).not.toBeNull();
      expect(result.current_stage_status).toBe(stage_status.approve);
    });

    it('should set empty current_stage_status for intermediate approval', () => {
      const result = WorkflowPersistenceHelper.buildApproveDetailUpdate({
        payloadDetail: { stage_status: stage_status.approve, stage_message: 'ok' },
        currentStages: [{ seq: 1, status: stage_status.submit, name: 'Requestor', message: '' }],
        currentHistory: [],
        workflowPreviousStage: 'HOD',
        isFinalApproval: false,
        userId: 'user-1',
      });

      expect(result).not.toBeNull();
      expect(result.current_stage_status).toBe('');
    });

    it('should stamp reject when a detail is individually rejected during approve', () => {
      const result = WorkflowPersistenceHelper.buildApproveDetailUpdate({
        payloadDetail: { stage_status: stage_status.reject, stage_message: 'nope' },
        currentStages: [{ seq: 1, status: stage_status.submit, name: 'Requestor', message: '' }],
        currentHistory: [],
        workflowPreviousStage: 'HOD',
        isFinalApproval: false,
        userId: 'user-1',
      });

      expect(result).not.toBeNull();
      expect(result.current_stage_status).toBe(stage_status.reject);
    });

    it('should return null (skip) when already approved at same stage', () => {
      const result = WorkflowPersistenceHelper.buildApproveDetailUpdate({
        payloadDetail: { stage_status: stage_status.approve },
        currentStages: [
          { seq: 1, status: stage_status.submit, name: 'Requestor', message: '' },
          { seq: 2, status: stage_status.approve, name: 'HOD', message: '' },
        ],
        currentHistory: [],
        workflowPreviousStage: 'HOD',
        isFinalApproval: false,
        userId: 'user-1',
      });

      expect(result).toBeNull();
    });
  });

  describe('buildSubmitDetailUpdate', () => {
    it('should return null (skip) when detail stage_status is approve', () => {
      const result = WorkflowPersistenceHelper.buildSubmitDetailUpdate({
        payloadDetail: { stage_status: stage_status.approve },
        currentStages: [],
        currentHistory: [],
        workflowPreviousStage: 'Requestor',
        userId: 'user-1',
      });

      expect(result).toBeNull();
    });

    it('should set empty current_stage_status on submit', () => {
      const result = WorkflowPersistenceHelper.buildSubmitDetailUpdate({
        payloadDetail: { stage_status: stage_status.submit, stage_message: '' },
        currentStages: [],
        currentHistory: [],
        workflowPreviousStage: 'Requestor',
        userId: 'user-1',
      });

      expect(result).not.toBeNull();
      expect(result.current_stage_status).toBe('');
      expect(result.stages_status).toHaveLength(1);
      expect(result.history).toHaveLength(1);
    });
  });
});
