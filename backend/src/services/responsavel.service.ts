import prisma from '../lib/prisma';

export interface ResponsavelDTO {
  nome: string;
  cpf: string;
  telefone: string;
  email?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cep?: string | null;
  parentesco?: string | null;
}

export class ResponsavelService {
  /**
   * Resolve um responsável: se existir pelo CPF, atualiza os dados; caso contrário, cria.
   */
  async resolverResponsavel(data: ResponsavelDTO) {
    return await prisma.responsavel.upsert({
      where: { cpf: data.cpf },
      update: data,
      create: data,
    });
  }

  async buscarPorCpf(cpf: string) {
    return await prisma.responsavel.findUnique({ where: { cpf } });
  }
}
