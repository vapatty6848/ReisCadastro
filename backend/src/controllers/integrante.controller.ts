import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';
import { integranteSchema, updateIntegranteSchema } from '../schemas/integrante.schema';
import { resolveResponsavel, resolveCorporacao } from '../utils/resolvers';

export const createIntegrante = async (req: Request, res: Response) => {
  // Se houver arquivo, adicionamos o caminho ao body para validação (opcional) ou apenas processamos
  const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;

  const result = integranteSchema.safeParse(data);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }

  const { responsavel, corporacao, ...integranteData } = result.data;

  try {
    const resolvedResponsavel = await resolveResponsavel(responsavel);
    const resolvedCorporacao = await resolveCorporacao(corporacao);

    // Verificar se CPF já existe em outro integrante que NÃO tenha o mesmo responsável
    const existingCpf = await prisma.integrante.findFirst({
      where: {
        cpf: integranteData.cpf,
        responsavelId: { not: resolvedResponsavel.id }
      }
    });

    if (existingCpf) {
      return res.status(400).json({ message: 'Este CPF já está sendo utilizado por um integrante de outra família/responsável.' });
    }

    // Verificar se Matrícula já existe (se fornecida)
    if (integranteData.matriculaNumero) {
      const existingMatricula = await prisma.integrante.findUnique({ where: { matriculaNumero: integranteData.matriculaNumero } });
      if (existingMatricula) {
        return res.status(400).json({ message: 'Já existe um integrante cadastrado com este número de matrícula.' });
      }
    }

    const fotos = req.files && Array.isArray(req.files)
      ? req.files.map((file: any) => `/uploads/${file.filename}`)
      : [];

    const integrante = await prisma.integrante.create({
      data: {
        ...integranteData,
        fotos,
        responsavelId: resolvedResponsavel.id,
        corporacaoId: resolvedCorporacao.id,
      },
      include: {
        responsavel: true,
        corporacao: true,
      },
    });

    return res.status(201).json(integrante);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const listIntegrantes = async (req: Request, res: Response) => {
  const {
    nome,
    cpf,
    turma,
    tipoIntegrante,
    subtipoIntegrante,
    corporacao,
    tamanhoUniforme,
    tamanhoBota,
    patrimonio,
    instrumento,
    naoDevolvido
  } = req.query;

  const where: any = {};

  if (nome) {
    where.nome = { contains: String(nome), mode: 'insensitive' };
  }

  if (cpf) {
    where.cpf = { contains: String(cpf) };
  }

  if (turma) {
    where.turma = { contains: String(turma), mode: 'insensitive' };
  }

  if (tipoIntegrante) {
    where.tipoIntegrante = tipoIntegrante;
  }

  if (subtipoIntegrante) {
    where.subtipoIntegrante = subtipoIntegrante;
  }

  if (corporacao) {
    where.corporacao = {
      nome: { contains: String(corporacao), mode: 'insensitive' }
    };
  }

  if (tamanhoUniforme) {
    where.tamanhoUniforme = { contains: String(tamanhoUniforme) };
  }

  if (tamanhoBota) {
    where.tamanhoBota = { contains: String(tamanhoBota) };
  }

  if (patrimonio) {
    where.patrimonio = { contains: String(patrimonio), mode: 'insensitive' };
  }

  if (instrumento) {
    where.instrumento = { contains: String(instrumento), mode: 'insensitive' };
  }

  if (naoDevolvido === 'true') {
    where.instrumentoRecebimento = { not: null };
    where.instrumentoDevolucao = null;
  }

  try {
    const integrantes = await prisma.integrante.findMany({
      where,
      include: {
        responsavel: true,
        corporacao: true,
      },
      orderBy: { nome: 'asc' }
    });
    return res.json(integrantes);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getIntegrante = async (req: Request, res: Response) => {
  const { id } = req.params;
  const integrante = await prisma.integrante.findUnique({
    where: { id },
    include: {
      responsavel: true,
      corporacao: true,
    },
  });

  if (!integrante) {
    return res.status(404).json({ message: 'Integrante não encontrado' });
  }

  return res.json(integrante);
};

export const updateIntegrante = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;

  const result = updateIntegranteSchema.safeParse(data);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }

  try {
    const { responsavel, corporacao, ...integranteData } = result.data;
    const currentIntegrante = await prisma.integrante.findUnique({ where: { id } });

    if (!currentIntegrante) {
      return res.status(404).json({ message: 'Integrante não encontrado' });
    }

    let resolvedResponsavelId = currentIntegrante.responsavelId;
    if (responsavel) {
      const resolvedResponsavel = await resolveResponsavel(responsavel);
      resolvedResponsavelId = resolvedResponsavel.id;
    }

    // Verificar se CPF já existe em outro integrante que NÃO tenha o mesmo responsável
    const cpfToCheck = integranteData.cpf || currentIntegrante.cpf;
    if (cpfToCheck) {
      const existingCpf = await prisma.integrante.findFirst({
        where: {
          cpf: cpfToCheck,
          responsavelId: { not: resolvedResponsavelId },
          NOT: { id }
        }
      });
      if (existingCpf) {
        return res.status(400).json({ message: 'Este CPF já está sendo utilizado por um integrante de outra família/responsável.' });
      }
    }

    // Verificar se Matrícula já existe em outro integrante
    if (integranteData.matriculaNumero) {
      const existingMatricula = await prisma.integrante.findFirst({
        where: {
          matriculaNumero: integranteData.matriculaNumero,
          NOT: { id }
        }
      });
      if (existingMatricula) {
        return res.status(400).json({ message: 'Já existe outro integrante cadastrado com este número de matrícula.' });
      }
    }

    const updateData: any = { ...integranteData };
    if (responsavel) {
      updateData.responsavelId = resolvedResponsavelId;
    }

    if (corporacao) {
      const resolvedCorporacao = await resolveCorporacao(corporacao);
      updateData.corporacaoId = resolvedCorporacao.id;
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const novasFotos = req.files.map((file: any) => `/uploads/${file.filename}`);
      // Aqui você pode decidir se substitui ou adiciona. Vamos adicionar.
      updateData.fotos = [...(currentIntegrante.fotos || []), ...novasFotos];
    }

    const integrante = await prisma.integrante.update({
      where: { id },
      data: updateData,
      include: {
        responsavel: true,
        corporacao: true,
      },
    });

    return res.json(integrante);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteIntegrante = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const integrante = await prisma.integrante.findUnique({ where: { id } });

    if (integrante && integrante.fotos.length > 0) {
      integrante.fotos.forEach(fotoPath => {
        const fullPath = path.join(__dirname, '../../', fotoPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await prisma.integrante.delete({ where: { id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
