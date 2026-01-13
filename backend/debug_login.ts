
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugLogin() {
  const email = 'admin@corporacao.com';
  const password = 'admin123';

  console.log('--- Debug Login ---');
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log('User NOT found in DB');
    return;
  }

  console.log('User found:', user.email);
  console.log('Hash in DB:', user.password);

  const isValid = await bcrypt.compare(password, user.password);
  console.log('Is password valid (admin123)?', isValid);

  // Testando gerar um novo hash para comparar
  const newHash = await bcrypt.hash(password, 10);
  console.log('New hash for same password:', newHash);
  const compareWithNew = await bcrypt.compare(password, newHash);
  console.log('New hash is valid?', compareWithNew);

  await prisma.$disconnect();
}

debugLogin();
