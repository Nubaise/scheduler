import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    jwtService = moduleFixture.get(JwtService);

    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/auth/me should reject requests without a token', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);
  });

  it('/auth/me should reject an invalid token', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('/auth/me should accept a valid JWT', async () => {
    const token = await jwtService.signAsync({
      sub: 'user-id',
      email: 'student@example.test',
      role: 'student',
    });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({
        userId: 'user-id',
        email: 'student@example.test',
        role: 'student',
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
