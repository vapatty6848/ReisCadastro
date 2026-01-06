import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'process';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@corporacao.com' },
    update: {},
    create: {
      email: 'admin@corporacao.com',
      name: 'Administrador',
      password: hashedPassword,
    },
  });

  console.log('Seed concluído: Usuário admin criado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
