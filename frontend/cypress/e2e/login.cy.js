import { loginPage } from "../support/pages/LoginPage";

describe("Login Page (Cypress Clean Code)", () => {
  beforeEach(() => {
    loginPage.visit();
  });

  it("should load the login page", () => {
    cy.contains("Entrar").should("be.visible");
  });

  it("should show error on invalid login", () => {
    cy.intercept("POST", "**/api/auth/login").as("loginRequest");

    loginPage.fillEmail("admin@teste.com");
    loginPage.fillPassword("senhaerrada");
    loginPage.submit();

    cy.wait("@loginRequest").its("response.statusCode").should("eq", 401);
    loginPage.validarErro("Credenciais inválidas");
  });

  it("should login successfully with valid credentials", () => {
    cy.intercept("POST", "**/api/auth/login").as("loginRequest");

    const adminEmail = Cypress.env("ADMIN_EMAIL") || "admin@corporacao.com";
    const adminPassword = Cypress.env("ADMIN_PASSWORD") || "admin123";

    loginPage.fillEmail(adminEmail);
    loginPage.fillPassword(adminPassword);
    loginPage.submit();

    cy.wait("@loginRequest", { timeout: 15000 })
      .its("response.statusCode")
      .should("eq", 200);
    cy.url({ timeout: 15000 }).should("include", "/dashboard");
  });
});
