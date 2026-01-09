import { Router } from 'express';
import { getStats } from '../controllers/stats.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const statsRoutes = Router();

statsRoutes.get('/', authMiddleware, getStats);

export { statsRoutes };
