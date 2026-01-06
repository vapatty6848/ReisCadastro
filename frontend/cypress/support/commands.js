// Comandos personalizados para o Cypress
// https://on.cypress.io/custom-commands

Cypress.Commands.add('login', (email = 'admin@corporacao.com', password = 'admin123') => {
  cy.session([email, password], () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/login',
      body: { email, password },
    }).then((response) => {
      window.localStorage.setItem('@Corporacao:token', response.body.token);
      window.localStorage.setItem('@Corporacao:user', JSON.stringify(response.body.user));
    });
  });
});

Cypress.Commands.add('waitForHydration', () => {
  // Aumentando um pouco o tempo para estabilidade no ambiente de teste
  cy.wait(2000);
});
