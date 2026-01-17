const createMockModel = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  upsert: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn().mockResolvedValue(0),
});

const prismaMock: any = {
  user: createMockModel(),
  integrante: createMockModel(),
  corporacao: createMockModel(),
  responsavel: createMockModel(),
  $disconnect: jest.fn(),
  $connect: jest.fn(),
  $transaction: jest.fn((cb: any) => cb(prismaMock)),
};

export default prismaMock;
