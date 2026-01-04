import { z } from 'zod';

export const responsavelSchema = z.object({
  nome: z.string().min(3, 'Nome do responsável deve ter pelo menos 3 caracteres'),
  cpf: z.string().length(11, 'CPF do responsável deve ter 11 dígitos'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  rua: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  parentesco: z.string().min(1, 'Parentesco é obrigatório'),
});
