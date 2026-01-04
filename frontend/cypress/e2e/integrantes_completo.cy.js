/**
 * Casos de Teste: Gestão de Integrantes - Fluxo Completo (CRUD)
 */

const IntegrantesPage = {
  selectors: {
    // Listagem
    searchNome: 'input[placeholder="Filtrar por nome..."]',
    filterBtn: 'button:contains("Filtrar")',
    novoBtn: 'a:contains("Novo Cadastro")',
    tableRow: 'table tbody tr',
    editBtn: 'a[href*="/editar/"]',
    deleteBtn: 'button[title="Excluir"]',
    loading: ':contains("Carregando...")',

    // Formulário
    form: {
      nome: 'input[name="nome"]',
      cpf: 'input[name="cpf"]',
      dataNasc: 'input[name="dataNascimento"]',
      telefone: 'input[name="telefone"]',
      email: 'input[name="email"]',
      rua: 'input[name="rua"]',
      numero: 'input[name="numero"]',
      bairro: 'input[name="bairro"]',
      cep: 'input[name="cep"]',
      respNome: 'input[name="responsavel.nome"]',
      respCpf: 'input[name="responsavel.cpf"]',
      respParentesco: 'input[name="responsavel.parentesco"]',
      respTelefone: 'input[name="responsavel.telefone"]',
      corpNome: 'input[name="corporacao.nome"]',
      corpTelefone: 'input[name="corporacao.telefone"]',
      corpSerie: 'input[name="corporacao.serie"]',
      turma: 'input[name="turma"]',
      matriculaNumero: 'input[name="matriculaNumero"]',
      dataMatricula: 'input[name="dataMatricula"]',
      tipo: 'select[name="tipoIntegrante"]',
      subtipo: 'select[name="subtipoIntegrante"]',
      instrumento: 'input[name="instrumento"]',
      patrimonio: 'input[name="patrimonio"]',
      origemInstrumento: 'select[name="instrumentoOrigem"]',
      dataRecebimento: 'input[name="instrumentoRecebimento"]',
      tamanhoUniforme: 'input[name="tamanhoUniforme"]',
      tamanhoBota: 'input[name="tamanhoBota"]',
      submit: 'button[type="submit"]'
    }
  },

  login() {
    cy.session('admin-session', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('admin@corporacao.com');
      cy.get('input[name="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  },

  preencherFormulario(dados) {
    cy.get(this.selectors.form.nome).clear().type(dados.nome);
    cy.get(this.selectors.form.cpf).clear().type(dados.cpf);
    cy.get(this.selectors.form.dataNasc).clear().type('2005-10-20');
    cy.get(this.selectors.form.telefone).clear().type('11999998888');
    cy.get(this.selectors.form.email).clear().type('teste@cypress.com');

    cy.get(this.selectors.form.rua).clear().type('Rua Teste');
    cy.get(this.selectors.form.numero).clear().type('100');
    cy.get(this.selectors.form.bairro).clear().type('Centro');
    cy.get(this.selectors.form.cep).clear().type('12345678');

    cy.get(this.selectors.form.respNome).clear().type('Responsável Teste');
    cy.get(this.selectors.form.respCpf).clear().type('99988877766');
    cy.get(this.selectors.form.respParentesco).clear().type('Pai');
    cy.get(this.selectors.form.respTelefone).clear().type('11977776666');

    cy.get(this.selectors.form.corpNome).clear().type('Corporação Musical');
    cy.get(this.selectors.form.corpTelefone).clear().type('1144445555');
    cy.get(this.selectors.form.corpSerie).clear().type('9º Ano');
    cy.get(this.selectors.form.turma).clear().type('Turma A');
    cy.get(this.selectors.form.matriculaNumero).clear().type(dados.matricula);
    cy.get(this.selectors.form.dataMatricula).clear().type('2024-01-10');

    cy.get(this.selectors.form.tipo).select('CORPO_MUSICAL');
    cy.get(this.selectors.form.subtipo).should('be.visible').select('INSTRUMENTOS');

    // Campos de instrumento
    cy.get(this.selectors.form.instrumento).clear().type('Trompete');
    cy.get(this.selectors.form.patrimonio).clear().type(dados.patrimonio);
    cy.get(this.selectors.form.origemInstrumento).select('PROJETO');
    cy.get(this.selectors.form.dataRecebimento).clear().type('2024-01-15');

    // Tamanhos
    cy.get(this.selectors.form.tamanhoUniforme).clear().type('42');
    cy.get(this.selectors.form.tamanhoBota).clear().type('40');

    cy.get(this.selectors.form.submit).click();
  },

  pesquisar(nome) {
    cy.visit('/dashboard/integrantes');
    cy.url().should('include', '/integrantes');

    // Aguarda a página estabilizar
    cy.wait(2000);

    // Aguarda o carregamento inicial sumir (se houver)
    cy.get('body').then(($body) => {
      if ($body.find(':contains("Carregando...")').length > 0) {
        cy.contains('Carregando...', { timeout: 15000 }).should('not.exist');
      }
    });

    // Tenta encontrar o campo de nome de forma mais resiliente
    cy.get('input', { timeout: 15000 }).then(($inputs) => {
      const inputNome = $inputs.filter((i, el) => {
        const placeholder = el.getAttribute('placeholder') || '';
        return placeholder.toLowerCase().includes('nome');
      });

      if (inputNome.length > 0) {
        cy.wrap(inputNome).first()
          .should('be.visible')
          .click()
          .clear()
          .type(nome, { delay: 50 });
      } else {
        // Fallback para o seletor original se o filtro falhar
        cy.get(this.selectors.searchNome)
          .should('be.visible')
          .clear()
          .type(nome);
      }
    });

    cy.get(this.selectors.filterBtn).should('be.visible').click();

    // Aguarda o filtro ser aplicado
    cy.get('body').then(($body) => {
      if ($body.find(':contains("Carregando...")').length > 0) {
        cy.contains('Carregando...', { timeout: 15000 }).should('not.exist');
      }
    });

    cy.contains(nome, { timeout: 15000 }).should('be.visible');
  }
};

describe('Gestão de Integrantes - Fluxo Completo', () => {
  const testData = {
    nome: 'Cypress User ' + Math.floor(Math.random() * 10000),
    cpf: Math.floor(Math.random() * 100000000000).toString().padStart(11, '0'),
    matricula: 'MAT' + Math.floor(Math.random() * 100000),
    patrimonio: 'PAT' + Math.floor(Math.random() * 100000),
    nomeEditado: ''
  };

  beforeEach(() => {
    IntegrantesPage.login();
  });

  it('1. Deve cadastrar um novo integrante', () => {
    const stub = cy.stub();
    cy.on('window:alert', stub);

    cy.visit('/dashboard/integrantes/novo');
    cy.wait(3000); // Aguarda hidratação
    IntegrantesPage.preencherFormulario(testData);

    cy.wrap(stub).should('be.calledWithMatch', /sucesso/i);
    cy.url().should('include', '/dashboard/integrantes');
  });

  it('2. Deve pesquisar o integrante cadastrado', () => {
    IntegrantesPage.pesquisar(testData.nome);
  });

  it('3. Deve editar o integrante', () => {
    testData.nomeEditado = testData.nome + ' (Editado)';

    IntegrantesPage.pesquisar(testData.nome);
    cy.get(IntegrantesPage.selectors.editBtn).first().click();

    // Aguarda o carregamento dos dados no formulário
    cy.contains('Carregando dados...', { timeout: 10000 }).should('not.exist');

    // Prepara o stub para o alert
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertStub');
    });

    cy.get(IntegrantesPage.selectors.form.nome).should('be.visible').clear().type(testData.nomeEditado);
    cy.get(IntegrantesPage.selectors.form.submit).click();

    // Se o alert não aparecer em 2 segundos, vamos procurar por erros de validação na tela
    cy.wait(2000);
    cy.get('body').then(($body) => {
      const errorContainers = $body.find('.mb-4'); // Container comum de inputs
      const errorsFound = [];

      errorContainers.each((i, el) => {
        const $el = cy.$$(el);
        const errorText = $el.find('.text-red-500').text();
        if (errorText) {
          const label = $el.find('label').first().text();
          errorsFound.push(`${label}: ${errorText}`);
        }
      });

      if (errorsFound.length > 0) {
        throw new Error('Erros de validação encontrados no formulário:\n' + errorsFound.join('\n'));
      }
    });

    cy.get('@alertStub').should('be.calledWithMatch', /sucesso/i);
    cy.url().should('include', '/dashboard/integrantes');

    // Verifica se o nome editado aparece na lista
    IntegrantesPage.pesquisar(testData.nomeEditado);
  });

  it('4. Deve excluir o integrante', () => {
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('deleteAlertStub');
      cy.stub(win, 'confirm').returns(true);
    });

    IntegrantesPage.pesquisar(testData.nomeEditado);

    cy.get(IntegrantesPage.selectors.deleteBtn).first().click();

    cy.get('@deleteAlertStub').should('be.calledWithMatch', /sucesso/i);
    cy.contains(testData.nomeEditado).should('not.exist');
  });
});
