import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import request from 'supertest';

// Importante: O mock do prisma deve vir antes do app
jest.mock('../lib/prisma');
import prisma from '../lib/prisma';

import { app } from '../app';
import { TEST_USER } from './utils/test.utils';
import jwt from 'jsonwebtoken';

const prismaMock = prisma as any;

describe('Auth Endpoints (Mocked DB)', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test_secret';
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);

      prismaMock.user.findUnique.mockImplementation(({ where }: any) => {
        if (where.email === TEST_USER.email) {
          return Promise.resolve({
            id: 'mock-id',
            email: TEST_USER.email,
            name: TEST_USER.name,
            password: hashedPassword,
          });
        }
        return Promise.resolve(null);
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
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: TEST_USER.email }
      });
    });

    it('should fail to login with invalid password', async () => {
      const hashedPassword = await bcrypt.hash('different_password', 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'mock-id',
        email: TEST_USER.email,
        name: TEST_USER.name,
        password: hashedPassword
      } as any);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('inválidas');
    });

    it('should fail to login with non-existent user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

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
          email: 'invalid-email',
          password: 'any'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('details');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user data when authenticated', async () => {
      const mockUser = {
        id: 'mock-uuid',
        email: TEST_USER.email,
        name: TEST_USER.name
      };

      const token = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET || 'test_secret');

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('email', TEST_USER.email);
      expect(prismaMock.user.findUnique).toHaveBeenCalled();
    });

    it('should fail to get user data without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toEqual(401);
    });
  });
});
