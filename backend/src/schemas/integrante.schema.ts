import { z } from 'zod';

const TipoIntegrante = z.enum(['CORPO_MUSICAL', 'LINHA_FRENTE']);
const SubtipoIntegrante = z.enum(['INSTRUMENTOS', 'COMANDANTE_MOR', 'PAVILHAO_NACIONAL', 'CORPO_COREOGRAFICO', 'BALIZAS']);
const OrigemInstrumento = z.enum(['PROJETO', 'EMPRESA']);

// Validação para campos numéricos de até 3 dígitos
const numericSizeSchema = z.string()
  .regex(/^\d{1,3}$/, 'Deve conter apenas números (máx. 3 dígitos)')
  .optional()
  .or(z.literal(''));

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
  responsavel: z.object({
    nome: z.string().min(3, 'Nome do responsável deve ter pelo menos 3 caracteres'),
    cpf: z.string().length(11, 'CPF do responsável deve ter 11 dígitos'),
    telefone: z.string().min(10, 'Telefone inválido'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    rua: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    cep: z.string().optional(),
    parentesco: z.string().min(1, 'Parentesco é obrigatório'),
  }),
  corporacao: z.object({
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
  }),
});

export const updateIntegranteSchema = integranteSchema.partial();
