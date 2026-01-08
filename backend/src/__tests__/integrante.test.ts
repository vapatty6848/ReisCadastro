import { describe, it, expect, afterAll, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app';
import prisma from '../lib/prisma';
import { createTestUser, clearIntegrantes, clearUsers, generateIntegranteData } from './utils/test.utils';

describe('Integrante Endpoints', () => {
  let token: string;

  beforeAll(async () => {
    const setup = await createTestUser();
    token = setup.token;
  });

  afterAll(async () => {
    await clearIntegrantes();
    await clearUsers();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await clearIntegrantes();
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

      const res = await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(data);

      expect(res.statusCode).toEqual(201);
      expect(res.body.nome).toBe(data.nome);
      expect(res.body.subtipoIntegrante).toBe('INSTRUMENTOS');
    });

    it('should fail if CPF is already used by another family', async () => {
      const sharedCpf = '11122233344';

      // Create first member
      await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(generateIntegranteData({ cpf: sharedCpf, nome: 'TEST_FAMILY_1' }));

      // Try creating another with same CPF but different responsible
      const data2 = generateIntegranteData({
        cpf: sharedCpf,
        nome: 'TEST_FAMILY_2',
        responsavel: {
          nome: 'DIFFERENT_RESP',
          cpf: '00011122233',
          telefone: '11000000000',
          parentesco: 'Mãe'
        }
      });

      const res = await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(data2);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('CPF já está sendo utilizado por um integrante de outra família');
    });

    it('should allow same CPF for the same family (sibling)', async () => {
      const sharedCpf = '55566677788';
      const responsavel = {
        nome: 'TEST_RESPONSAVEL_SHARED',
        cpf: '99988877766',
        telefone: '11888888888',
        parentesco: 'Pai'
      };

      await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(generateIntegranteData({ cpf: sharedCpf, nome: 'TEST_SIBLING_1', responsavel }));

      const res = await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(generateIntegranteData({ cpf: sharedCpf, nome: 'TEST_SIBLING_2', responsavel }));

      expect(res.statusCode).toEqual(201);
      expect(res.body.nome).toBe('TEST_SIBLING_2');
    });
  });

  describe('GET /api/integrantes', () => {
    it('should list and filter integrantes', async () => {
      await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(generateIntegranteData({ nome: 'TEST_SEARCH_TARGET', turma: 'SEARCH_TURMA' }));

      const res = await request(app)
        .get('/api/integrantes?turma=SEARCH_TURMA')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].nome).toBe('TEST_SEARCH_TARGET');
    });

    it('should filter by "não devolvido" status', async () => {
      // Member with instrument not returned
      await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(generateIntegranteData({
          nome: 'TEST_NOT_RETURNED',
          instrumento: 'Trompete',
          instrumentoRecebimento: '2023-01-01',
          instrumentoDevolucao: null
        }));

      // Member with instrument already returned
      await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(generateIntegranteData({
          nome: 'TEST_ALREADY_RETURNED',
          instrumento: 'Trompete',
          instrumentoRecebimento: '2023-01-01',
          instrumentoDevolucao: '2023-12-01'
        }));

      const res = await request(app)
        .get('/api/integrantes?statusDevolucao=NAO_DEVOLVIDO')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      const names = res.body.map((i: any) => i.nome);
      expect(names).toContain('TEST_NOT_RETURNED');
      expect(names).not.toContain('TEST_ALREADY_RETURNED');
    });

    it('should filter returned instruments up to a specific date', async () => {
      await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(generateIntegranteData({
          nome: 'TEST_DEV_A',
          instrumento: 'Sax',
          instrumentoDevolucao: '2025-01-01'
        }));

      await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(generateIntegranteData({
          nome: 'TEST_DEV_B',
          instrumento: 'Sax',
          instrumentoDevolucao: '2026-01-10'
        }));

      // Search up to 2025-12-31 -> should only return TEST_DEV_A
      const res = await request(app)
        .get('/api/integrantes?statusDevolucao=DEVOLVIDO&dataDevolucao=2025-12-31')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      const names = res.body.map((i: any) => i.nome);
      expect(names).toContain('TEST_DEV_A');
      expect(names).not.toContain('TEST_DEV_B');
    });
  });

  describe('PATCH /api/integrantes/:id', () => {
    it('should update integrante and handle complex fields', async () => {
      const createRes = await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(generateIntegranteData({ nome: 'TEST_UPDATE' }));

      const id = createRes.body.id;
      const updateData = {
        nome: 'TEST_UPDATE_DONE',
        tamanhoBota: '44',
        instrumentoDevolucao: '2024-01-01'
      };

      const res = await request(app)
        .patch(`/api/integrantes/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.nome).toBe('TEST_UPDATE_DONE');
      expect(res.body.tamanhoBota).toBe('44');
      expect(res.body.instrumentoDevolucao).toBeDefined();
    });
  });

  describe('DELETE /api/integrantes/:id', () => {
    it('should delete integrante', async () => {
      const createRes = await request(app)
        .post('/api/integrantes')
        .set('Authorization', `Bearer ${token}`)
        .send(generateIntegranteData({ nome: 'TEST_DELETE' }));

      const id = createRes.body.id;

      const res = await request(app)
        .delete(`/api/integrantes/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(204);

      const checkRes = await request(app)
        .get(`/api/integrantes/${id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(checkRes.statusCode).toEqual(404);
    });
  });
});
