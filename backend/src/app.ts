import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { authRoutes } from './routes/auth.routes';
import integranteRoutes from './routes/integrante.routes';
import { statsRoutes } from './routes/stats.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/integrantes', integranteRoutes);
app.use('/api/stats', statsRoutes);

// Middleware de Erro Centralizado (deve vir depois das rotas)
app.use(errorMiddleware);

export { app };
