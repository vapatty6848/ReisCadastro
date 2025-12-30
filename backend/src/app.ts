import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { authRoutes } from './routes/auth.routes';
import integranteRoutes from './routes/integrante.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/integrantes', integranteRoutes);

export { app };
