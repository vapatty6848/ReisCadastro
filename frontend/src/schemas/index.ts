import { z } from 'zod';
import { TipoIntegrante, SubtipoIntegrante, OrigemInstrumento, numericSizeSchema } from './integrante/common.schema';
import { responsavelSchema } from './integrante/responsavel.schema';
import { corporacaoSchema } from './integrante/corporacao.schema';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export const integranteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  dataNascimento: z.string().min(10, 'Data inválida'),
  cpf: z.string().length(11, 'CPF deve ter 11 dígitos'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').nullish().or(z.literal('')),
  fotos: z.any().optional(),
  rua: z.string().nullish().or(z.literal('')),
  numero: z.string().nullish().or(z.literal('')),
  bairro: z.string().nullish().or(z.literal('')),
  cep: z.string().nullish().or(z.literal('')),
  dataMatricula: z.string().min(10, 'Data de matrícula inválida'),
  matriculaNumero: z.string().nullish().or(z.literal('')),
  turma: z.string().min(1, 'Turma é obrigatória'),
  tipoIntegrante: TipoIntegrante,
  subtipoIntegrante: SubtipoIntegrante.nullish(),
  tamanhoUniforme: numericSizeSchema,
  tamanhoBota: numericSizeSchema,
  instrumento: z.string().nullish().or(z.literal('')),
  patrimonio: z.string().nullish().or(z.literal('')),
  instrumentoOrigem: OrigemInstrumento.nullish(),
  instrumentoRecebimento: z.any(),
  instrumentoDevolucao: z.any(),
  observacoes: z.any(),
  responsavel: responsavelSchema.nullish(),
  corporacao: corporacaoSchema.nullish(),
});

export type LoginData = z.infer<typeof loginSchema>;
export type IntegranteData = z.infer<typeof integranteSchema>;
