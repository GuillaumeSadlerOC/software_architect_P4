import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, StreamableFile, ForbiddenException } from '@nestjs/common';
import { UploadOptionsDto } from './dto/upload-options.dto';
import { User } from '../entities/user.entity';
import { UpdateTagsDto } from './dto/update-tags.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateExpirationDto } from './dto/update-expiration.dto';
import * as fs from 'fs';

jest.mock('fs');
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockFilesService = {
  upload: jest.fn(),
  formatResponse: jest.fn(),
  getMetadata: jest.fn(),
  getFileByToken: jest.fn(),
  incrementDownloadCount: jest.fn(),
  getUserHistory: jest.fn(),
  getUserTags: jest.fn(),
  deleteFile: jest.fn(),
  updateTags: jest.fn(),
  updatePassword: jest.fn(),
  updateExpiration: jest.fn(),
  checkPassword: jest.fn(),
};

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'user-uuid-123', email: 'test@test.com' } as User;
          return true;
        },
      })
      .compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- US01: UPLOAD AUTH ---
  describe('uploadAuth', () => {
    it('should call service.upload with user and formatResponse', async () => {
      const mockFile = { originalname: 'cv.pdf' } as Express.Multer.File;
      const optionsDto = new UploadOptionsDto();
      const mockUser = { id: 'user-uuid-123' } as User;
      const mockReq = {} as any;
      
      const mockSavedFile = { id: '1', token: 'token' };
      mockFilesService.upload.mockResolvedValue(mockSavedFile);
      mockFilesService.formatResponse.mockReturnValue({ url: 'http://url' });

      await controller.uploadAuth(mockFile, optionsDto, mockUser, mockReq);

      expect(service.upload).toHaveBeenCalledWith(mockFile, expect.objectContaining({ user: mockUser }));
      expect(service.formatResponse).toHaveBeenCalledWith(mockSavedFile, mockReq);
    });
  });

  // --- US07: UPLOAD ANONYMOUS ---
  describe('uploadAnonymous', () => {
    it('should call service.upload without user', async () => {
      const mockFile = { originalname: 'anon.pdf' } as Express.Multer.File;
      const optionsDto = new UploadOptionsDto();
      const mockReq = {} as any;

      const mockSavedFile = { id: '2', token: 'token-anon' };
      mockFilesService.upload.mockResolvedValue(mockSavedFile);

      await controller.uploadAnonymous(mockFile, optionsDto, mockReq);

      expect(service.upload).toHaveBeenCalledWith(mockFile, optionsDto);
      expect(service.formatResponse).toHaveBeenCalled();
    });
  });

  // --- US08: GET TAGS ---
  describe('getTags', () => {
    it('should return user tags', async () => {
      const mockUser = { id: 'user-uuid-123' } as User;
      mockFilesService.getUserTags.mockResolvedValue([{ label: 'work', count: 1 }]);

      const result = await controller.getTags(mockUser);

      expect(service.getUserTags).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual([{ label: 'work', count: 1 }]);
    });
  });

  // --- US05: HISTORY ---
  describe('getHistory', () => {
    it('should return history with no filters', async () => {
      const mockUser = { id: 'user-uuid-123' } as User;
      mockFilesService.getUserHistory.mockResolvedValue([]);

      await controller.getHistory(mockUser, undefined, undefined);

      expect(service.getUserHistory).toHaveBeenCalledWith(mockUser.id, undefined, undefined);
    });

    it('should pass search and tag filters to service', async () => {
      const mockUser = { id: 'user-uuid-123' } as User;
      const search = 'invoice';
      const tag = 'work';
      
      mockFilesService.getUserHistory.mockResolvedValue([]);

      await controller.getHistory(mockUser, search, tag);

      expect(service.getUserHistory).toHaveBeenCalledWith(mockUser.id, search, tag);
    });
  });

  // --- US02/US09: DOWNLOAD ---
  describe('download', () => {
    it('should verify password and return file stream', async () => {
      const token = 'valid-token';
      const fileRecord = { id: '1', path: '/tmp/fake-file', hasPassword: true };
      const password = 'secret-pass';
      
      mockFilesService.getFileByToken.mockResolvedValue(fileRecord);
      // Simulation: the password is correct, checkPassword does nothing (void)
      mockFilesService.checkPassword.mockResolvedValue(undefined);
      
      const mockStream = { pipe: jest.fn() };
      (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);

      const result = await controller.download(token, password);

      expect(service.getFileByToken).toHaveBeenCalledWith(token);
      expect(service.checkPassword).toHaveBeenCalledWith(fileRecord, password);
      expect(service.incrementDownloadCount).toHaveBeenCalledWith(fileRecord.id);
      expect(fs.createReadStream).toHaveBeenCalledWith(fileRecord.path);
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should throw error if checkPassword fails', async () => {
      const token = 'valid-token';
      const password = 'wrong-pass';
      
      mockFilesService.getFileByToken.mockResolvedValue({ id: '1' });
      // Simulation: Incorrect password -> Error
      mockFilesService.checkPassword.mockRejectedValue(new ForbiddenException());

      await expect(controller.download(token, password)).rejects.toThrow(ForbiddenException);
      
      // We check that the file is NOT read if the password is incorrect.
      expect(fs.createReadStream).not.toHaveBeenCalled();
    });
  });

  // --- US02: METADATA ---
  describe('getMetadata', () => {
    it('should return metadata', async () => {
      mockFilesService.getMetadata.mockResolvedValue({ name: 'test' });
      await controller.getMetadata('token');
      expect(service.getMetadata).toHaveBeenCalledWith('token');
    });
  });

  // --- US06: DELETE ---
  describe('delete', () => {
    it('should delete file', async () => {
      const mockUser = { id: 'user-uuid-123' } as User;
      await controller.delete('id-1', mockUser);
      expect(service.deleteFile).toHaveBeenCalledWith('id-1', mockUser.id);
    });
  });

  // --- US08: UPDATE TAGS ---
  describe('updateTags', () => {
    it('should update tags', async () => {
      const mockUser = { id: 'user-uuid-123' } as User;
      const dto: UpdateTagsDto = { tags: ['new'] };
      
      await controller.updateTags('id-1', dto, mockUser);
      
      expect(service.updateTags).toHaveBeenCalledWith('id-1', ['new'], mockUser.id);
    });
  });

  // --- US09: UPDATE PASSWORD ---
  describe('updatePassword', () => {
    it('should update password', async () => {
      const mockUser = { id: 'user-uuid-123' } as User;
      const dto: UpdatePasswordDto = { password: '123' };
      
      await controller.updatePassword('id-1', dto, mockUser);
      
      expect(service.updatePassword).toHaveBeenCalledWith('id-1', '123', mockUser.id);
    });
  });

  // --- US10: UPDATE EXPIRATION ---
  describe('updateExpiration', () => {
    it('should update expiration', async () => {
      const mockUser = { id: 'user-uuid-123' } as User;
      const dto: UpdateExpirationDto = { expirationDays: 7 };
      
      await controller.updateExpiration('id-1', dto, mockUser);
      
      expect(service.updateExpiration).toHaveBeenCalledWith('id-1', 7, mockUser.id);
    });
  });
});