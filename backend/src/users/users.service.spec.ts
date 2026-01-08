import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const mockRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@test.com',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- GET PROFILE ---
  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockUser });

      const result = await service.getProfile('user-123');

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'user-123' } });
      expect(result).toEqual(expect.objectContaining({ email: 'test@test.com' }));
      expect((result as any).password).toBeUndefined(); 
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.getProfile('ghost')).rejects.toThrow(NotFoundException);
    });
  });

  // --- UPDATE PROFILE ---
  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updateData = { email: 'new@test.com' };
      
      mockRepo.findOne.mockResolvedValueOnce(null);
      mockRepo.update.mockResolvedValue({ affected: 1 });
      mockRepo.findOne.mockResolvedValueOnce({ ...mockUser, email: 'new@test.com' });

      const result = await service.updateProfile('user-123', updateData);

      expect(repo.update).toHaveBeenCalledWith('user-123', updateData);
      expect(result.email).toBe('new@test.com');
    });

    it('should throw ConflictException if email is already taken by another user', async () => {
      const updateData = { email: 'taken@test.com' };
      
      // Mock: Another user already has this email
      mockRepo.findOne.mockResolvedValue({ id: 'other-user', email: 'taken@test.com' });

      await expect(service.updateProfile('user-123', updateData)).rejects.toThrow(ConflictException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should prevent password update via this method', async () => {
      const updateData = { password: 'hacker-attempt' } as any;
      
      mockRepo.update.mockResolvedValue({ affected: 1 });
      mockRepo.findOne.mockResolvedValue(mockUser);

      await service.updateProfile('user-123', updateData);

      // We verify that 'password' has been removed from the object passed to update
      expect(repo.update).toHaveBeenCalledWith('user-123', {}); 
    });
  });
});