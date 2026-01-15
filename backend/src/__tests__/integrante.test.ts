import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Definir env antes de qualquer coisa para os middlewares
process.env.JWT_SECRET = 'test-secret-key';

// Mock do prisma ANTES de importar o app
jest.mock('../lib/prisma');

import prisma from '../lib/prisma';
import { app } from '../app';
import { generateIntegranteData } from './utils/test.utils';

const prismaMock = prisma as any;

describe('Integrante Endpoints (Mocked DB)', () => {
  let token: string;

  beforeEach(() => {
    jest.clearAllMocks();
    token = jwt.sign({ userId: 'mock-user-id' }, process.env.JWT_SECRET as string);
  });

  describe('POST /api/integrantes', () => {
    it('should fail to access without token', async () => {
      const res = await request(app).post('/api/integrantes').send({});
      expect(res.statusCode).toEqual(401);
    });

    it('should create a new integrante successfully', async () => {
      const data = generateIntegranteData({
        nome: 'TEST_CREATE_SUCCESS',
        tipoIntegrante: 'CORPO_MUSICAL',
        subtipoIntegrante: 'INSTRUMENTOS'
      });

      // Mocks para as dependências (Services via Upsert)
      prismaMock.responsavel.upsert.mockResolvedValue({ id: 'resp-id', ...data.responsavel });
      prismaMock.corporacao.upsert.mockResolvedValue({ id: 'corp-id', ...data.corporacao });

      prismaMock.integrante.findFirst.mockResolvedValue(null);
      prismaMock.integrante.create.mockResolvedValue({
        id: 'mock-uuid',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      const res = await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(data);

      expect(res.statusCode).toEqual(201);
      expect(res.body.nome).toBe(data.nome);
      expect(prismaMock.integrante.create).toHaveBeenCalled();
    });

    it('should fail if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Incomplete' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('inválidos');
    });
  });

  describe('GET /api/integrantes', () => {
    it('should list integrantes with filters via mock', async () => {
      const mockList = [
        { id: '1', nome: 'Integrante 1' },
        { id: '2', nome: 'Integrante 2' }
      ];

      prismaMock.integrante.findMany.mockResolvedValue(mockList as any);
      prismaMock.integrante.count.mockResolvedValue(mockList.length);

      const res = await request(app)
        .get('/api/integrantes')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBeTruthy();
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.total).toBe(mockList.length);
      expect(prismaMock.integrante.findMany).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/integrantes/:id', () => {
    it('should update integrante with mocked data', async () => {
      const id = 'mock-id';
      const updateData = { nome: 'Updated Name' };

      // Mocking existing member check
      prismaMock.integrante.findUnique.mockResolvedValue({
        id,
        nome: 'Old Name',
        fotos: []
      } as any);

      prismaMock.integrante.update.mockResolvedValue({
        id,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      const res = await request(app)
        .patch(`/api/integrantes/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.nome).toBe('Updated Name');
      expect(prismaMock.integrante.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/integrantes/:id', () => {
    it('should delete integrante via mock', async () => {
      const id = 'mock-id';

      // Mocking existing member check
      prismaMock.integrante.findUnique.mockResolvedValue({
        id,
        nome: 'To Delete',
        fotos: []
      } as any);

      prismaMock.integrante.delete.mockResolvedValue({ id } as any);

      const res = await request(app)
        .delete(`/api/integrantes/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(204);
      expect(prismaMock.integrante.delete).toHaveBeenCalled();
    });
  });
});
