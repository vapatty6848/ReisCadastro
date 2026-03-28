import { generateIntegrante } from "../support/utils";
import { loginPage } from "../support/pages/LoginPage";
import { integrantesPage } from "../support/pages/IntegrantesPage";

describe("Gestão de Integrantes - Fluxo Completo (Cypress Clean Code)", () => {
  const integrante = generateIntegrante();
  const editado = { ...integrante, nome: integrante.nome + " (EDITADO)" };

  beforeEach(() => {
    const adminEmail = Cypress.env("ADMIN_EMAIL") || "admin@corporacao.com";
    const adminPassword = Cypress.env("ADMIN_PASSWORD") || "admin123";

    loginPage.visit();
    loginPage.fillEmail(adminEmail);
    loginPage.fillPassword(adminPassword);
    loginPage.submit();

    cy.url().should("include", "/dashboard");
    integrantesPage.visitLista();
  });

  it("1. Deve cadastrar um novo integrante", () => {
    integrantesPage.visitNovo();

    integrantesPage.preencherIdentificacao({
      nome: integrante.nome,
      cpf: integrante.cpf,
      dataNascimento: "2000-05-15",
      telefone: "11988887777",
    });

    integrantesPage.preencherResponsavel({
      nome: "Pai do Integrante",
      cpf: "11122233344",
      telefone: "11977776666",
    });

    integrantesPage.preencherCorporacao({
      nome: "Corporação Cypress",
      telefone: "1144443333",
      dataMatricula: "2024-01-01",
    });

    integrantesPage.preencherAtuacao({
      tipo: "CORPO_MUSICAL",
      subtipo: "INSTRUMENTOS",
      instrumento: "Clarinete",
      patrimonio: integrante.patrimonio,
      origem: "PROJETO",
    });

    integrantesPage.preencherTamanhos({
      uniforme: "38",
      bota: "36",
    });

    integrantesPage
      .finalizarCadastro()
      .its("response.statusCode")
      .should("eq", 201);
    cy.url().should("include", "/dashboard/integrantes");
  });

  it("2. Deve pesquisar o integrante cadastrado (Busca sob demanda)", () => {
    integrantesPage.buscarPorNome(integrante.nome);
    cy.get("table").contains(integrante.nome).should("be.visible");
    cy.get("table").contains(integrante.patrimonio).should("be.visible");
  });

  it("3. Deve visualizar o integrante e navegar para edição", () => {
    integrantesPage.buscarPorNome(integrante.nome);
    cy.contains("button", "Filtrar").click();

    cy.get('a[title="Visualizar"]').first().click();

    cy.url().should("include", "/visualizar/");
    cy.contains("h1", "Visualizar Integrante", { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('input[name="nome"]').should("be.disabled");

    cy.contains("a", "Editar").click({ force: true });
    cy.url().should("include", "/editar/");
  });

  it("4. Deve editar o integrante e devolver instrumento", () => {
    integrantesPage.buscarPorNome(integrante.nome);
    cy.contains("button", "Filtrar").click();

    integrantesPage.abrirEdicao();

    integrantesPage.preencherIdentificacao({ nome: editado.nome });
    integrantesPage.marcarDevolvido();

    integrantesPage
      .salvarAlteracoes()
      .its("response.statusCode")
      .should("eq", 200);

    cy.url().should("include", "/dashboard/integrantes");
    cy.waitForHydration();

    integrantesPage.buscarPorNome(editado.nome);
    integrantesPage.selecionarStatusFiltro("DEVOLVIDO");
    cy.contains("button", "Filtrar").click();

    cy.get("table").contains(editado.nome).should("be.visible");
    cy.get("table").contains("Não devolvido").should("not.exist");
  });

  it("5. Deve excluir o integrante", () => {
    integrantesPage.buscarPorNome(editado.nome);
    cy.contains("button", "Filtrar").click();

    integrantesPage.excluir().its("response.statusCode").should("eq", 204);
    cy.contains("Nenhum integrante encontrado").should("be.visible");
  });
});
