import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // We mock the AuthService
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- TEST REGISTER ---
  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto: RegisterDto = { email: 'test@test.com', password: 'password123' };
      const expectedResult = { id: '1', email: 'test@test.com' };
      
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  // --- TEST LOGIN ---
  describe('login', () => {
    it('should return token on valid credentials', async () => {
      const dto: LoginDto = { email: 'test@test.com', password: 'password123' };
      const expectedResult = { accessToken: 'jwt-token' };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const dto: LoginDto = { email: 'wrong@test.com', password: 'wrong' };
      
      mockAuthService.login.mockResolvedValue(null);

      await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});