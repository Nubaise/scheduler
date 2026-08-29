import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredential } from '@fas/database';
import { AuthService } from './auth.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserCredential])],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}