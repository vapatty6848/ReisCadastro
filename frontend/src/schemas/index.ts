import { z } from "zod";
import {
  TipoIntegrante,
  SubtipoIntegrante,
  OrigemInstrumento,
  numericSizeSchema,
} from "./integrante/common.schema";
import { responsavelSchema } from "./integrante/responsavel.schema";
import { corporacaoSchema } from "./integrante/corporacao.schema";

const emptyToUndefinedObject = (value: unknown) => {
  if (!value || typeof value !== "object") return value;
  const cleanedValues = Object.values(value as Record<string, unknown>).filter(
    (v) => v !== "" && v !== null && v !== undefined,
  );
  return cleanedValues.length === 0 ? undefined : value;
};

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: z
    .string()
    .min(6, "A nova senha deve ter pelo menos 6 caracteres"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "A confirmação deve ter pelo menos 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export const createAdminSchema = z
  .object({
    email: z.string().email("Email inválido"),
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "A confirmação deve ter pelo menos 8 caracteres"),
    role: z.enum(["ADMIN", "SUPER_ADMIN"]).default("ADMIN"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export const integranteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  dataNascimento: z.string().min(10, "Data inválida"),
  documento: z.string().min(11, "Documento deve ter pelo menos 11 caracteres"),
  documentoTipo: z.enum(["CPF", "CIN"]).default("CPF"),
  telefone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido").nullish().or(z.literal("")),
  fotoPerfil: z.string().optional().nullable(),
  fotos: z.array(z.string()).optional(),
  rua: z.string().nullish().or(z.literal("")),
  numero: z.string().nullish().or(z.literal("")),
  complemento: z.string().nullish().or(z.literal("")),
  bairro: z.string().nullish().or(z.literal("")),
  cep: z.string().nullish().or(z.literal("")),
  dataMatricula: z.string().min(10, "Data de matrícula inválida"),
  matriculaNumero: z.string().nullish().or(z.literal("")),
  tipoIntegrante: TipoIntegrante,
  subtipoIntegrante: z.preprocess(
    (v) => (v === "" ? null : v),
    SubtipoIntegrante.nullish(),
  ),
  tamanhoUniforme: numericSizeSchema,
  tamanhoBota: numericSizeSchema,
  instrumento: z.string().nullish().or(z.literal("")),
  patrimonio: z.string().nullish().or(z.literal("")),
  instrumentoOrigem: z.preprocess(
    (v) => (v === "" ? null : v),
    OrigemInstrumento.nullish(),
  ),
  instrumentoRecebimento: z.string().nullish().or(z.literal("")),
  instrumentoDevolucao: z.string().nullish().or(z.literal("")),
  observacoes: z.string().nullish().or(z.literal("")),
  responsavel: z.preprocess(
    emptyToUndefinedObject,
    responsavelSchema.optional(),
  ),
  corporacao: corporacaoSchema,
});

export type LoginData = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type CreateAdminData = z.infer<typeof createAdminSchema>;
export type IntegranteData = z.infer<typeof integranteSchema>;
