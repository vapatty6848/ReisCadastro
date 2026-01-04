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
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  fotos: z.any().optional(), // Usado para os arquivos no frontend
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cep: z.string().optional(),
  dataMatricula: z.string().min(10, 'Data de matrícula inválida'),
  matriculaNumero: z.string().optional(),
  turma: z.string().min(1, 'Turma é obrigatória'),
  tipoIntegrante: TipoIntegrante,
  subtipoIntegrante: SubtipoIntegrante.optional(),
  tamanhoUniforme: numericSizeSchema,
  tamanhoBota: numericSizeSchema,
  instrumento: z.string().optional(),
  patrimonio: z.string().optional(),
  instrumentoOrigem: OrigemInstrumento.optional(),
  instrumentoRecebimento: z.string().optional(),
  instrumentoDevolucao: z.string().optional(),
  observacoes: z.string().optional(),
  responsavel: responsavelSchema,
  corporacao: corporacaoSchema,
});

export type LoginData = z.infer<typeof loginSchema>;
export type IntegranteData = z.infer<typeof integranteSchema>;
