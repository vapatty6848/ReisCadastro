import { describe, it, expect, afterAll, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { app } from '../app';
import prisma from '../lib/prisma';
import { TEST_USER, clearUsers } from './utils/test.utils';

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await clearUsers();
  });

  afterAll(async () => {
    await clearUsers();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
      await prisma.user.create({
        data: {
          email: TEST_USER.email,
          name: TEST_USER.name,
          password: hashedPassword
        }
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', TEST_USER.email);
    });

    it('should fail to login with invalid password', async () => {
      const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
      await prisma.user.create({
        data: {
          email: TEST_USER.email,
          name: TEST_USER.name,
          password: hashedPassword
        }
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USER.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Credenciais inválidas');
    });

    it('should fail to login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: TEST_USER.password
        });

      expect(res.statusCode).toEqual(401);
    });

    it('should fail to login with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: '123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user data when authenticated', async () => {
      const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
      const user = await prisma.user.create({
        data: {
          email: TEST_USER.email,
          name: TEST_USER.name,
          password: hashedPassword
        }
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password });

      const token = loginRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('email', TEST_USER.email);
      expect(res.body.name).toBe(TEST_USER.name);
    });

    it('should fail to get user data without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toEqual(401);
    });
  });
});
