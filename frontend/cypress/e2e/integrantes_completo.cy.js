import { generateIntegrante } from '../support/utils';

describe('Gestão de Integrantes - Fluxo Completo (Cypress Clean Code)', () => {
  const integrante = generateIntegrante();
  const editado = { ...integrante, nome: integrante.nome + ' (EDITADO)' };

  beforeEach(() => {
    // Login via UI para que o usuário possa acompanhar
    cy.visit('/login');
    cy.waitForHydration();
    cy.get('input[name="email"]').type('admin@corporacao.com');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.visit('/dashboard/integrantes');
    cy.waitForHydration();
  });

  it('1. Deve cadastrar um novo integrante', () => {
    cy.visit('/dashboard/integrantes/novo');
    cy.waitForHydration();

    // Preencher campos básicos
    cy.get('input[name="nome"]').type(integrante.nome);
    cy.get('input[name="cpf"]').type(integrante.cpf);
    cy.get('input[name="dataNascimento"]').type('2000-05-15');
    cy.get('input[name="telefone"]').type('11988887777');

    // Responsável
    cy.get('input[name="responsavel.nome"]').type('Pai do Integrante');
    cy.get('input[name="responsavel.cpf"]').type('11122233344');
    // parentesco deixado em branco para testar se é opcional
    cy.get('input[name="responsavel.telefone"]').type('11977776666');

    // Corporação
    cy.get('input[name="corporacao.nome"]').type('Corporação Cypress');
    cy.get('input[name="corporacao.telefone"]').type('1144443333');
    cy.get('input[name="dataMatricula"]').type('2024-01-01');

    // Atuação
    cy.get('select[name="tipoIntegrante"]').select('CORPO_MUSICAL');
    cy.get('select[name="subtipoIntegrante"]').select('INSTRUMENTOS');
    cy.get('input[name="instrumento"]').type('Clarinete');
    cy.get('input[name="patrimonio"]').type(integrante.patrimonio);
    cy.get('select[name="instrumentoOrigem"]').select('PROJETO');

    // Tamanhos
    cy.get('input[name="tamanhoUniforme"]').type('38');
    cy.get('input[name="tamanhoBota"]').type('36');

    // Finalizar e interceptar resposta
    cy.intercept('POST', '**/api/integrantes').as('createIntegrante');
    cy.contains('button', 'Finalizar Cadastro').click();

    cy.wait('@createIntegrante').its('response.statusCode').should('eq', 201);
    cy.url().should('include', '/dashboard/integrantes');
  });

  it('2. Deve pesquisar o integrante cadastrado (Busca sob demanda)', () => {
    // Pesquisar
    cy.get('input[placeholder="Filtrar por nome..."]').type(integrante.nome);

    // Validar resultado na tabela (o fetch é automático via debounce no componente)
    cy.get('table').contains(integrante.nome).should('be.visible');
    cy.get('table').contains(integrante.patrimonio).should('be.visible');
  });

  it('3. Deve visualizar o integrante e navegar para edição', () => {
    // Buscar primeiro
    cy.get('input[placeholder="Filtrar por nome..."]').type(integrante.nome);
    cy.contains('button', 'Filtrar').click();

    // Clicar em visualizar
    cy.get('a[title="Visualizar"]').first().click();

    // Validar que entramos na página de visualização
    cy.url().should('include', '/visualizar/');
    cy.contains('h1', 'Visualizar Integrante', { timeout: 10000 }).should('be.visible');
    cy.get('input[name="nome"]').should('be.disabled').and('not.have.value', '');

    // Clicar no botão Editar
    cy.contains('a', 'Editar').click({ force: true });

    // Validar que fomos para a página de edição
    cy.url().should('include', '/editar/');
    cy.contains('h1', 'Editar Integrante').should('be.visible');
  });

  it('4. Deve editar o integrante e devolver instrumento', () => {
    cy.intercept('PATCH', '**/api/integrantes/**').as('updateIntegrante');

    // Buscar primeiro
    cy.get('input[placeholder="Filtrar por nome..."]').type(integrante.nome);
    cy.contains('button', 'Filtrar').click();

    // Clicar em editar
    cy.get('a[title="Editar"]').first().click();
    cy.waitForHydration();

    // Mudar nome
    cy.get('input[name="nome"]').should('be.visible').clear().type(editado.nome);

    // Marcar devolução
    cy.get('input[type="checkbox"]').should('exist').check({ force: true });

    cy.contains('button', 'Salvar Alterações').should('not.be.disabled').click({ force: true });

    // Aguardar navegação
    cy.url({ timeout: 15000 }).should('include', '/dashboard/integrantes');
    cy.waitForHydration();

    // Validar na lista que não diz mais "Não devolvido"
    cy.get('input[placeholder="Filtrar por nome..."]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(editado.nome);
    cy.get('input[placeholder="Filtrar por patrimônio..."]').clear().type(integrante.patrimonio);

    // Testar filtro de Devolução usando o novo atributo name
    cy.get('select[name="statusDevolucao"]').select('DEVOLVIDO');
    cy.get('table').contains(editado.nome).should('be.visible');
    cy.get('table').contains('Não devolvido').should('not.exist');
  });

  it('5. Deve excluir o integrante', () => {
    cy.get('input[placeholder="Filtrar por nome..."]').type(editado.nome);
    cy.contains('button', 'Filtrar').click();

    cy.intercept('DELETE', '**/api/integrantes/*').as('deleteIntegrante');

    // Stub confirm alert
    cy.on('window:confirm', () => true);
    cy.on('window:alert', () => true);

    cy.get('button[title="Excluir"]').first().click();

    cy.wait('@deleteIntegrante').its('response.statusCode').should('eq', 204);
    cy.contains('Nenhum integrante encontrado').should('be.visible');
  });
});
