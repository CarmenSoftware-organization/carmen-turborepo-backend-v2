import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowOrchestratorService } from './workflow-orchestrator.service';
import { MapperLogic } from '@/common/mapper/mapper.logic';
import { WorkflowDocumentAdapter, WorkflowHeader } from './workflow.interfaces';
import { enum_last_action, enum_stage_role } from '@repo/prisma-shared-schema-tenant';
import { of } from 'rxjs';

describe('WorkflowOrchestratorService', () => {
  let service: WorkflowOrchestratorService;

  const mockMasterService = { send: jest.fn() };
  const mockAuthService = { send: jest.fn() };
  const mockMapperLogic = { populate: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowOrchestratorService,
        { provide: 'MASTER_SERVICE', useValue: mockMasterService },
        { provide: 'AUTH_SERVICE', useValue: mockAuthService },
        { provide: MapperLogic, useValue: mockMapperLogic },
      ],
    }).compile();

    service = module.get(WorkflowOrchestratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const USER_ID = '00000000-0000-4000-a000-000000000001';
  const BU_CODE = 'BU001';

  const mockAdapter: WorkflowDocumentAdapter = {
    documentTypeName: 'Test Document',
    documentTypeCode: 'TD',
    notificationType: 'PR',
    getDocumentNo: (doc) => doc.doc_no || 'N/A',
    getWorkflowId: (doc) => doc.workflow_id,
    getCurrentStage: (doc) => doc.workflow_current_stage,
    getPreviousStage: (doc) => doc.workflow_previous_stage,
    getWorkflowHistory: (doc) => doc.workflow_history || [],
    getDepartmentInfo: (doc) => doc.department_id ? { id: doc.department_id, name: doc.department_name } : null,
    getNotificationRecipientId: (doc) => doc.requestor_id,
    buildNavigationRequestData: (doc) => ({ amount: doc.total_amount || 0 }),
  };

  function mockDocument(overrides: Record<string, any> = {}) {
    return {
      id: 'doc-001',
      doc_no: 'TD-001',
      workflow_id: 'wf-001',
      workflow_current_stage: null,
      workflow_previous_stage: null,
      workflow_history: [],
      department_id: 'dept-001',
      department_name: 'Kitchen',
      requestor_id: USER_ID,
      total_amount: 1000,
      ...overrides,
    };
  }

  function setupMapperPopulate(workflowData: any = { stages: [] }, userName = 'Test User') {
    mockMapperLogic.populate.mockImplementation(async (keys: Record<string, any>) => {
      const result: Record<string, any> = {};
      if (keys.workflow_id) result.workflow_id = { data: workflowData };
      if (keys.user_id) result.user_id = { name: userName };
      return result;
    });
  }

  function mockNavigateForward(currentStage: string, nextStep: string | null, previousStage?: string) {
    return of({
      previous_stage: previousStage || 'PrevStage',
      current_stage: currentStage,
      navigation_info: {
        workflow_next_step: nextStep,
        current_stage_info: { name: currentStage, assigned_users: [] },
      },
    });
  }

  // ===========================================================================
  // buildSubmitWorkflow
  // ===========================================================================
  describe('buildSubmitWorkflow', () => {
    it('should build workflow header for submit action', async () => {
      setupMapperPopulate({ stages: [{ name: 'Draft' }, { name: 'HOD' }] });

      // First call: get first stage, second call: navigate forward
      mockMasterService.send
        .mockReturnValueOnce(mockNavigateForward('Draft', 'HOD', null))
        .mockReturnValueOnce(mockNavigateForward('HOD', 'Purchaser', 'Draft'));

      const doc = mockDocument();
      const result = await service.buildSubmitWorkflow(doc, mockAdapter, USER_ID, BU_CODE);

      expect(result.last_action).toBe(enum_last_action.submitted);
      expect(result.workflow_current_stage).toBe('HOD');
      expect(result.last_action_by_id).toBe(USER_ID);
      expect(result.workflow_history).toHaveLength(1);
      expect(result.workflow_history[0].action).toBe(enum_last_action.submitted);
    });

    it('should skip first-stage lookup when current stage already set', async () => {
      setupMapperPopulate({ stages: [] });

      mockMasterService.send
        .mockReturnValueOnce(mockNavigateForward('HOD', 'Purchaser', 'Requestor'));

      const doc = mockDocument({ workflow_current_stage: 'Requestor' });
      const result = await service.buildSubmitWorkflow(doc, mockAdapter, USER_ID, BU_CODE);

      // Should only call navigate once (not twice for first-stage lookup)
      expect(mockMasterService.send).toHaveBeenCalledTimes(1);
      expect(result.workflow_current_stage).toBe('HOD');
    });

    it('should use departmentOverride when provided', async () => {
      setupMapperPopulate({ stages: [] });
      mockMasterService.send.mockReturnValueOnce(mockNavigateForward('Draft', null, null))
        .mockReturnValueOnce(mockNavigateForward('HOD', null, 'Draft'));

      // Mock buildUserAction to verify department is passed
      const spy = jest.spyOn(service, 'buildUserAction').mockResolvedValue({ execute: [] });

      const doc = mockDocument({ workflow_current_stage: null });
      await service.buildSubmitWorkflow(doc, mockAdapter, USER_ID, BU_CODE, { id: 'override-dept', name: 'Override Dept' });

      expect(spy).toHaveBeenCalledWith(
        expect.anything(),
        'override-dept',
        'Override Dept',
        USER_ID,
        BU_CODE,
      );
    });
  });

  // ===========================================================================
  // buildApproveWorkflow
  // ===========================================================================
  describe('buildApproveWorkflow', () => {
    it('should return isFinalApproval=true when no next step', async () => {
      setupMapperPopulate({ stages: [] });
      mockMasterService.send.mockReturnValueOnce(mockNavigateForward('HOD', null, 'Requestor'));

      const doc = mockDocument({ workflow_current_stage: 'Requestor' });
      const { workflow, isFinalApproval } = await service.buildApproveWorkflow(doc, mockAdapter, USER_ID, BU_CODE);

      expect(isFinalApproval).toBe(true);
      expect(workflow.workflow_next_stage).toBe('-');
      expect(workflow.user_action).toEqual({ execute: [] });
      expect(workflow.last_action).toBe(enum_last_action.approved);
    });

    it('should return isFinalApproval=false when more stages remain', async () => {
      setupMapperPopulate({ stages: [] });
      mockMasterService.send.mockReturnValueOnce(mockNavigateForward('Purchaser', 'GM', 'HOD'));

      const doc = mockDocument({ workflow_current_stage: 'HOD' });
      const { workflow, isFinalApproval } = await service.buildApproveWorkflow(doc, mockAdapter, USER_ID, BU_CODE);

      expect(isFinalApproval).toBe(false);
      expect(workflow.workflow_next_stage).toBe('GM');
      expect(workflow.workflow_current_stage).toBe('Purchaser');
    });

    it('should add history entry with next_stage="-" for final approval', async () => {
      setupMapperPopulate({ stages: [] });
      mockMasterService.send.mockReturnValueOnce(mockNavigateForward('Final', null, 'HOD'));

      const doc = mockDocument({ workflow_current_stage: 'HOD' });
      const { workflow } = await service.buildApproveWorkflow(doc, mockAdapter, USER_ID, BU_CODE);

      expect(workflow.workflow_history[0].next_stage).toBe('-');
    });
  });

  // ===========================================================================
  // buildRejectWorkflow
  // ===========================================================================
  describe('buildRejectWorkflow', () => {
    it('should build reject workflow with terminated state', async () => {
      setupMapperPopulate();

      const doc = mockDocument({ workflow_current_stage: 'HOD' });
      const result = await service.buildRejectWorkflow(doc, mockAdapter, USER_ID, BU_CODE);

      expect(result.last_action).toBe(enum_last_action.rejected);
      expect(result.workflow_next_stage).toBe('-');
      expect(result.user_action).toEqual({ execute: [] });
      expect(result.workflow_current_stage).toBe('HOD');
      expect(result.workflow_history[0].action).toBe(enum_last_action.rejected);
      expect(result.workflow_history[0].next_stage).toBe('-');
    });
  });

  // ===========================================================================
  // buildReviewWorkflow
  // ===========================================================================
  describe('buildReviewWorkflow', () => {
    it('should build review workflow by navigating back to target stage', async () => {
      mockAuthService.send.mockReturnValueOnce(of({ data: { name: 'Reviewer' } }));
      mockMasterService.send.mockReturnValueOnce(of({
        data: {
          previous_stage: 'HOD',
          current_stage: 'Requestor',
          navigation_info: {
            workflow_next_step: 'HOD',
            current_stage_info: { name: 'Requestor', assigned_users: [] },
          },
        },
      }));

      const doc = mockDocument({ workflow_current_stage: 'Purchaser' });
      const result = await service.buildReviewWorkflow(doc, mockAdapter, 'Requestor', USER_ID, BU_CODE);

      expect(result.last_action).toBe(enum_last_action.reviewed);
      expect(result.workflow_current_stage).toBe('Requestor');
      expect(result.last_action_by_name).toBe('Reviewer');
      expect(result.workflow_history[0].action).toBe(enum_last_action.reviewed);
    });
  });

  // ===========================================================================
  // buildUserAction
  // ===========================================================================
  describe('buildUserAction', () => {
    it('should return null when no users to assign', async () => {
      const result = await service.buildUserAction(
        { assigned_users: [] },
        null,
        null,
        USER_ID,
        BU_CODE,
      );

      expect(result).toBeNull();
    });

    it('should collect assigned_users from stage info', async () => {
      mockAuthService.send.mockReturnValueOnce(of({ data: [{ user_id: 'u1', email: 'u1@test.com' }] }));

      const result = await service.buildUserAction(
        { assigned_users: ['u1'] },
        'dept-1',
        'Kitchen',
        USER_ID,
        BU_CODE,
      );

      expect(result.execute).toHaveLength(1);
      expect(result.execute[0].user_id).toBe('u1');
    });

    it('should add department users when creator_access flag is set', async () => {
      mockMasterService.send.mockReturnValueOnce(of({ data: [{ user_id: 'dept-user-1' }] }));
      mockAuthService.send.mockReturnValueOnce(of({ data: [{ user_id: 'dept-user-1' }] }));

      const result = await service.buildUserAction(
        { assigned_users: [], creator_access: 'all_department' },
        'dept-1',
        'Kitchen',
        USER_ID,
        BU_CODE,
      );

      expect(result.execute).toHaveLength(1);
    });

    it('should add HOD users when is_hod flag is set', async () => {
      mockMasterService.send.mockReturnValueOnce(of({ data: ['hod-user-1'] }));
      mockAuthService.send.mockReturnValueOnce(of({ data: [{ user_id: 'hod-user-1' }] }));

      const result = await service.buildUserAction(
        { assigned_users: [], is_hod: true },
        'dept-1',
        'Kitchen',
        USER_ID,
        BU_CODE,
      );

      expect(result.execute).toHaveLength(1);
    });

    it('should deduplicate user IDs', async () => {
      mockAuthService.send.mockReturnValueOnce(of({ data: [{ user_id: 'u1' }] }));

      const result = await service.buildUserAction(
        { assigned_users: ['u1', 'u1', 'u1'] },
        'dept-1',
        'Kitchen',
        USER_ID,
        BU_CODE,
      );

      // Should call auth service with deduplicated IDs
      expect(mockAuthService.send).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ user_ids: ['u1'] }),
      );
    });
  });

  // ===========================================================================
  // resolveUserRole
  // ===========================================================================
  describe('resolveUserRole', () => {
    it('should return "create" when document is draft and user is creator', async () => {
      const result = await service.resolveUserRole(
        true, true, 'wf-001', 'HOD', null, USER_ID, BU_CODE,
      );
      expect(result).toBe(enum_stage_role.create);
    });

    it('should return "view_only" when no workflow_id', async () => {
      const result = await service.resolveUserRole(
        false, false, null, null, null, USER_ID, BU_CODE,
      );
      expect(result).toBe(enum_stage_role.view_only);
    });

    it('should return stage role when user is in user_action.execute', async () => {
      mockMasterService.send.mockReturnValueOnce(of({
        data: { role: 'approve', name: 'HOD' },
      }));

      const result = await service.resolveUserRole(
        false, false, 'wf-001', 'HOD',
        { execute: [{ user_id: USER_ID }] },
        USER_ID, BU_CODE,
      );
      expect(result).toBe('approve');
    });

    it('should return "view_only" when user is NOT in user_action.execute', async () => {
      mockMasterService.send.mockReturnValueOnce(of({
        data: { role: 'approve', name: 'HOD' },
      }));

      const result = await service.resolveUserRole(
        false, false, 'wf-001', 'HOD',
        { execute: [{ user_id: 'other-user' }] },
        USER_ID, BU_CODE,
      );
      expect(result).toBe(enum_stage_role.view_only);
    });

    it('should return "view_only" when masterService throws', async () => {
      mockMasterService.send.mockReturnValueOnce({
        pipe: () => ({ subscribe: () => {} }),
        toPromise: () => Promise.reject(new Error('fail')),
        subscribe: () => {},
        [Symbol.observable]: () => ({ subscribe: (observer) => { observer.error(new Error('fail')); return { unsubscribe: () => {} }; } }),
      });

      // Use a throwable observable
      const { throwError } = await import('rxjs');
      mockMasterService.send.mockReset();
      mockMasterService.send.mockReturnValueOnce(throwError(() => new Error('network error')));

      const result = await service.resolveUserRole(
        false, false, 'wf-001', 'HOD',
        { execute: [{ user_id: USER_ID }] },
        USER_ID, BU_CODE,
      );
      expect(result).toBe(enum_stage_role.view_only);
    });
  });
});
