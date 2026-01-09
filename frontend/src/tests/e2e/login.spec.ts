import { test, expect } from '@playwright/test';
import { waitForHydration } from './utils/auth-helper';

test.describe('Página de Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('deve carregar os elementos de login corretamente', async ({ page }) => {
    await expect(page).toHaveTitle(/Corporação/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Entrar")')).toBeVisible();
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await waitForHydration(page);

    await page.fill('input[name="email"]', 'usuario_errado@teste.com');
    await page.fill('input[name="password"]', 'senha_incorreta');
    await page.click('button:has-text("Entrar")');

    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
  });

  test('deve permitir login com sucesso e redirecionar para o dashboard', async ({ page }) => {
    await waitForHydration(page);

    await page.fill('input[name="email"]', 'admin@corporacao.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button:has-text("Entrar")');

    await expect(page).toHaveURL(/\/dashboard/);
    // Verificar se o formulário de cadastro (aba padrão) está visível
    await expect(page.locator('text=Ficha de Cadastro de Integrante')).toBeVisible();
  });
});
