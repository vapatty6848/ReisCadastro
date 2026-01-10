
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@corporacao.com' } });
  console.log('User found:', user ? 'Yes' : 'No');
  if (user) console.log('Email:', user.email);
  await prisma.$disconnect();
}
check();
