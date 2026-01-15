/**
 * Converte null para "" recursivamente para facilitar o uso no frontend
 */
export const sanitizeResponse = (obj: any): any => {
  if (obj === null) return "";
  if (Array.isArray(obj)) return obj.map(sanitizeResponse);
  if (typeof obj === 'object' && obj !== null && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitizeResponse(v)])
    );
  }
  return obj;
};
