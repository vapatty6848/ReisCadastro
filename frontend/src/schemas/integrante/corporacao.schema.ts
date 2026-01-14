import { z } from 'zod';

export const corporacaoSchema = z.object({
  nome: z.string().min(3, 'Nome da corporação deve ter pelo menos 3 caracteres'),
  rua: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  telefone: z.string().min(10, 'Telefone da corporação é obrigatório'),
  email: z.string().email().nullable().optional().or(z.literal('')),
  cidade: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
  contatoNome: z.string().nullable().optional(),
  contatoTelefone: z.string().nullable().optional(),
});
