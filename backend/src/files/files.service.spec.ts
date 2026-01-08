import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { File } from '../entities/file.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UploadOptionsDto } from './dto/upload-options.dto';
import { UpdateTagsDto } from './dto/update-tags.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateExpirationDto } from './dto/update-expiration.dto';
import * as fs from 'fs/promises'; 
import * as bcrypt from 'bcrypt';

jest.mock('fs/promises');
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('FilesService', () => {
  let service: FilesService;
  let fileRepo: Repository<File>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(), 
    getMany: jest.fn().mockResolvedValue([{ id: 'file1' }]),
  };

  const mockFileRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    increment: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockFile = {
    originalname: 'test.txt',
    path: '/uploads/test',
    size: 100,
    mimetype: 'text/plain',
  } as Express.Multer.File;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: getRepositoryToken(File), useValue: mockFileRepo },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    fileRepo = module.get(getRepositoryToken(File));
  });

  // --- UPLOAD TESTS ---
  describe('upload', () => {
    it('should upload successfully', async () => {
      mockFileRepo.create.mockReturnValue({ id: '1', token: 'token123' });
      mockFileRepo.save.mockResolvedValue({ id: '1', token: 'token123' });

      const options = new UploadOptionsDto();
      const result = await service.upload(mockFile, options);
      expect(result.token).toBeDefined();
    });

    it('should throw on large file', async () => {
      const largeFile = { ...mockFile, size: 2_000_000_000 };
      await expect(service.upload(largeFile, {})).rejects.toThrow(BadRequestException);
    });

    it('should throw on forbidden extension', async () => {
      const badFile = { ...mockFile, originalname: 'bad.exe' };
      await expect(service.upload(badFile, {})).rejects.toThrow(BadRequestException);
    });
  });

  // --- HISTORY TESTS ---
  describe('getUserHistory', () => {
    it('should return files using query builder', async () => {
      const result = await service.getUserHistory('user1');
      expect(mockFileRepo.createQueryBuilder).toHaveBeenCalledWith('file');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('file.userId = :userId', { userId: 'user1' });
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('file.tags');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should apply search filter', async () => {
      await service.getUserHistory('user1', 'test');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('file.filename ILIKE :search', { search: '%test%' });
    });

    it('should apply tag filter', async () => {
      await service.getUserHistory('user1', undefined, 'work');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('file.tags LIKE :tag', { tag: '%work%' });
    });
  });

  // --- GET TAGS TESTS ---
  describe('getUserTags', () => {
    it('should aggregate tags', async () => {
      mockFileRepo.find.mockResolvedValue([
        { tags: ['work', 'project'] },
        { tags: ['work'] },
        { tags: [] },
      ]);

      const result = await service.getUserTags('user1');
      
      expect(result).toEqual([
        { label: 'work', count: 2 },
        { label: 'project', count: 1 },
      ]);
    });
  });

  // --- METADATA TESTS ---
  describe('getMetadata', () => {
    it('should return metadata', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      mockFileRepo.findOne.mockResolvedValue({
        filename: 'test.txt',
        size: 100,
        mimetype: 'text/plain',
        expirationDate: futureDate,
        password: null,
        tags: ['tag'],
      });

      const meta = await service.getMetadata('token123');
      expect(meta.name).toBe('test.txt');
      expect(meta.hasPassword).toBe(false);
    });
  });

  // --- DELETE TESTS ---
  describe('deleteFile', () => {
    it('should delete owned file', async () => {
      mockFileRepo.findOne.mockResolvedValue({ id: '1', user: { id: 'user1' }, path: '/path' });
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.deleteFile('1', 'user1');
      
      expect(mockFileRepo.remove).toHaveBeenCalled();
      expect(fs.unlink).toHaveBeenCalledWith('/path');
    });

    it('should throw if not owner', async () => {
      mockFileRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteFile('1', 'wrong')).rejects.toThrow(NotFoundException);
    });
  });

  // --- UPDATES TESTS (Tags, Password) ---
  describe('updateTags', () => {
    it('should update tags for owner', async () => {
      const file = { id: '1', user: { id: 'user1' }, tags: [] };
      mockFileRepo.findOne.mockResolvedValue(file);
      mockFileRepo.save.mockResolvedValue({ ...file, tags: ['new'] });

      const dto: UpdateTagsDto = { tags: ['new'] };
      await service.updateTags('1', dto.tags, 'user1');

      expect(mockFileRepo.save).toHaveBeenCalledWith(expect.objectContaining({ tags: ['new'] }));
    });
  });

  describe('updatePassword', () => {
    it('should hash and update password', async () => {
      const file = { id: '1', user: { id: 'user1' }, password: null };
      mockFileRepo.findOne.mockResolvedValue(file);
      
      const dto: UpdatePasswordDto = { password: 'secure' };
      await service.updatePassword('1', dto.password, 'user1');

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockFileRepo.save).toHaveBeenCalled();
    });
  });

  describe('updateExpiration', () => {
    it('should update expiration date', async () => {
      const file = { id: '1', user: { id: 'user1' }, expirationDate: new Date() };
      mockFileRepo.findOne.mockResolvedValue(file);

      const dto: UpdateExpirationDto = { expirationDays: 7 };
      await service.updateExpiration('1', dto.expirationDays, 'user1');

      expect(mockFileRepo.save).toHaveBeenCalled();
    });
  });
});