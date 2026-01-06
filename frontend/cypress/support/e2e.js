// Ignora erros de hidratação do React (comum no Next.js em dev/test)
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignora erros específicos de hidratação do React que não impedem a funcionalidade
  if (
    err.message.includes('Minified React error #418') ||
    err.message.includes('Minified React error #423') ||
    err.message.includes('Minified React error #425') ||
    err.message.includes('hydration') ||
    err.message.includes('Hydration')
  ) {
    return false
  }
  // Permitir outros erros falharem o teste
  return true
})

import './commands'
