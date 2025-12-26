describe('Gestão de Integrantes (CRUD)', () => {
  const integranteNome = 'Cypress Test Integrante ' + Date.now();
  const integranteCpf = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');

  beforeEach(() => {
    // Login programático para evitar problemas de hidratação no form de login
    cy.request('POST', 'http://localhost:3001/api/auth/login', {
      email: 'admin@corporacao.com',
      password: 'admin123'
    }).then((response) => {
      const { token, user } = response.body;
      // Usando window.localStorage para garantir que o app veja os dados
      cy.window().then((win) => {
        win.localStorage.setItem('@Corporacao:token', token);
        win.localStorage.setItem('@Corporacao:user', JSON.stringify(user));
      });
    });

    cy.visit('/dashboard/integrantes');
  });

  it('deve cadastrar um novo integrante com sucesso', () => {
    cy.intercept('POST', '**/api/integrantes').as('createIntegrante')

    cy.visit('/dashboard/integrantes/novo')
    cy.get('form').should('be.visible')
    cy.wait(4000) // Wait for hydration

    // Dados do Integrante
    cy.get('input[name="nome"]').type(integranteNome)
    cy.get('input[name="cpf"]').type(integranteCpf)
    cy.get('input[name="dataNascimento"]').type('2010-05-15')
    cy.get('input[name="telefone"]').type('11988887777')
    cy.get('input[name="email"]').type('cypress@teste.com')

    // Endereço
    cy.get('input[name="rua"]').type('Rua de Teste')
    cy.get('input[name="numero"]').type('123')
    cy.get('input[name="bairro"]').type('Bairro Teste')
    cy.get('input[name="cep"]').type('01234567')

    // Responsável
    cy.get('input[name="responsavel.nome"]').type('Responsavel Cypress')
    cy.get('input[name="responsavel.cpf"]').type('11122233344')
    cy.get('input[name="responsavel.parentesco"]').type('Pai')
    cy.get('input[name="responsavel.telefone"]').type('11977776666')

    // Corporação
    cy.get('input[name="corporacao.nome"]').type('Corporação Cypress')
    cy.get('input[name="corporacao.telefone"]').type('1133334444')
    cy.get('input[name="turma"]').type('7º Ano A')
    cy.get('input[name="dataMatricula"]').type('2023-02-01')

    // Atuação
    cy.get('select[name="tipoIntegrante"]').select('CORPO_MUSICAL')

    cy.get('button[type="submit"]').click()

    // Check if it didn't do a standard GET submit
    cy.url().should('not.include', '?nome=')

    cy.wait('@createIntegrante').its('response.statusCode').should('eq', 201)

    // Verifica se voltou para a listagem
    cy.url().should('include', '/dashboard/integrantes')
    cy.contains(integranteNome).should('be.visible')
  })

  it('deve pesquisar e editar um integrante', () => {
    cy.intercept('PATCH', '**/api/integrantes/*').as('updateIntegrante')

    cy.visit('/dashboard/integrantes')
    cy.wait(2000)

    // Pesquisa pelo nome criado no teste anterior
    cy.get('input[placeholder="Pesquisar por nome..."]').type(integranteNome)
    cy.get('button').contains('Filtrar').click()

    cy.contains(integranteNome).should('be.visible')

    // Clica no botão de editar (primeiro da lista)
    cy.get('a[title="Editar"]').first().click()

    cy.get('form').should('be.visible')
    cy.wait(4000) // Wait for hydration

    // Altera o nome
    const novoNome = integranteNome + ' EDITADO';
    cy.get('input[name="nome"]').clear().type(novoNome)

    cy.get('button[type="submit"]').click()

    cy.url().should('not.include', '?nome=')

    cy.wait('@updateIntegrante').its('response.statusCode').should('eq', 200)

    cy.url().should('include', '/dashboard/integrantes')
    cy.contains(novoNome).should('be.visible')
  })

  it('deve excluir um integrante', () => {
    cy.intercept('DELETE', '**/api/integrantes/*').as('deleteIntegrante')

    cy.visit('/dashboard/integrantes')
    cy.wait(2000)

    // Pesquisa pelo nome editado
    cy.get('input[placeholder="Pesquisar por nome..."]').type(integranteNome)
    cy.get('button').contains('Filtrar').click()

    // Confirma o alert do navegador
    cy.on('window:confirm', () => true)

    // Clica no botão de excluir
    cy.get('button[title="Excluir"]').first().click()

    cy.wait('@deleteIntegrante').its('response.statusCode').should('eq', 204)

    cy.contains(integranteNome).should('not.exist')
  })
})

  it('deve pesquisar e editar um integrante', () => {
    cy.intercept('PATCH', '**/api/integrantes/*').as('updateIntegrante')

    cy.visit('/dashboard/integrantes')
    cy.wait(2000)

    // Pesquisa pelo nome criado no teste anterior
    cy.get('input[placeholder="Pesquisar por nome..."]').type(integranteNome)
    cy.get('button').contains('Filtrar').click()

    cy.contains(integranteNome).should('be.visible')

    // Clica no botão de editar (primeiro da lista)
    cy.get('a[title="Editar"]').first().click()

    cy.get('form').should('be.visible')
    cy.wait(4000) // Wait for hydration

    // Altera o nome
    const novoNome = integranteNome + ' EDITADO';
    cy.get('input[name="nome"]').clear().type(novoNome)

    cy.get('button[type="submit"]').click()

    cy.url().should('not.include', '?nome=')

    cy.wait('@updateIntegrante').its('response.statusCode').should('eq', 200)

    cy.url().should('include', '/dashboard/integrantes')
    cy.contains(novoNome).should('be.visible')
  })

  it('deve excluir um integrante', () => {
    cy.intercept('DELETE', '**/api/integrantes/*').as('deleteIntegrante')

    cy.visit('/dashboard/integrantes')
    cy.wait(2000)

    // Pesquisa pelo nome editado
    cy.get('input[placeholder="Pesquisar por nome..."]').type(integranteNome)
    cy.get('button').contains('Filtrar').click()

    // Confirma o alert do navegador
    cy.on('window:confirm', () => true)

    // Clica no botão de excluir
    cy.get('button[title="Excluir"]').first().click()

    cy.wait('@deleteIntegrante').its('response.statusCode').should('eq', 204)

    cy.contains(integranteNome).should('not.exist')
  })

  it('deve pesquisar e editar um integrante', () => {
    cy.visit('/dashboard/integrantes')

    // Pesquisa pelo nome criado no teste anterior
    cy.get('input[placeholder="Pesquisar por nome..."]').type(integranteNome)
    cy.get('button').contains('Filtrar').click()

    cy.contains(integranteNome).should('be.visible')

    // Clica no botão de editar (primeiro da lista)
    cy.get('a[title="Editar"]').first().click()

    cy.get('form').should('be.visible')
    cy.wait(2000) // Wait for hydration

    // Altera o nome
    const novoNome = integranteNome + ' EDITADO';
    cy.get('input[name="nome"]').clear().type(novoNome)

    cy.intercept('PATCH', '**/api/integrantes/*').as('updateIntegrante')
    cy.get('button[type="submit"]').click()

    cy.wait('@updateIntegrante').its('response.statusCode').should('eq', 200)

    cy.url().should('include', '/dashboard/integrantes')
    cy.contains(novoNome).should('be.visible')
  })

  it('deve excluir um integrante', () => {
    cy.visit('/dashboard/integrantes')

    // Pesquisa pelo nome editado
    cy.get('input[placeholder="Pesquisar por nome..."]').type(integranteNome)
    cy.get('button').contains('Filtrar').click()

    // Confirma o alert do navegador
    cy.on('window:confirm', () => true)

    cy.intercept('DELETE', '**/api/integrantes/*').as('deleteIntegrante')

    // Clica no botão de excluir
    cy.get('button[title="Excluir"]').first().click()

    cy.wait('@deleteIntegrante').its('response.statusCode').should('eq', 204)

    cy.contains(integranteNome).should('not.exist')
  })
})
