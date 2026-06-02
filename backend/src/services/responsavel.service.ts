import prisma from "../lib/prisma";

export interface ResponsavelDTO {
  nome: string;
  cin: string;
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
   * Resolve um responsável: se existir pelo CIN, atualiza os dados; caso contrário, cria.
   */
  async resolverResponsavel(data: ResponsavelDTO) {
    return await prisma.responsavel.upsert({
      where: { cin: data.cin },
      update: data,
      create: data,
    });
  }

  async buscarPorCin(cin: string) {
    return await prisma.responsavel.findUnique({ where: { cin } });
  }
}
