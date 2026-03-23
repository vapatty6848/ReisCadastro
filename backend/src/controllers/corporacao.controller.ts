import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { NotFoundError } from "../errors/app.errors";

export const listCorporacoesPredefinidas = async (
  req: Request,
  res: Response,
) => {
  const corporacoes = await prisma.corporacao.findMany({
    where: { isPredefinida: true },
    select: {
      id: true,
      nome: true,
      telefone: true,
    },
    orderBy: { nome: "asc" },
  });

  return res.json(corporacoes);
};

export const listAllCorporacoes = async (req: Request, res: Response) => {
  const { search } = req.query;

  const where = search
    ? { nome: { contains: String(search), mode: "insensitive" as any } }
    : {};

  const corporacoes = await prisma.corporacao.findMany({
    where,
    select: {
      id: true,
      nome: true,
      telefone: true,
      isPredefinida: true,
    },
    orderBy: [{ isPredefinida: "desc" }, { nome: "asc" }],
    take: 50,
  });

  return res.json(corporacoes);
};

export const createCorporacao = async (req: Request, res: Response) => {
  const {
    nome,
    telefone,
    email,
    rua,
    numero,
    bairro,
    cep,
    cidade,
    estado,
    contatoNome,
    contatoTelefone,
  } = req.body;

  if (!nome || !telefone) {
    return res
      .status(400)
      .json({ message: "Nome e telefone são obrigatórios" });
  }

  const corporacao = await prisma.corporacao.create({
    data: {
      nome,
      telefone,
      email: email || null,
      rua: rua || null,
      numero: numero || null,
      bairro: bairro || null,
      cep: cep || null,
      cidade: cidade || null,
      estado: estado || null,
      contatoNome: contatoNome || null,
      contatoTelefone: contatoTelefone || null,
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
