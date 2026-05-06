import prisma from "../lib/prisma";
import { StorageService } from "./storage.service";
import { ResponsavelService } from "./responsavel.service";
import { CorporacaoService } from "./corporacao.service";
import { ConflictError, NotFoundError } from "../errors/app.errors";

const storageService = new StorageService();
const responsavelService = new ResponsavelService();
const corporacaoService = new CorporacaoService();

const hasResponsavelData = (responsavel: any) => {
  if (!responsavel || typeof responsavel !== "object") return false;
  const nome = String(responsavel.nome || "").trim();
  const cpf = String(responsavel.cpf || "").trim();
  const telefone = String(responsavel.telefone || "").trim();
  return !!(nome && cpf && telefone);
};

interface CreateIntegranteDTO {
  data: any;
  fotos: string[];
  fotoPerfil?: string;
}

export class IntegranteService {
  /**
   * Registra um novo integrante no sistema
   */
  async criarIntegrante({ data, fotos, fotoPerfil }: CreateIntegranteDTO) {
    const { responsavel, corporacao, ...integranteData } = data;
    const integranteDataNormalizado =
      this.normalizarCamposInstrumento(integranteData);

    const resolvedResponsavel = hasResponsavelData(responsavel)
      ? await responsavelService.resolverResponsavel(responsavel)
      : null;
    const resolvedCorporacao =
      await corporacaoService.resolverCorporacao(corporacao);

    // Gerar matrícula automaticamente se não fornecida
    const matriculaNumero =
      integranteDataNormalizado.matriculaNumero ||
      (await this.gerarMatriculaAutomatica(resolvedCorporacao.id));

    await this.validarDadosUnicos(
      integranteDataNormalizado.documento,
      matriculaNumero,
      resolvedResponsavel?.id,
    );

    return await prisma.integrante.create({
      data: {
        ...integranteDataNormalizado,
        matriculaNumero,
        fotos,
        fotoPerfil,
        responsavelId: resolvedResponsavel?.id ?? null,
        corporacaoId: resolvedCorporacao.id,
      },
      include: {
        responsavel: true,
        corporacao: true,
      },
    });
  }

  /**
   * Lista integrantes com filtros e paginação
   */
  async listarIntegrantes(filters: any, page: number, limit: number) {
    const validPage = Math.max(1, Number(page) || 1);
    const validLimit = Math.max(1, Number(limit) || 20);
    const skip = (validPage - 1) * validLimit;
    const where = this.construirFiltros(filters);

    const [data, total] = await Promise.all([
      prisma.integrante.findMany({
        where,
        include: { responsavel: true, corporacao: true },
        orderBy: { nome: "asc" },
        skip,
        take: validLimit,
      }),
      prisma.integrante.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Busca um integrante pelo ID
   */
  async buscarPorId(id: string) {
    const integrante = await prisma.integrante.findUnique({
      where: { id },
      include: { responsavel: true, corporacao: true },
    });

    if (!integrante) {
      throw new NotFoundError("Integrante");
    }

    return integrante;
  }

  /**
   * Atualiza os dados de um integrante existente
   */
  async atualizarIntegrante(
    id: string,
    data: any,
    novasFotos: string[] = [],
    novaFotoPerfil?: string,
  ) {
    const currentIntegrante = await this.buscarPorId(id);
    const { responsavel, corporacao, ...integranteData } = data;
    const integranteDataNormalizado =
      this.normalizarCamposInstrumento(integranteData);

    let resolvedResponsavelId = currentIntegrante.responsavelId;
    if (hasResponsavelData(responsavel)) {
      const res = await responsavelService.resolverResponsavel(responsavel);
      resolvedResponsavelId = res.id;
    }

    await this.validarDadosUnicos(
      integranteDataNormalizado.documento,
      integranteDataNormalizado.matriculaNumero,
      resolvedResponsavelId,
      id,
    );

    const updateData: any = { ...integranteDataNormalizado };
    if (hasResponsavelData(responsavel)) {
      updateData.responsavelId = resolvedResponsavelId;
    } else if (responsavel && typeof responsavel === "object") {
      updateData.responsavelId = null;
    }
    if (corporacao) {
      const res = await corporacaoService.resolverCorporacao(corporacao);
      updateData.corporacaoId = res.id;
    }

    // Gestão de Arquivos
    updateData.fotos = this.processarFotos(
      currentIntegrante.fotos,
      integranteDataNormalizado.fotos,
      novasFotos,
    );
    updateData.fotoPerfil = this.processarFotoPerfil(
      currentIntegrante.fotoPerfil,
      novaFotoPerfil,
      integranteDataNormalizado.fotoPerfil,
    );

    return prisma.integrante.update({
      where: { id },
      data: updateData,
      include: { responsavel: true, corporacao: true },
    });
  }

  /**
   * Remove um integrante e seus arquivos associados
   */
  async excluirIntegrante(id: string) {
    const integrante = await this.buscarPorId(id);
    const allFiles = [...integrante.fotos];
    if (integrante.fotoPerfil) allFiles.push(integrante.fotoPerfil);

    storageService.deleteFiles(allFiles);
    return prisma.integrante.delete({ where: { id } });
  }

  // Métodos Auxiliares Privados (Encapsulamento)

  /**
   * Gera número de matrícula automático baseado em contador + iniciais da corporação
   * Formato: NNNN-INICIAIS (ex: 0001-GV para EM Dr Getúlio Vargas)
   */
  private async gerarMatriculaAutomatica(
    corporacaoId: string,
  ): Promise<string> {
    // Contar integrantes da mesma corporação
    const countIntegrantes = await prisma.integrante.count({
      where: { corporacaoId },
    });

    // Buscar a corporação para obter as iniciais
    const corporacao = await prisma.corporacao.findUnique({
      where: { id: corporacaoId },
    });

    if (!corporacao) {
      throw new Error("Corporação não encontrada");
    }

    // Gerar iniciais do nome da corporação
    const iniciais = corporacao.nome
      .split(" ")
      .map((palavra) => palavra.charAt(0).toUpperCase())
      .join("")
      .substring(0, 4); // Limitar a 4 caracteres

    // Número sequencial (contador + 1, formatado com zeros à esquerda)
    const numeroSequencial = String(countIntegrantes + 1).padStart(4, "0");

    return `${numeroSequencial}-${iniciais}`;
  }

  private async validarDadosUnicos(
    documento?: string,
    matricula?: string,
    responsavelId?: string | null,
    ignoreId?: string,
  ) {
    if (documento) {
      const existingDocumento = await prisma.integrante.findFirst({
        where: {
          documento,
          ...(responsavelId ? { responsavelId: { not: responsavelId } } : {}),
          ...(ignoreId && { NOT: { id: ignoreId } }),
        },
      });
      if (existingDocumento) {
        throw new ConflictError(
          "Este documento já está sendo utilizado por outro integrante de outra família.",
        );
      }
    }

    if (matricula) {
      const existingMatricula = await prisma.integrante.findFirst({
        where: {
          matriculaNumero: matricula,
          ...(ignoreId && { NOT: { id: ignoreId } }),
        },
      });
      if (existingMatricula) {
        throw new ConflictError(
          "Já existe outro integrante cadastrado com este número de matrícula.",
        );
      }
    }
  }

  private construirFiltros(filters: any) {
    const where: any = {};
    if (filters.nome)
      where.nome = { contains: String(filters.nome), mode: "insensitive" };
    if (filters.cpf) where.cpf = { contains: String(filters.cpf) };
    if (filters.tipoIntegrante) where.tipoIntegrante = filters.tipoIntegrante;
    if (filters.subtipoIntegrante)
      where.subtipoIntegrante = filters.subtipoIntegrante;
    if (filters.corporacao)
      where.corporacao = {
        nome: { contains: String(filters.corporacao), mode: "insensitive" },
      };
    if (filters.tamanhoUniforme)
      where.tamanhoUniforme = { contains: String(filters.tamanhoUniforme) };
    if (filters.tamanhoBota)
      where.tamanhoBota = { contains: String(filters.tamanhoBota) };
    if (filters.patrimonio)
      where.patrimonio = {
        contains: String(filters.patrimonio),
        mode: "insensitive",
      };
    if (filters.instrumento)
      where.instrumento = {
        contains: String(filters.instrumento),
        mode: "insensitive",
      };

    if (filters.statusDevolucao === "DEVOLVIDO") {
      where.instrumentoDevolucao = { not: null };
      if (filters.dataDevolucao)
        where.instrumentoDevolucao = {
          ...where.instrumentoDevolucao,
          lte: new Date(String(filters.dataDevolucao)),
        };
    } else if (filters.statusDevolucao === "NAO_DEVOLVIDO") {
      where.instrumentoDevolucao = null;
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            {
              AND: [
                { instrumento: { not: "" } },
                { NOT: { instrumento: null } },
              ],
            },
            {
              AND: [{ patrimonio: { not: "" } }, { NOT: { patrimonio: null } }],
            },
          ],
        },
      ];
    }
    return where;
  }

  private normalizarCamposInstrumento(integranteData: any) {
    const subtipo = integranteData?.subtipoIntegrante;

    if (subtipo === "INSTRUMENTOS_ROTATIVOS") {
      return {
        ...integranteData,
        patrimonio: null,
        instrumentoRecebimento: null,
        instrumentoDevolucao: null,
      };
    }

    if (subtipo !== "INSTRUMENTOS") {
      return {
        ...integranteData,
        instrumento: null,
        instrumentoOrigem: null,
        instrumentoRecebimento: null,
        instrumentoDevolucao: null,
        patrimonio: null,
      };
    }

    return integranteData;
  }

  private processarFotos(
    current: string[],
    payload?: string[],
    news: string[] = [],
  ) {
    let final = current;
    if (payload !== undefined) {
      storageService.deleteFiles(current.filter((f) => !payload.includes(f)));
      final = payload;
    }
    return news.length > 0 ? [...final, ...news] : final;
  }

  private processarFotoPerfil(
    current?: string | null,
    news?: string,
    payload?: string,
  ) {
    if (news) {
      if (current) storageService.deleteFiles([current]);
      return news;
    }
    if (payload === "") {
      if (current) storageService.deleteFiles([current]);
      return null;
    }
    return current;
  }
}
