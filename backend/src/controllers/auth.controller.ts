import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { loginSchema } from '../schemas/auth.schema';

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET não definido no ambiente');
    return res.status(500).json({ message: 'Erro interno de configuração' });
  }

  const token = jwt.sign({ userId: user.id }, secret, {
    expiresIn: '1d',
  });

  return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
};

export const me = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  return res.json({ id: user.id, email: user.email, name: user.name });
};
