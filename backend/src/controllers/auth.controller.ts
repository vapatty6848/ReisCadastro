import { Request, Response } from "express";
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createAdminSchema,
} from "../schemas/auth.schema";
import { AuthService } from "../services/auth.service";
import { ValidationError } from "../errors/app.errors";

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(
      "Dados de login inválidos",
      result.error.format(),
    );
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

export const changePassword = async (req: Request, res: Response) => {
  const result = changePasswordSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(
      "Dados de alteração de senha inválidos",
      result.error.format(),
    );
  }

  const userId = (req as any).userId;
  const { currentPassword, newPassword } = result.data;

  const resultChange = await authService.changePassword(
    userId,
    currentPassword,
    newPassword,
  );
  return res.json(resultChange);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const result = forgotPasswordSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(
      "Dados de recuperação inválidos",
      result.error.format(),
    );
  }

  const data = await authService.forgotPassword(result.data.email);
  return res.json(data);
};

export const resetPassword = async (req: Request, res: Response) => {
  const result = resetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(
      "Dados de redefinição inválidos",
      result.error.format(),
    );
  }

  const data = await authService.resetPassword(
    result.data.token,
    result.data.newPassword,
  );
  return res.json(data);
};

export const createAdmin = async (req: Request, res: Response) => {
  const result = createAdminSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(
      "Dados para criação de administrador inválidos",
      result.error.format(),
    );
  }

  const requesterId = (req as any).userId;
  const data = await authService.createAdmin(requesterId, result.data);
  return res.status(201).json(data);
};
