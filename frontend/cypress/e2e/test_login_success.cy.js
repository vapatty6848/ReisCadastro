describe('Login Success', () => {
  it('should login successfully with admin credentials', () => {
    cy.visit('/login')
    cy.get('input[name="email"]').type('admin@corporacao.com')
    cy.get('input[name="password"]').type('admin123')
    cy.get('button[type="submit"]').click()
    
    cy.url({ timeout: 15000 }).should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })
})
