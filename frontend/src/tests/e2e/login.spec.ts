import { test, expect } from '@playwright/test';
import { waitForHydration } from './utils/auth-helper';
import { LoginPage } from './pages/LoginPage';

test.describe('Página de Login', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navegar();
  });

  test('deve carregar os elementos de login corretamente', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await expect(page).toHaveTitle(/Corporação/);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.btnEntrar).toBeVisible();
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await waitForHydration(page);

    await loginPage.preencherCredenciais('usuario_errado@teste.com', 'senha_incorreta');
    await loginPage.entrar();

    await loginPage.validarErro('Credenciais inválidas');
  });

  test('deve permitir login com sucesso e redirecionar para o dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await waitForHydration(page);

    await loginPage.preencherCredenciais('admin@corporacao.com', 'admin123');
    await loginPage.entrar();

    await expect(page).toHaveURL(/\/dashboard/);
    // Verificar se o formulário de cadastro (aba padrão) está visível
    await expect(page.locator('text=Ficha de Cadastro de Integrante')).toBeVisible();
  });
});
