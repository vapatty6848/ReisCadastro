import { Request, Response } from 'express';
import { integranteSchema, updateIntegranteSchema } from '../schemas/integrante.schema';
import { AppError } from '../middlewares/error.middleware';
import { IntegranteService } from '../services/integrante.service';

const integranteService = new IntegranteService();

// Converte null para "" recursivamente para facilitar o uso no frontend
const sanitize = (obj: any): any => {
  if (obj === null) return "";
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (typeof obj === 'object' && obj !== null && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitize(v)])
    );
  }
  return obj;
};

export const createIntegrante = async (req: Request, res: Response) => {
  const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;

  const result = integranteSchema.safeParse(data);
  if (!result.success) {
    throw new AppError('Dados inválidos: ' + JSON.stringify(result.error.format()), 400);
  }

  const fotos = req.files && Array.isArray(req.files)
    ? req.files.map((file: any) => `/uploads/${file.filename}`)
    : [];

  const integrante = await integranteService.create({ data: result.data, fotos });
  return res.status(201).json(integrante);
};

export const listIntegrantes = async (req: Request, res: Response) => {
  const { page = 1, limit = 20, ...filters } = req.query;

  const { data, total } = await integranteService.list(
    filters,
    Math.max(1, Number(page)),
    Math.max(1, Number(limit))
  );

  return res.json({
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  });
};

export const getIntegrante = async (req: Request, res: Response) => {
  const { id } = req.params;
  const integrante = await integranteService.findById(id);
  return res.json(sanitize(integrante));
};

export const updateIntegrante = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;

  const result = updateIntegranteSchema.safeParse(data);
  if (!result.success) {
    throw new AppError('Dados inválidos: ' + JSON.stringify(result.error.format()), 400);
  }

  const novasFotos = req.files && Array.isArray(req.files)
    ? req.files.map((file: any) => `/uploads/${file.filename}`)
    : [];

  const integrante = await integranteService.update(id, result.data, novasFotos);
  return res.json(integrante);
};

export const deleteIntegrante = async (req: Request, res: Response) => {
  const { id } = req.params;
  await integranteService.delete(id);
  return res.status(204).send();
};
