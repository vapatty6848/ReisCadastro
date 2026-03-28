import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/app.errors";

type UserRole = "SUPER_ADMIN" | "ADMIN";

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = (req as any).userRole as UserRole | undefined;

    if (!role || !allowedRoles.includes(role)) {
      throw new UnauthorizedError("Você não tem permissão para esta ação");
    }

    return next();
  };
};
