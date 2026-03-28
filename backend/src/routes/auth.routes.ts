import { Router } from "express";
import { login, me, changePassword } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.get("/me", authMiddleware, me);
authRoutes.post("/change-password", authMiddleware, changePassword);

export { authRoutes };
