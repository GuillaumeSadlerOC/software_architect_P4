import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { File } from '../entities/file.entity';
import * as fsPromises from 'fs/promises';
import * as fs from 'fs';

jest.mock('fs/promises');
jest.mock('fs');

describe('TasksService', () => {
  let service: TasksService;
  let fileRepo;

  const mockFileRepo = {
    find: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(File), useValue: mockFileRepo },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleExpiration', () => {
    it('should do nothing if no files found', async () => {
      // Mock: No expired files
      mockFileRepo.find.mockResolvedValue([]);

      await service.handleExpiration();

      // Check: Nothing should be deleted
      expect(mockFileRepo.remove).not.toHaveBeenCalled();
    });

    it('should delete files physically and from DB', async () => {
      const mockFiles = [
        { id: '1', path: '/uploads/1.txt', filename: '1.txt' },
        { id: '2', path: '/uploads/2.png', filename: '2.png' },
      ];
      
      // Mock: Found 2 files
      mockFileRepo.find.mockResolvedValue(mockFiles);
      // Mock: The file exists on the disk
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // Mock: The deletion was successful
      (fsPromises.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.handleExpiration();

      // Verification: unlink called twice, remove called twice
      expect(fsPromises.unlink).toHaveBeenCalledTimes(2);
      expect(mockFileRepo.remove).toHaveBeenCalledTimes(2);
    });

    it('should skip physical deletion if file does not exist', async () => {
      const mockFiles = [{ id: '1', path: '/uploads/ghost.txt' }];
      
      mockFileRepo.find.mockResolvedValue(mockFiles);
      // Mock: The file does NOT exist on the disk (e.g., already manually deleted)
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await service.handleExpiration();

      // Verification: we are not attempting to delete the physical file
      expect(fsPromises.unlink).not.toHaveBeenCalled();
      expect(mockFileRepo.remove).toHaveBeenCalledWith(mockFiles[0]);
    });

    it('should handle errors gracefully without crashing loop', async () => {
      const mockFiles = [
        { id: '1', path: '/error' },
        { id: '2', path: '/success' }
      ];

      mockFileRepo.find.mockResolvedValue(mockFiles);
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // We simulate an error on the first call, and success on the second
      (fsPromises.unlink as jest.Mock)
        .mockRejectedValueOnce(new Error('Permission denied'))
        .mockResolvedValueOnce(undefined);

      await service.handleExpiration();

      // The first one was not deleted from the database because of the error in the try/catch block
      expect(mockFileRepo.remove).not.toHaveBeenCalledWith(mockFiles[0]);
      
      // The second one has indeed been deleted from the database
      expect(mockFileRepo.remove).toHaveBeenCalledWith(mockFiles[1]);
    });
  });
});