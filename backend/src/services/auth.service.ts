import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import {
  UnauthorizedError,
  BaseError,
  ConflictError,
} from "../errors/app.errors";

export class AuthService {
  private getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET não definido no ambiente");
      throw new BaseError("Erro interno de configuração", 500);
    }
    return secret;
  }

  async authenticate(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const secret = this.getJwtSecret();

    const token = jwt.sign({ userId: user.id, role: user.role }, secret, {
      expiresIn: "1d",
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BaseError("Usuário não encontrado", 404);
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError("Senha atual incorreta");
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: "Senha alterada com sucesso" };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    const genericResponse = {
      message:
        "Se o e-mail existir, as instruções de recuperação serão enviadas.",
    };

    const isProduction = process.env.NODE_ENV === "production";
    const recoveryEnabled =
      process.env.PASSWORD_RECOVERY_ENABLED === "true" || !isProduction;

    if (!recoveryEnabled) {
      return {
        message:
          "Recuperação de senha desabilitada. Solicite a um administrador autorizado.",
      };
    }

    if (!user) {
      return genericResponse;
    }

    const secret = this.getJwtSecret();
    const resetToken = jwt.sign(
      {
        purpose: "password-reset",
        userId: user.id,
        pwd: user.password,
      },
      secret,
      { expiresIn: "15m" },
    );

    const exposeTokenForDebug =
      process.env.EXPOSE_RECOVERY_TOKEN_IN_RESPONSE === "true" && !isProduction;

    if (!exposeTokenForDebug) {
      return genericResponse;
    }

    return {
      ...genericResponse,
      resetToken,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const secret = this.getJwtSecret();

    let payload: any;
    try {
      payload = jwt.verify(token, secret) as {
        purpose?: string;
        userId?: string;
        pwd?: string;
      };
    } catch {
      throw new UnauthorizedError("Token de recuperação inválido ou expirado");
    }

    if (
      payload?.purpose !== "password-reset" ||
      !payload?.userId ||
      !payload?.pwd
    ) {
      throw new UnauthorizedError("Token de recuperação inválido ou expirado");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      throw new BaseError("Usuário não encontrado", 404);
    }

    // Invalida token antigo caso a senha já tenha mudado
    if (payload.pwd !== user.password) {
      throw new UnauthorizedError("Token de recuperação inválido ou expirado");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return { message: "Senha redefinida com sucesso" };
  }

  async createAdmin(
    requesterId: string,
    data: {
      email: string;
      name?: string;
      password: string;
      role?: "ADMIN" | "SUPER_ADMIN";
    },
  ) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
    });
    if (!requester) {
      throw new BaseError("Usuário não encontrado", 404);
    }

    if (requester.role !== "SUPER_ADMIN") {
      throw new UnauthorizedError(
        "Apenas SUPER_ADMIN pode criar novos administradores",
      );
    }

    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (exists) {
      throw new ConflictError("Já existe usuário com este e-mail");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const created = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role ?? "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: "Administrador criado com sucesso",
      user: created,
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BaseError("Usuário não encontrado", 404);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
