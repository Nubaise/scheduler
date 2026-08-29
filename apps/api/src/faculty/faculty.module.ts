import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from '@fas/database';

@Module({
  imports: [TypeOrmModule.forFeature([Faculty])],
})
export class FacultyModule {}