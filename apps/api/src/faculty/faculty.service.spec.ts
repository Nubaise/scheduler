import { describe, expect, it, vi } from 'vitest';
import { FacultyService } from './faculty.service.js';

describe('FacultyService', () => {
  it('should be defined', () => {
    const repository = {
      findOne: vi.fn(),
    };

    const service = new FacultyService(repository as never);

    expect(service).toBeDefined();
  });

  it('should find faculty by user id', async () => {
    const faculty = {
      id: 'faculty-id',
      userId: 'user-id',
    };

    const repository = {
      findOne: vi.fn().mockResolvedValue(faculty),
    };

    const service = new FacultyService(repository as never);

    await expect(service.findByUserId('user-id')).resolves.toEqual(faculty);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
    });
  });

  it('should return null when faculty is not found', async () => {
    const repository = {
      findOne: vi.fn().mockResolvedValue(null),
    };

    const service = new FacultyService(repository as never);

    await expect(service.findByUserId('unknown-user-id')).resolves.toBeNull();
  });
});