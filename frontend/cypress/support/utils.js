export const generateIntegrante = () => {
  const timestamp = Date.now();
  return {
    nome: `Integrante Cypress ${timestamp}`,
    cpf: Math.floor(Math.random() * 90000000000 + 10000000000).toString(),
    matricula: `CY-${timestamp}`,
    patrimonio: `PAT-${timestamp}`
  };
};
