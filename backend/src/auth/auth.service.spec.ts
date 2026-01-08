import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue({ id: '1', email: 'test@test.com' });
      mockUserRepo.save.mockResolvedValue({ id: '1', email: 'test@test.com' });

      const result = await service.register({ email: 'test@test.com', password: 'password123' });
      expect(result).toEqual({ id: '1', email: 'test@test.com' });
      expect(mockUserRepo.save).toHaveBeenCalled();
    });

    it('should throw if email exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: '1' });
      await expect(service.register({ email: 'test@test.com', password: 'password123' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const user = { id: '1', email: 'test@test.com', password: '$2b$10$hash' };
      mockUserRepo.findOne.mockResolvedValue(user);
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      const result = await service.login({ email: 'test@test.com', password: 'password123' });
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user).toEqual({ id: '1', email: 'test@test.com' });
    });

    it('should throw on invalid credentials', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.login({ email: 'wrong', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });
  });
});