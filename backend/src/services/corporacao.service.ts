import prisma from '../lib/prisma';

export interface CorporacaoDTO {
  nome: string;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cep?: string | null;
  telefone: string;
  email?: string | null;
  cidade?: string | null;
  estado?: string | null;
  contatoNome?: string | null;
  contatoTelefone?: string | null;
}

export class CorporacaoService {
  /**
   * Resolve uma corporação: se existir pelo nome, atualiza os dados; caso contrário, cria.
   */
  async resolverCorporacao(data: CorporacaoDTO) {
    return await prisma.corporacao.upsert({
      where: { nome: data.nome },
      update: data,
      create: data,
    });
  }

  async buscarPorNome(nome: string) {
    return await prisma.corporacao.findUnique({ where: { nome } });
  }
}
