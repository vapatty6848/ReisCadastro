import { test, expect } from '@playwright/test';

test('deve carregar a página de login', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/Corporação/);
  await expect(page.locator('button:has-text("Entrar")')).toBeVisible();
});

test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
  await page.goto('/login');

  // Wait for hydration
  await page.waitForTimeout(2000);

  await page.fill('input[name="email"]', 'errado@teste.com');
  await page.fill('input[name="password"]', '123456');
  await page.click('button:has-text("Entrar")');

  await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
});
