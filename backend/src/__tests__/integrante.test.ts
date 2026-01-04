import request from 'supertest';
import { describe, it, expect, afterAll, beforeAll } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { app } from '../app';
import prisma from '../lib/prisma';

describe('Integrante Endpoints', () => {
  let token: string;
  let testUserId: string;

  beforeAll(async () => {
    // Setup: Criar um usuário para obter o token
    const email = 'auth-test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.deleteMany({ where: { email } });
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Auth Test User',
        password: hashedPassword
      }
    });
    testUserId = user.id;

    token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'test_secret', {
      expiresIn: '1h',
    });

    // Limpar integrantes de teste
    await prisma.integrante.deleteMany({
      where: { nome: { contains: 'TEST_INTEGRANTE' } }
    });
  });

  afterAll(async () => {
    await prisma.integrante.deleteMany({
      where: { nome: { contains: 'TEST_INTEGRANTE' } }
    });
    // Usar deleteMany para evitar erro se o usuário já não existir
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  it('should fail to access without token', async () => {
    const res = await request(app).get('/api/integrantes');
    expect(res.statusCode).toEqual(401);
  });

  it('should create a new integrante successfully', async () => {
    const integranteData = {
      nome: 'TEST_INTEGRANTE_01',
      cpf: '12345678901',
      dataNascimento: '1990-01-01',
      dataMatricula: '2023-01-01',
      turma: 'Turma A',
      tipoIntegrante: 'CORPO_MUSICAL',
      subtipoIntegrante: 'INSTRUMENTOS',
      rg: '1234567',
      telefone: '11999999999',
      email: 'test01@example.com',
      tamanhoUniforme: '40',
      tamanhoBota: '42',
      instrumento: 'Trompete',
      patrimonio: 'PAT-001',
      responsavel: {
        nome: 'TEST_RESPONSAVEL',
        cpf: '98765432100',
        telefone: '11888888888',
        parentesco: 'Pai'
      },
      corporacao: {
        nome: 'TEST_CORPORACAO',
        telefone: '11777777777'
      }
    };

    const res = await request(app)
      .post('/api/integrantes')
      .set('Authorization', `Bearer ${token}`)
      .send(integranteData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nome).toBe(integranteData.nome);
    expect(res.body.cpf).toBe(integranteData.cpf);
  });

  it('should fail to create integrante with duplicate CPF', async () => {
    const integranteData = {
      nome: 'TEST_INTEGRANTE_DUPLICATE',
      cpf: '12345678901', // Mesmo CPF do teste anterior
      dataNascimento: '1990-01-01',
      dataMatricula: '2023-01-01',
      turma: 'Turma B',
      tipoIntegrante: 'CORPO_MUSICAL',
      telefone: '11999999999',
      responsavel: {
        nome: 'RESP',
        cpf: '00000000000',
        telefone: '11000000000',
        parentesco: 'Mãe'
      },
      corporacao: {
        nome: 'CORP',
        telefone: '11000000000'
      }
    };

    const res = await request(app)
      .post('/api/integrantes')
      .set('Authorization', `Bearer ${token}`)
      .send(integranteData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message || JSON.stringify(res.body)).toContain('CPF');
  });

  it('should allow creating another integrante with same CPF if they have the same responsible', async () => {
    const integranteData = {
      nome: 'TEST_INTEGRANTE_SIBLING',
      cpf: '12345678901', // Mesmo CPF do TEST_INTEGRANTE_01
      dataNascimento: '1995-05-05',
      dataMatricula: '2023-01-01',
      turma: 'Turma A',
      tipoIntegrante: 'CORPO_MUSICAL',
      telefone: '11999999999',
      responsavel: {
        nome: 'TEST_RESPONSAVEL', // Mesmo responsável do TEST_INTEGRANTE_01
        cpf: '98765432100',
        telefone: '11888888888',
        parentesco: 'Pai'
      },
      corporacao: {
        nome: 'TEST_CORPORACAO',
        telefone: '11777777777'
      }
    };

    const res = await request(app)
      .post('/api/integrantes')
      .set('Authorization', `Bearer ${token}`)
      .send(integranteData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.nome).toBe(integranteData.nome);
    expect(res.body.cpf).toBe('12345678901');
  });

  it('should list integrantes', async () => {
    const res = await request(app)
      .get('/api/integrantes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update an integrante', async () => {
    const listRes = await request(app)
      .get('/api/integrantes?nome=TEST_INTEGRANTE_01')
      .set('Authorization', `Bearer ${token}`);

    const integranteId = listRes.body[0].id;

    const updateData = {
      nome: 'TEST_INTEGRANTE_01_UPDATED',
      tamanhoBota: '43'
    };

    const res = await request(app)
      .patch(`/api/integrantes/${integranteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.nome).toBe(updateData.nome);
    expect(res.body.tamanhoBota).toBe(updateData.tamanhoBota);
  });

  it('should delete an integrante', async () => {
    const listRes = await request(app)
      .get('/api/integrantes?nome=TEST_INTEGRANTE_01_UPDATED')
      .set('Authorization', `Bearer ${token}`);

    const integranteId = listRes.body[0].id;

    const res = await request(app)
      .delete(`/api/integrantes/${integranteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);

    // Verificar se foi deletado
    const checkRes = await request(app)
      .get(`/api/integrantes/${integranteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(checkRes.statusCode).toEqual(404);
  });
});
