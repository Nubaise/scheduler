import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from '@fas/database';
import { Repository } from 'typeorm';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async findByUserId(userId: string): Promise<Faculty | null> {
    return this.facultyRepository.findOne({
      where: { userId },
    });
  }
}