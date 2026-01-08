import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository;

  // Mock configuration to provide a fake secret key
  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  // Mock of the User repository
  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get(getRepositoryToken(User));
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the user object if user exists', async () => {
      const mockUser = { id: 'user-123', email: 'test@test.com' };
      const payload = { sub: 'user-123', email: 'test@test.com' };

      // Simulation: the user is found in the database
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      // We verify that it is indeed searching using the ID contained in the token's 'sub'.
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-123' } });
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const payload = { sub: 'deleted-user', email: 'ghost@test.com' };

      // Simulation: the user is not found (e.g., account deleted)
      mockUserRepository.findOne.mockResolvedValue(null);

      // We expect a 401 error.
      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});