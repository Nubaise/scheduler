import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@fas/database';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repository = {
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a user by email', async () => {
    const user = {
      id: 'user-id',
      email: 'student@example.test',
    } as User;

    repository.findOne.mockResolvedValue(user);

    await expect(service.findByEmail(user.email)).resolves.toBe(user);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { email: user.email },
    });
  });

  it('should return null when the user does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.findByEmail('missing@example.test'),
    ).resolves.toBeNull();

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { email: 'missing@example.test' },
    });
  });
});
