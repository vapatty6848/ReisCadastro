import { Router } from 'express';
import { login, me } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRoutes = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza o login do administrador
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@fanfarra.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
authRoutes.post('/login', login);
authRoutes.get('/me', authMiddleware, me);

export { authRoutes };
