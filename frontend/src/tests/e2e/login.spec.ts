import { test, expect } from "@playwright/test";
import { waitForHydration } from "./utils/auth-helper";
import { LoginPage } from "./pages/LoginPage";

test.describe("Página de Login", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navegar();
  });

  test("deve carregar os elementos de login corretamente", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await expect(page).toHaveTitle(/Corporação/);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.btnEntrar).toBeVisible();
  });

  test("deve mostrar erro com credenciais inválidas", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await waitForHydration(page);

    await loginPage.preencherCredenciais(
      "usuario_errado@teste.com",
      "senha_incorreta",
    );
    await loginPage.entrar();

    await expect(
      page.locator("p.text-red-500, p.text-red-600").filter({
        hasText:
          /Credenciais inválidas|Dados de login inválidos|Erro ao fazer login/i,
      }),
    ).toBeVisible();
  });

  test("deve permitir login com sucesso e redirecionar para o dashboard", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await waitForHydration(page);

    const adminEmail = process.env.ADMIN_EMAIL || "admin@corporacao.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    await loginPage.preencherCredenciais(adminEmail, adminPassword);
    await loginPage.entrar();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    // Verificar se o formulário de cadastro (aba padrão) está visível
    await expect(
      page.locator("text=Ficha de Cadastro de Integrante"),
    ).toBeVisible();
  });
});
