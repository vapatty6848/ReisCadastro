import { z } from "zod";

export const corporacaoSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome da corporação deve ter pelo menos 3 caracteres"),
});
