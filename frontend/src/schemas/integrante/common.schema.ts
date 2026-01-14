import { z } from 'zod';

export const numericSizeSchema = z.string()
  .max(10, 'Máximo 10 caracteres')
  .optional()
  .or(z.literal(''));

export const TipoIntegrante = z.enum(['CORPO_MUSICAL', 'LINHA_FRENTE']);
export const SubtipoIntegrante = z.enum(['INSTRUMENTOS', 'COMANDANTE_MOR', 'PAVILHAO_NACIONAL', 'CORPO_COREOGRAFICO', 'BALIZAS']);
export const OrigemInstrumento = z.enum(['PROJETO', 'EMPRESA']);
