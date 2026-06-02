import { z } from "zod";

export const responsavelSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome do responsável deve ter pelo menos 3 caracteres")
    .optional()
    .or(z.literal("")),
  cin: z
    .string()
    .min(11, "CIN do responsável deve ter 11 dígitos")
    .max(14, "CIN muito longo")
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
    .nullable()
    .optional()
    .or(z.literal("")),
  rua: z.string().nullable().optional().or(z.literal("")),
  numero: z.string().nullable().optional().or(z.literal("")),
  bairro: z.string().nullable().optional().or(z.literal("")),
  cep: z.string().nullable().optional().or(z.literal("")),
  parentesco: z.string().optional().nullable().or(z.literal("")),
});
