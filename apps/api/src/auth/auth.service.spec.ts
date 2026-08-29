import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserCredential } from '@fas/database';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

describe('AuthService', () => {
  let service: AuthService;

  let repository: {
    save: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  let usersService: {
    findByEmail: ReturnType<typeof vi.fn>;
  };

  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repository = {
      save: vi.fn(),
      findOne: vi.fn(),
    };

    usersService = {
      findByEmail: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserCredential),
          useValue: repository,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash and save a password', async () => {
    const user = { id: 'user-id' } as User;

    repository.save.mockResolvedValue(undefined);

    await service.setPassword(user, 'StrongPassword123!');

    expect(repository.save).toHaveBeenCalledTimes(1);

    const savedCredential = repository.save.mock.calls[0][0];

    expect(savedCredential.userId).toBe(user.id);
    expect(savedCredential.passwordHash).toBeDefined();
    expect(savedCredential.passwordHash).not.toBe('StrongPassword123!');
  });

  it('should verify a correct password', async () => {
    const user = { id: 'user-id' } as User;
    const password = 'StrongPassword123!';
    const passwordHash = await bcrypt.hash(password, 12);

    repository.findOne.mockResolvedValue({
      userId: user.id,
      passwordHash,
    } as UserCredential);

    await expect(
      service.verifyPassword(user, password),
    ).resolves.toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const user = { id: 'user-id' } as User;
    const passwordHash = await bcrypt.hash('CorrectPassword123!', 12);

    repository.findOne.mockResolvedValue({
      userId: user.id,
      passwordHash,
    } as UserCredential);

    await expect(
      service.verifyPassword(user, 'WrongPassword123!'),
    ).resolves.toBe(false);
  });

  it('should return false when no credential exists', async () => {
    const user = { id: 'user-id' } as User;

    repository.findOne.mockResolvedValue(null);

    await expect(
      service.verifyPassword(user, 'any-password'),
    ).resolves.toBe(false);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { userId: user.id },
    });
  });

  it('should validate credentials for an existing user', async () => {
    const user = {
      id: 'user-id',
      email: 'student@example.test',
    } as User;

    const password = 'StrongPassword123!';
    const passwordHash = await bcrypt.hash(password, 12);

    usersService.findByEmail.mockResolvedValue(user);

    repository.findOne.mockResolvedValue({
      userId: user.id,
      passwordHash,
    } as UserCredential);

    await expect(
      service.validateCredentials(user.email, password),
    ).resolves.toBe(user);

    expect(usersService.findByEmail).toHaveBeenCalledWith(user.email);
  });

  it('should return null when the user does not exist', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.validateCredentials(
        'missing@example.test',
        'StrongPassword123!',
      ),
    ).resolves.toBeNull();

    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it('should create a JWT when logging in', async () => {
    const user = {
      id: 'user-id',
      email: 'student@example.test',
      role: 'student',
    } as User;

    jwtService.signAsync.mockResolvedValue('test-access-token');

    await expect(service.login(user)).resolves.toEqual({
      accessToken: 'test-access-token',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  });
});
