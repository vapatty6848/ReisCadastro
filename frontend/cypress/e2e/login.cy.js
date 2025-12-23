describe('Login Page', () => {
  it('should load the login page', () => {
    cy.visit('/login')
    cy.contains('Entrar').should('be.visible')
  })

  it('should show error on invalid login', () => {
    cy.intercept('POST', '**/api/auth/login').as('loginRequest')

    cy.visit('/login')
    cy.get('form').should('be.visible')

    // Wait for hydration - Next.js can be slow in dev mode
    cy.wait(3000)

    cy.get('input[name="email"]').type('admin@teste.com')
    cy.get('input[name="password"]').type('senhaerrada')

    cy.get('button[type="submit"]').click()

    // If the URL contains query params, it means hydration failed and it did a standard GET submit
    cy.url().should('not.include', '?email=')

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 401)
    cy.contains('Credenciais inválidas').should('be.visible')
  })
})
