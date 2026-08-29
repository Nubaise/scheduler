import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserCredential } from '@fas/database';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserCredential)
    private readonly credentialsRepository: Repository<UserCredential>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async setPassword(user: User, password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 12);

    await this.credentialsRepository.save({
      userId: user.id,
      passwordHash,
    });
  }

  async verifyPassword(
    user: User,
    password: string,
  ): Promise<boolean> {
    const credential = await this.credentialsRepository.findOne({
      where: { userId: user.id },
    });

    if (!credential) {
      return false;
    }

    return bcrypt.compare(password, credential.passwordHash);
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const valid = await this.verifyPassword(user, password);

    return valid ? user : null;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}