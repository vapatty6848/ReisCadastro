import { z } from 'zod';
import { TipoIntegrante, SubtipoIntegrante, OrigemInstrumento, numericSizeSchema } from './integrante/common.schema';
import { responsavelSchema } from './integrante/responsavel.schema';
import { corporacaoSchema } from './integrante/corporacao.schema';

export const integranteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  dataNascimento: z.string().transform((str) => new Date(str)),
  cpf: z.string().length(11, 'CPF deve ter 11 dígitos'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  fotos: z.array(z.string()).optional(), // Será preenchido pelo backend após o upload
  rua: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  dataMatricula: z.string().transform((str) => new Date(str)),
  matriculaNumero: z.string().optional().nullable(),
  turma: z.string().min(1, 'Turma é obrigatória'),
  tipoIntegrante: TipoIntegrante,
  subtipoIntegrante: SubtipoIntegrante.optional().nullable(),
  tamanhoUniforme: numericSizeSchema.nullable(),
  tamanhoBota: numericSizeSchema.nullable(),
  instrumento: z.string().optional().nullable(),
  instrumentoOrigem: OrigemInstrumento.optional().nullable(),
  instrumentoRecebimento: z.string().transform((str) => str ? new Date(str) : null).optional().nullable(),
  instrumentoDevolucao: z.string().transform((str) => str ? new Date(str) : null).optional().nullable(),
  patrimonio: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  responsavel: responsavelSchema,
  corporacao: corporacaoSchema,
});

export const updateIntegranteSchema = integranteSchema.partial();
