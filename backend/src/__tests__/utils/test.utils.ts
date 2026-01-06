import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';

export const TEST_USER = {
  email: 'test-admin@example.com',
  password: 'password123',
  name: 'Test Admin'
};

export const createTestUser = async () => {
  const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);

  // Cleanup if exists
  await prisma.user.deleteMany({ where: { email: TEST_USER.email } });

  const user = await prisma.user.create({
    data: {
      email: TEST_USER.email,
      name: TEST_USER.name,
      password: hashedPassword
    }
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'test_secret', {
    expiresIn: '1h',
  });

  return { user, token };
};

export const clearIntegrantes = async () => {
  await prisma.integrante.deleteMany({
    where: { nome: { startsWith: 'TEST_' } }
  });
};

export const clearUsers = async () => {
  await prisma.user.deleteMany({
    where: { email: { contains: 'test' } }
  });
};

export const generateIntegranteData = (overrides = {}) => {
  return {
    nome: `TEST_INTEGRANTE_${Math.random().toString(36).substring(7)}`,
    cpf: Math.floor(Math.random() * 90000000000 + 10000000000).toString(),
    dataNascimento: '1990-01-01',
    dataMatricula: '2023-01-01',
    turma: 'Turma A',
    tipoIntegrante: 'CORPO_MUSICAL',
    subtipoIntegrante: 'INSTRUMENTOS',
    telefone: '11999999999',
    responsavel: {
      nome: 'TEST_RESPONSAVEL',
      cpf: '98765432100',
      telefone: '11888888888',
      parentesco: 'Pai'
    },
    corporacao: {
      nome: 'TEST_CORPORACAO',
      telefone: '11777777777'
    },
    ...overrides
  };
};
