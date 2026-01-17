class IntegrantesPage {
  visitLista() {
    cy.visit('/dashboard/integrantes');
    cy.waitForHydration();
  }

  visitNovo() {
    cy.visit('/dashboard/integrantes/novo');
    cy.waitForHydration();
  }

  preencherIdentificacao(data) {
    if (data.nome) cy.get('input[name="nome"]').type(data.nome);
    if (data.cpf) cy.get('input[name="cpf"]').type(data.cpf);
    if (data.dataNascimento) cy.get('input[name="dataNascimento"]').type(data.dataNascimento);
    if (data.telefone) cy.get('input[name="telefone"]').type(data.telefone);
    return this;
  }

  preencherResponsavel(data) {
    if (data.nome) cy.get('input[name="responsavel.nome"]').type(data.nome);
    if (data.cpf) cy.get('input[name="responsavel.cpf"]').type(data.cpf);
    if (data.telefone) cy.get('input[name="responsavel.telefone"]').type(data.telefone);
    return this;
  }

  preencherCorporacao(data) {
    if (data.nome) cy.get('input[name="corporacao.nome"]').type(data.nome);
    if (data.telefone) cy.get('input[name="corporacao.telefone"]').type(data.telefone);
    if (data.dataMatricula) cy.get('input[name="dataMatricula"]').type(data.dataMatricula);
    return this;
  }

  preencherAtuacao(data) {
    if (data.tipo) cy.get('select[name="tipoIntegrante"]').select(data.tipo);
    if (data.subtipo) cy.get('select[name="subtipoIntegrante"]').select(data.subtipo);
    if (data.instrumento) cy.get('input[name="instrumento"]').type(data.instrumento);
    if (data.patrimonio) cy.get('input[name="patrimonio"]').type(data.patrimonio);
    if (data.origem) cy.get('select[name="instrumentoOrigem"]').select(data.origem);
    return this;
  }

  preencherTamanhos(data) {
    if (data.uniforme) cy.get('input[name="tamanhoUniforme"]').type(data.uniforme);
    if (data.bota) cy.get('input[name="tamanhoBota"]').type(data.bota);
    return this;
  }

  finalizarCadastro() {
    cy.intercept('POST', '**/api/integrantes').as('createIntegrante');
    cy.contains('button', 'Finalizar Cadastro').click();
    return cy.wait('@createIntegrante');
  }

  buscarPorNome(nome) {
    cy.get('input[placeholder="Filtrar por nome..."]').clear().type(nome);
  }

  buscarPorPatrimonio(patrimonio) {
    cy.get('input[placeholder="Filtrar por patrimônio..."]').clear().type(patrimonio);
    cy.contains('button', 'Filtrar').click();
  }

  abrirEdicao() {
    cy.get('a[title="Editar"]').first().click();
    cy.waitForHydration();
  }

  marcarDevolvido() {
    cy.get('input[type="checkbox"]').check();
  }

  salvarAlteracoes() {
    cy.intercept('PATCH', '**/api/integrantes/**').as('updateIntegrante');
    cy.contains('button', 'Salvar Alterações').click();
    return cy.wait('@updateIntegrante');
  }

  excluir() {
    cy.intercept('DELETE', '**/api/integrantes/**').as('deleteIntegrante');
    cy.get('button[title="Excluir"]').first().click();
    // O Cypress aceita diálogos automaticamente a menos que configurado o contrário
    return cy.wait('@deleteIntegrante');
  }

  selecionarStatusFiltro(status) {
    cy.get('select[name="statusDevolucao"]').select(status);
    return this;
  }

  validarVisibilidade(texto) {
    cy.contains(texto).should('be.visible');
  }
}

export const integrantesPage = new IntegrantesPage();
