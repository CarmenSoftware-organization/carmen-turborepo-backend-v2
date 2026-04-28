import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { PhysicalCountDetailCommentService } from './physical-count-detail-comment.service';

const mockBusinessService = {
  send: jest.fn(),
  emit: jest.fn(),
};

const mockFileService = {
  send: jest.fn(),
  emit: jest.fn(),
};

describe('PhysicalCountDetailCommentService', () => {
  let service: PhysicalCountDetailCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhysicalCountDetailCommentService,
        { provide: 'BUSINESS_SERVICE', useValue: mockBusinessService },
        { provide: 'FILE_SERVICE', useValue: mockFileService },
      ],
    }).compile();

    service = module.get<PhysicalCountDetailCommentService>(
      PhysicalCountDetailCommentService,
    );
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('sends file.upload command with base64 buffer and returns mapped attachment', async () => {
      mockFileService.send.mockReturnValueOnce(
        of({
          success: true,
          response: { status: 200 },
          data: {
            fileToken: 'tok-1',
            fileName: 'a.jpg',
            fileUrl: 'https://minio/a.jpg',
            contentType: 'image/jpeg',
            size: 123,
          },
        }),
      );

      const buf = Buffer.from('hello');
      const result = await service.uploadFile(
        {
          originalname: 'a.jpg',
          mimetype: 'image/jpeg',
          buffer: buf,
          size: buf.length,
        } as Express.Multer.File,
        'user-1',
        'HQ-001',
      );

      expect(mockFileService.send).toHaveBeenCalledWith(
        { cmd: 'file.upload', service: 'files' },
        expect.objectContaining({
          fileName: 'a.jpg',
          mimeType: 'image/jpeg',
          buffer: buf.toString('base64'),
          bu_code: 'HQ-001',
          user_id: 'user-1',
        }),
      );
      expect(result).toEqual({
        fileName: 'a.jpg',
        fileToken: 'tok-1',
        fileUrl: 'https://minio/a.jpg',
        contentType: 'image/jpeg',
        size: 123,
      });
    });

    it('throws when file service returns failure', async () => {
      mockFileService.send.mockReturnValueOnce(
        of({ success: false, response: { status: 500, message: 'boom' } }),
      );
      await expect(
        service.uploadFile(
          {
            originalname: 'a.jpg',
            mimetype: 'image/jpeg',
            buffer: Buffer.from('x'),
            size: 1,
          } as Express.Multer.File,
          'user-1',
          'HQ-001',
        ),
      ).rejects.toThrow(/boom/);
    });
  });

  describe('deleteFile', () => {
    it('sends file.delete and resolves true on success', async () => {
      mockFileService.send.mockReturnValueOnce(
        of({ success: true, response: { status: 200 } }),
      );
      const ok = await service.deleteFile('tok-1', 'user-1', 'HQ-001');
      expect(mockFileService.send).toHaveBeenCalledWith(
        { cmd: 'file.delete', service: 'files' },
        expect.objectContaining({ fileToken: 'tok-1', user_id: 'user-1', bu_code: 'HQ-001' }),
      );
      expect(ok).toBe(true);
    });

    it('resolves false on failure (best-effort)', async () => {
      mockFileService.send.mockReturnValueOnce(
        of({ success: false, response: { status: 500, message: 'nope' } }),
      );
      const ok = await service.deleteFile('tok-1', 'user-1', 'HQ-001');
      expect(ok).toBe(false);
    });
  });
});
