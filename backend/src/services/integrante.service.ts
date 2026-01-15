import prisma from '../lib/prisma';
import { resolveResponsavel, resolveCorporacao } from '../utils/resolvers';
import { StorageService } from './storage.service';
import { ConflictError, NotFoundError } from '../errors/app.errors';

const storageService = new StorageService();

interface CreateIntegranteDTO {
  data: any;
  fotos: string[];
  fotoPerfil?: string;
}

export class IntegranteService {
  async create({ data, fotos, fotoPerfil }: CreateIntegranteDTO) {
    const { responsavel, corporacao, ...integranteData } = data;

    const resolvedResponsavel = await resolveResponsavel(responsavel);
    const resolvedCorporacao = await resolveCorporacao(corporacao);

    // Verificar se CPF já existe em outro integrante que NÃO tenha o mesmo responsável
    if (integranteData.cpf) {
      const existingCpf = await prisma.integrante.findFirst({
        where: {
          cpf: integranteData.cpf,
          responsavelId: { not: resolvedResponsavel.id }
        }
      });

      if (existingCpf) {
        throw new ConflictError('Este CPF já está sendo utilizado por um integrante de outra família/responsável.');
      }
    }

    // Verificar se Matrícula já existe (se fornecida)
    if (integranteData.matriculaNumero) {
      const existingMatricula = await prisma.integrante.findUnique({ where: { matriculaNumero: integranteData.matriculaNumero } });
      if (existingMatricula) {
        throw new ConflictError('Já existe um integrante cadastrado com este número de matrícula.');
      }
    }

    return await prisma.integrante.create({
      data: {
        ...integranteData,
        fotos,
        fotoPerfil,
        responsavelId: resolvedResponsavel.id,
        corporacaoId: resolvedCorporacao.id,
      },
      include: {
        responsavel: true,
        corporacao: true,
      },
    });
  }

  async list(filters: any, page: number, limit: number) {
    const validPage = Math.max(1, Number(page) || 1);
    const validLimit = Math.max(1, Number(limit) || 20);
    const skip = (validPage - 1) * validLimit;
    const where: any = {};

    if (filters.nome) where.nome = { contains: String(filters.nome), mode: 'insensitive' };
    if (filters.cpf) where.cpf = { contains: String(filters.cpf) };
    if (filters.tipoIntegrante) where.tipoIntegrante = filters.tipoIntegrante;
    if (filters.subtipoIntegrante) where.subtipoIntegrante = filters.subtipoIntegrante;

    if (filters.corporacao) {
      where.corporacao = { nome: { contains: String(filters.corporacao), mode: 'insensitive' } };
    }

    if (filters.tamanhoUniforme) where.tamanhoUniforme = { contains: String(filters.tamanhoUniforme) };
    if (filters.tamanhoBota) where.tamanhoBota = { contains: String(filters.tamanhoBota) };
    if (filters.patrimonio) where.patrimonio = { contains: String(filters.patrimonio), mode: 'insensitive' };
    if (filters.instrumento) where.instrumento = { contains: String(filters.instrumento), mode: 'insensitive' };

    if (filters.statusDevolucao === 'DEVOLVIDO') {
      where.instrumentoDevolucao = { not: null };
      if (filters.dataDevolucao) {
        where.instrumentoDevolucao = { ...where.instrumentoDevolucao, lte: new Date(String(filters.dataDevolucao)) };
      }
    } else if (filters.statusDevolucao === 'NAO_DEVOLVIDO') {
      where.instrumentoDevolucao = null;
      // Garante que só mostre quem tem algo para devolver
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { AND: [{ instrumento: { not: '' } }, { NOT: { instrumento: null } }] },
            { AND: [{ patrimonio: { not: '' } }, { NOT: { patrimonio: null } }] }
          ]
        }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.integrante.findMany({
        where,
        include: { responsavel: true, corporacao: true },
        orderBy: { nome: 'asc' },
        skip,
        take: validLimit,
      }),
      prisma.integrante.count({ where })
    ]);

    return { data, total };
  }

  async findById(id: string) {
    const integrante = await prisma.integrante.findUnique({
      where: { id },
      include: { responsavel: true, corporacao: true },
    });

    if (!integrante) {
      throw new NotFoundError('Integrante');
    }

    return integrante;
  }

  async update(id: string, data: any, novasFotos: string[] = [], novaFotoPerfil?: string) {
    const currentIntegrante = await this.findById(id);
    const { responsavel, corporacao, ...integranteData } = data;

    console.log('--- Atualização de Integrante ---');
    console.log('ID:', id);
    console.log('Nova Foto Perfil (File):', novaFotoPerfil);
    console.log('Foto Perfil nos Dados (JSON):', integranteData.fotoPerfil);

    let resolvedResponsavelId = currentIntegrante.responsavelId;
    if (responsavel) {
      const res = await resolveResponsavel(responsavel);
      resolvedResponsavelId = res.id;
    }

    if (integranteData.cpf) {
      const existingCpf = await prisma.integrante.findFirst({
        where: {
          cpf: integranteData.cpf,
          responsavelId: { not: resolvedResponsavelId },
          NOT: { id }
        }
      });
      if (existingCpf) {
        throw new ConflictError('Este CPF já está sendo utilizado por outro integrante de outra família.');
      }
    }

    if (integranteData.matriculaNumero) {
      const existingMatricula = await prisma.integrante.findFirst({
        where: { matriculaNumero: integranteData.matriculaNumero, NOT: { id } }
      });
      if (existingMatricula) {
        throw new ConflictError('Já existe outro integrante cadastrado com este número de matrícula.');
      }
    }

    const updateData: any = { ...integranteData };
    if (responsavel) updateData.responsavelId = resolvedResponsavelId;
    if (corporacao) {
      const res = await resolveCorporacao(corporacao);
      updateData.corporacaoId = res.id;
    }

    let fotosFinal = currentIntegrante.fotos;
    if (integranteData.fotos !== undefined) {
      const removidas = currentIntegrante.fotos.filter(f => !integranteData.fotos!.includes(f));
      storageService.deleteFiles(removidas);
      fotosFinal = integranteData.fotos;
    }

    if (novasFotos.length > 0) {
      fotosFinal = [...fotosFinal, ...novasFotos];
    }
    updateData.fotos = fotosFinal;

    if (novaFotoPerfil) {
      if (currentIntegrante.fotoPerfil) {
        storageService.deleteFiles([currentIntegrante.fotoPerfil]);
      }
      updateData.fotoPerfil = novaFotoPerfil;
    } else if (integranteData.fotoPerfil === "") {
      // Se explicitamente enviado vazio no JSON, remove a foto atual
      if (currentIntegrante.fotoPerfil) {
        storageService.deleteFiles([currentIntegrante.fotoPerfil]);
      }
      updateData.fotoPerfil = null;
    }

    return prisma.integrante.update({
      where: { id },
      data: updateData,
      include: { responsavel: true, corporacao: true }
    });
  }

  async delete(id: string) {
    const integrante = await this.findById(id);
    const allFiles = [...integrante.fotos];
    if (integrante.fotoPerfil) allFiles.push(integrante.fotoPerfil);
    storageService.deleteFiles(allFiles);
    return prisma.integrante.delete({ where: { id } });
  }
}
