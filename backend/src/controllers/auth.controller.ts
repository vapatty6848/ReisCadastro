import { Request, Response } from 'express';
import { loginSchema } from '../schemas/auth.schema';
import { AuthService } from '../services/auth.service';
import { ValidationError } from '../errors/app.errors';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError('Dados de login inválidos', result.error.format());
  }

  const { email, password } = result.data;
  const authData = await authService.authenticate(email, password);

  return res.json(authData);
};

export const me = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = await authService.getUserById(userId);
  return res.json(user);
};
