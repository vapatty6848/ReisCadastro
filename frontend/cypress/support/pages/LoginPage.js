class LoginPage {
  visit() {
    cy.visit('/login');
    cy.waitForHydration();
  }

  fillEmail(email) {
    cy.get('input[name="email"]').type(email);
    return this;
  }

  fillPassword(password) {
    cy.get('input[name="password"]').type(password);
    return this;
  }

  submit() {
    cy.get('button[type="submit"]').click();
  }

  getErrorMessage() {
    return cy.get('.error-message, [role="alert"], :contains("Credenciais")').first();
  }

  validarErro(mensagem) {
    cy.contains(mensagem).should('be.visible');
  }
}

export const loginPage = new LoginPage();
