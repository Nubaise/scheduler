import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '@fas/database';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('AuthController', () => {
  let controller: AuthController;

  let authService: {
    validateCredentials: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      validateCredentials: vi.fn(),
      login: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: vi.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login with valid credentials', async () => {
    const user = {
      id: 'user-id',
      email: 'student@example.test',
      role: 'student',
    } as User;

    const loginResult = {
      accessToken: 'test-access-token',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };

    authService.validateCredentials.mockResolvedValue(user);
    authService.login.mockResolvedValue(loginResult);

    await expect(
      controller.login({
        email: user.email,
        password: 'StrongPassword123!',
      }),
    ).resolves.toEqual(loginResult);

    expect(authService.validateCredentials).toHaveBeenCalledWith(
      user.email,
      'StrongPassword123!',
    );

    expect(authService.login).toHaveBeenCalledWith(user);
  });

  it('should reject invalid credentials', async () => {
    authService.validateCredentials.mockResolvedValue(null);

    await expect(
      controller.login({
        email: 'student@example.test',
        password: 'WrongPassword123!',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should return the authenticated user', () => {
    const user = {
      userId: 'user-id',
      email: 'student@example.test',
      role: 'student',
    };

    expect(controller.getMe({ user } as never)).toEqual(user);
  });
});
