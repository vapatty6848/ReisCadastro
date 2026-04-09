import prisma from "../lib/prisma";

export interface CorporacaoDTO {
  nome: string;
}

export class CorporacaoService {
  /**
   * Resolve uma corporação: se existir pelo nome, atualiza os dados; caso contrário, cria.
   */
  async resolverCorporacao(data: CorporacaoDTO) {
    const nome = data.nome.trim();

    return await prisma.corporacao.upsert({
      where: { nome },
      update: { nome },
      create: { nome },
    });
  }

  async buscarPorNome(nome: string) {
    return await prisma.corporacao.findUnique({ where: { nome } });
  }
}
