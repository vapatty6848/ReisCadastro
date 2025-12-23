import request from 'supertest';
import { app } from '../app';

describe('Auth Endpoints', () => {
  it('should fail to login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Credenciais inválidas');
  });

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
});
