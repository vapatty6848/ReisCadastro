import { z } from 'zod';

export const corporacaoSchema = z.object({
  nome: z.string().min(3, 'Nome da corporação deve ter pelo menos 3 caracteres'),
  rua: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  telefone: z.string().min(10, 'Telefone da corporação é obrigatório'),
  serie: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  contatoNome: z.string().optional().nullable(),
  contatoTelefone: z.string().optional().nullable(),
});
