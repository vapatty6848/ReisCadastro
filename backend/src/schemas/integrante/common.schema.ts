import { z } from 'zod';

export const TipoIntegrante = z.enum(['CORPO_MUSICAL', 'LINHA_FRENTE']);
export const SubtipoIntegrante = z.enum(['INSTRUMENTOS', 'COMANDANTE_MOR', 'PAVILHAO_NACIONAL', 'CORPO_COREOGRAFICO', 'BALIZAS']);
export const OrigemInstrumento = z.enum(['PROJETO', 'EMPRESA']);

// Validação para campos numéricos de até 3 dígitos
export const numericSizeSchema = z.string()
  .regex(/^\d{1,3}$/, 'Deve conter apenas números (máx. 3 dígitos)')
  .optional()
  .or(z.literal(''));
