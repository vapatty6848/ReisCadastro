import { Router } from "express";
import {
  login,
  me,
  changePassword,
  forgotPassword,
  resetPassword,
  createAdmin,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createRateLimitMiddleware } from "../middlewares/rate-limit.middleware";
import { requireRole } from "../middlewares/role.middleware";

const authRoutes = Router();

const loginRateLimit = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: "auth:login",
});

const forgotPasswordRateLimit = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: "auth:forgot-password",
});

const resetPasswordRateLimit = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: "auth:reset-password",
});

authRoutes.post("/login", loginRateLimit, login);
authRoutes.post("/forgot-password", forgotPasswordRateLimit, forgotPassword);
authRoutes.post("/reset-password", resetPasswordRateLimit, resetPassword);
authRoutes.get("/me", authMiddleware, me);
authRoutes.post("/change-password", authMiddleware, changePassword);
authRoutes.post(
  "/admins",
  authMiddleware,
  requireRole(["SUPER_ADMIN"]),
  createAdmin,
);

export { authRoutes };
