import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from '@fas/database';
import { FacultyService } from './faculty.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Faculty])],
  providers: [FacultyService],
  exports: [FacultyService],
})
export class FacultyModule {}