import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const numericSizeSchema = z.string()
  .regex(/^\d{1,3}$/, 'Máximo 3 números')
  .optional()
  .or(z.literal(''));

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
  tipoIntegrante: z.enum(['CORPO_MUSICAL', 'LINHA_FRENTE']),
  subtipoIntegrante: z.enum(['INSTRUMENTOS', 'COMANDANTE_MOR', 'PAVILHAO_NACIONAL', 'CORPO_COREOGRAFICO', 'BALIZAS']).optional(),
  tamanhoUniforme: numericSizeSchema,
  tamanhoBota: numericSizeSchema,
  instrumento: z.string().optional(),
  patrimonio: z.string().optional(),
  instrumentoOrigem: z.enum(['PROJETO', 'EMPRESA']).optional(),
  instrumentoRecebimento: z.string().optional(),
  instrumentoDevolucao: z.string().optional(),
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

export type LoginData = z.infer<typeof loginSchema>;
export type IntegranteData = z.infer<typeof integranteSchema>;
