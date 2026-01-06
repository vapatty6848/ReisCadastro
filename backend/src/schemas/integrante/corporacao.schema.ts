import { z } from 'zod';

export const corporacaoSchema = z.object({
  nome: z.string().min(3, 'Nome da corporação deve ter pelo menos 3 caracteres'),
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cep: z.string().optional(),
  telefone: z.string().min(10, 'Telefone da corporação é obrigatório'),
  serie: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  contatoNome: z.string().optional(),
  contatoTelefone: z.string().optional(),
});
