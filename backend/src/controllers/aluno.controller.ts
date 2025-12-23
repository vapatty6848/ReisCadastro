import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { alunoSchema, updateAlunoSchema } from '../schemas/aluno.schema';
import { resolveResponsavel, resolveEscola } from '../utils/resolvers';

const prisma = new PrismaClient();

export const createAluno = async (req: Request, res: Response) => {
  // Se houver arquivo, adicionamos o caminho ao body para validação (opcional) ou apenas processamos
  const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;

  const result = alunoSchema.safeParse(data);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }

  const { responsavel, escola, ...alunoData } = result.data;

  try {
    // Verificar se CPF já existe
    const existingCpf = await prisma.aluno.findUnique({ where: { cpf: alunoData.cpf } });
    if (existingCpf) {
      return res.status(400).json({ message: 'Já existe um aluno cadastrado com este CPF.' });
    }

    // Verificar se Matrícula já existe (se fornecida)
    if (alunoData.matriculaNumero) {
      const existingMatricula = await prisma.aluno.findUnique({ where: { matriculaNumero: alunoData.matriculaNumero } });
      if (existingMatricula) {
        return res.status(400).json({ message: 'Já existe um aluno cadastrado com este número de matrícula.' });
      }
    }

    const resolvedResponsavel = await resolveResponsavel(responsavel);
    const resolvedEscola = await resolveEscola(escola);

    const fotos = req.files && Array.isArray(req.files)
      ? req.files.map((file: any) => `/uploads/${file.filename}`)
      : [];

    const aluno = await prisma.aluno.create({
      data: {
        ...alunoData,
        fotos,
        responsavelId: resolvedResponsavel.id,
        escolaId: resolvedEscola.id,
      },
      include: {
        responsavel: true,
        escola: true,
      },
    });

    return res.status(201).json(aluno);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const listAlunos = async (req: Request, res: Response) => {
  const { nome, responsavel, instrumentoOrigem, tipoIntegrante } = req.query;

  const where: any = {};

  if (nome) {
    where.nome = { contains: String(nome), mode: 'insensitive' };
  }

  if (responsavel) {
    where.responsavel = {
      nome: { contains: String(responsavel), mode: 'insensitive' }
    };
  }

  if (instrumentoOrigem) {
    where.instrumentoOrigem = instrumentoOrigem;
  }

  if (tipoIntegrante) {
    where.tipoIntegrante = tipoIntegrante;
  }

  try {
    const alunos = await prisma.aluno.findMany({
      where,
      include: {
        responsavel: true,
        escola: true,
      },
      orderBy: { nome: 'asc' }
    });
    return res.json(alunos);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAluno = async (req: Request, res: Response) => {
  const { id } = req.params;
  const aluno = await prisma.aluno.findUnique({
    where: { id },
    include: {
      responsavel: true,
      escola: true,
    },
  });

  if (!aluno) {
    return res.status(404).json({ message: 'Aluno não encontrado' });
  }

  return res.json(aluno);
};

export const updateAluno = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;

  const result = updateAlunoSchema.safeParse(data);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }

  try {
    const { responsavel, escola, ...alunoData } = result.data;

    // Verificar se CPF já existe em outro aluno
    if (alunoData.cpf) {
      const existingCpf = await prisma.aluno.findFirst({
        where: {
          cpf: alunoData.cpf,
          NOT: { id }
        }
      });
      if (existingCpf) {
        return res.status(400).json({ message: 'Já existe outro aluno cadastrado com este CPF.' });
      }
    }

    // Verificar se Matrícula já existe em outro aluno
    if (alunoData.matriculaNumero) {
      const existingMatricula = await prisma.aluno.findFirst({
        where: {
          matriculaNumero: alunoData.matriculaNumero,
          NOT: { id }
        }
      });
      if (existingMatricula) {
        return res.status(400).json({ message: 'Já existe outro aluno cadastrado com este número de matrícula.' });
      }
    }

    const updateData: any = { ...alunoData };

    if (req.files && Array.isArray(req.files)) {
      updateData.fotos = req.files.map((file: any) => `/uploads/${file.filename}`);
    }

    if (responsavel) {
      const resolvedResponsavel = await resolveResponsavel(responsavel as any);
      updateData.responsavelId = resolvedResponsavel.id;
    }

    if (escola) {
      const resolvedEscola = await resolveEscola(escola as any);
      updateData.escolaId = resolvedEscola.id;
    }

    const aluno = await prisma.aluno.update({
      where: { id },
      data: updateData,
      include: {
        responsavel: true,
        escola: true,
      },
    });
    return res.json(aluno);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAluno = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.aluno.delete({ where: { id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
