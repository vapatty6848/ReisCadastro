import { z } from "zod";

export const responsavelSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome do responsável deve ter pelo menos 3 caracteres")
    .optional()
    .or(z.literal("")),
  cin: z
    .string()
    .length(11, "CIN do responsável deve ter 11 dígitos")
    .optional()
    .or(z.literal("")),
  telefone: z
    .string()
    .min(10, "Telefone inválido")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  rua: z.string().optional().nullable().or(z.literal("")),
  numero: z.string().optional().nullable().or(z.literal("")),
  bairro: z.string().optional().nullable().or(z.literal("")),
  cep: z.string().optional().nullable().or(z.literal("")),
  parentesco: z.string().optional().nullable().or(z.literal("")),
});
