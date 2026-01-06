import { z } from 'zod';
import { TipoIntegrante, SubtipoIntegrante, OrigemInstrumento, numericSizeSchema } from './integrante/common.schema';
import { responsavelSchema } from './integrante/responsavel.schema';
import { corporacaoSchema } from './integrante/corporacao.schema';

export const integranteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  dataNascimento: z.string().transform((str) => new Date(str)),
  cpf: z.string().length(11, 'CPF deve ter 11 dígitos'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  fotos: z.array(z.string()).optional(), // Será preenchido pelo backend após o upload
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cep: z.string().optional(),
  dataMatricula: z.string().transform((str) => new Date(str)),
  matriculaNumero: z.string().optional(),
  turma: z.string().min(1, 'Turma é obrigatória'),
  tipoIntegrante: TipoIntegrante,
  subtipoIntegrante: SubtipoIntegrante.optional(),
  tamanhoUniforme: numericSizeSchema,
  tamanhoBota: numericSizeSchema,
  instrumento: z.string().optional(),
  instrumentoOrigem: OrigemInstrumento.optional(),
  instrumentoRecebimento: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  instrumentoDevolucao: z.string().transform((str) => str ? new Date(str) : undefined).optional(),
  patrimonio: z.string().optional(),
  observacoes: z.string().optional(),
  responsavel: responsavelSchema,
  corporacao: corporacaoSchema,
});

export const updateIntegranteSchema = integranteSchema.partial();
