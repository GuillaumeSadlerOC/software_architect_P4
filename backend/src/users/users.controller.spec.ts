import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { User } from '../entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  const mockUser = { id: 'user-123', email: 'test@test.com' } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- GET /me ---
  describe('getMe', () => {
    it('should return the current user profile', async () => {
      mockUsersService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getMe(mockUser);

      expect(service.getProfile).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  // --- PATCH /me ---
  describe('updateMe', () => {
    it('should update the current user profile', async () => {
      const updateBody = { email: 'new@test.com' };
      const updatedUser = { ...mockUser, email: 'new@test.com' };
      
      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(mockUser, updateBody);

      expect(service.updateProfile).toHaveBeenCalledWith(mockUser.id, updateBody);
      expect(result).toEqual(updatedUser);
    });
  });
});