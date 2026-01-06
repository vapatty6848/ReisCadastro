describe('Login Page (Cypress Clean Code)', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.waitForHydration();
  });

  it('should load the login page', () => {
    cy.contains('Entrar').should('be.visible');
  });

  it('should show error on invalid login', () => {
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    cy.get('input[name="email"]').type('admin@teste.com');
    cy.get('input[name="password"]').type('senhaerrada');

    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 401);
    cy.contains('Credenciais inválidas').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    cy.get('input[name="email"]').type('admin@corporacao.com');
    cy.get('input[name="password"]').type('admin123');

    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/dashboard');
  });
});
