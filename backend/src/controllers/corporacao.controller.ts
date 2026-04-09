import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { NotFoundError } from "../errors/app.errors";

const CORPORACOES_PREDEFINIDAS = [
  { nome: "EM Dr Getúlio Vargas" },
  { nome: "Banda Marcial de Tapiraí" },
  { nome: "Fanfarra de Tapiraí" },
  { nome: "EM Prof. Flávio de Souza Nogueira" },
];

const garantirCorporacoesPredefinidas = async () => {
  await Promise.all(
    CORPORACOES_PREDEFINIDAS.map((corp) =>
      prisma.corporacao.upsert({
        where: { nome: corp.nome },
        update: {
          nome: corp.nome,
          isPredefinida: true,
        },
        create: {
          nome: corp.nome,
          isPredefinida: true,
        },
      }),
    ),
  );
};

export const listCorporacoesPredefinidas = async (
  req: Request,
  res: Response,
) => {
  await garantirCorporacoesPredefinidas();

  const corporacoes = await prisma.corporacao.findMany({
    where: { isPredefinida: true },
    select: {
      id: true,
      nome: true,
    },
    orderBy: { nome: "asc" },
  });

  return res.json(corporacoes);
};

export const listAllCorporacoes = async (req: Request, res: Response) => {
  await garantirCorporacoesPredefinidas();

  const { search } = req.query;

  const where = search
    ? { nome: { contains: String(search), mode: "insensitive" as any } }
    : {};

  const corporacoes = await prisma.corporacao.findMany({
    where,
    select: {
      id: true,
      nome: true,
      isPredefinida: true,
    },
    orderBy: [{ isPredefinida: "desc" }, { nome: "asc" }],
    take: 50,
  });

  return res.json(corporacoes);
};

export const createCorporacao = async (req: Request, res: Response) => {
  const { nome } = req.body;

  if (!nome) {
    return res
      .status(400)
      .json({ message: "Nome da corporação é obrigatório" });
  }

  const nomeNormalizado = String(nome).trim();

  const existente = await prisma.corporacao.findFirst({
    where: {
      nome: {
        equals: nomeNormalizado,
        mode: "insensitive",
      },
    },
  });

  if (existente) {
    return res.status(200).json(existente);
  }

  const corporacao = await prisma.corporacao.create({
    data: {
      nome: nomeNormalizado,
      isPredefinida: false,
    },
  });

  return res.status(201).json(corporacao);
};

export const getCorporacao = async (req: Request, res: Response) => {
  const { id } = req.params;

  const corporacao = await prisma.corporacao.findUnique({
    where: { id },
  });

  if (!corporacao) {
    throw new NotFoundError("Corporação");
  }

  return res.json(corporacao);
};
