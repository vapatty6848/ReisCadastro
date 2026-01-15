import { Request, Response } from 'express';
import { integranteSchema, updateIntegranteSchema } from '../schemas/integrante.schema';
import { ValidationError } from '../errors/app.errors';
import { IntegranteService } from '../services/integrante.service';
import { StorageService } from '../services/storage.service';
import { sanitizeResponse } from '../utils/sanitize';

const integranteService = new IntegranteService();
const storageService = new StorageService();

// Auxiliar para extrair dados e arquivos da requisição multipart
const getRequestMultipartData = (req: Request) => {
  const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  const fotos = storageService.formatMulterFiles(files?.fotos);
  const fotoPerfil = files?.fotoPerfil?.[0]
    ? storageService.getPublicUrl(files.fotoPerfil[0].filename)
    : undefined;

  return { data, fotos, fotoPerfil };
};

export const createIntegrante = async (req: Request, res: Response) => {
  const { data, fotos, fotoPerfil } = getRequestMultipartData(req);

  const result = integranteSchema.safeParse(data);
  if (!result.success) {
    throw new ValidationError('Dados inválidos: ' + JSON.stringify(result.error.format()));
  }

  const integrante = await integranteService.create({ data: result.data, fotos, fotoPerfil });
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
  return res.json(sanitizeResponse(integrante));
};

export const updateIntegrante = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, fotos, fotoPerfil } = getRequestMultipartData(req);

  const result = updateIntegranteSchema.safeParse(data);
  if (!result.success) {
    throw new ValidationError('Dados inválidos: ' + JSON.stringify(result.error.format()));
  }

  const integrante = await integranteService.update(id, result.data, fotos, fotoPerfil);
  return res.json(integrante);
};

export const deleteIntegrante = async (req: Request, res: Response) => {
  const { id } = req.params;
  await integranteService.delete(id);
  return res.status(204).send();
};
