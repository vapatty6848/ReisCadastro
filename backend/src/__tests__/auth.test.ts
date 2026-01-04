import request from 'supertest';
import { describe, it, expect, afterAll } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { app } from '../app';
import prisma from '../lib/prisma';

describe('Auth Endpoints', () => {
  afterAll(async () => {
    // Limpar usuários de teste se necessário
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test@example.com'
        }
      }
    });
    await prisma.$disconnect();
  });

  it('should login successfully with valid credentials', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Garantir que o usuário não existe antes de criar
    await prisma.user.deleteMany({ where: { email } });

    await prisma.user.create({
      data: {
        email,
        name: 'Test User',
        password: hashedPassword
      }
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', email);
  });

  it('should fail to login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Credenciais inválidas');
  }, 30000);

  it('should fail to login with invalid data', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: '123'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('should get current user data', async () => {
    const email = 'test-me@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.deleteMany({ where: { email } });
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Me User',
        password: hashedPassword
      }
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email', email);
    expect(res.body).toHaveProperty('name', 'Me User');

    await prisma.user.delete({ where: { id: user.id } });
  });
});
