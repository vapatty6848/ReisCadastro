import prisma from '../lib/prisma';

export const resolveResponsavel = async (data: {
  nome: string;
  cpf: string;
  telefone: string;
  email?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cep?: string | null;
  parentesco: string;
}) => {
  const existing = await prisma.responsavel.findUnique({ where: { cpf: data.cpf } });
  if (existing) {
    // Opcional: Atualizar dados do responsável se já existir
    return await prisma.responsavel.update({
      where: { cpf: data.cpf },
      data
    });
  }

  return await prisma.responsavel.create({ data });
};

export const resolveCorporacao = async (data: {
  nome: string;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cep?: string | null;
  telefone: string;
  serie?: string | null;
  email?: string | null;
  cidade?: string | null;
  estado?: string | null;
  contatoNome?: string | null;
  contatoTelefone?: string | null;
}) => {
  const existing = await prisma.corporacao.findUnique({ where: { nome: data.nome } });
  if (existing) {
    // Opcional: Atualizar dados da corporação se já existir
    return await prisma.corporacao.update({
      where: { nome: data.nome },
      data
    });
  }

  return await prisma.corporacao.create({ data });
};
