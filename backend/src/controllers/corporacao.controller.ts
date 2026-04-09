import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { NotFoundError } from "../errors/app.errors";

const CORPORACOES_PREDEFINIDAS = [
  { nome: "EM Dr Getúlio Vargas", telefone: "(11) 3456-7890" },
  { nome: "Banda Marcial de Tapiraí", telefone: "(11) 3456-7891" },
  { nome: "Fanfarra de Tapiraí", telefone: "(11) 3456-7892" },
  { nome: "EM Prof. Flávio de Souza Nogueira", telefone: "(11) 3456-7893" },
];

const garantirCorporacoesPredefinidas = async () => {
  const total = await prisma.corporacao.count({
    where: { isPredefinida: true },
  });
  if (total > 0) return;

  await Promise.all(
    CORPORACOES_PREDEFINIDAS.map((corp) =>
      prisma.corporacao.upsert({
        where: { nome: corp.nome },
        update: {
          telefone: corp.telefone,
          isPredefinida: true,
        },
        create: {
          nome: corp.nome,
          telefone: corp.telefone,
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
      telefone: true,
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

  const nomeNormalizado = String(nome).trim();
  const telefoneNormalizado = String(telefone).trim();

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
      telefone: telefoneNormalizado,
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
