import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserCredential } from '@fas/database';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let repository: {
    save: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repository = {
      save: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserCredential),
          useValue: repository,
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
});