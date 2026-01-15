import { test, expect } from '@playwright/test';
import { loginAndSetStorage, waitForHydration } from './utils/auth-helper';

test.describe('Exemplos do Plano de Testes', () => {

  // ID: AUTH-02 - Login com Senha Inválida
  test('AUTH-02: deve exibir erro ao inserir senha incorreta', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@corporacao.com');
    await page.fill('input[name="password"]', 'senha_errada_123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  // ID: VAL-01 - Formato de CPF (Validação Frontend)
  test('VAL-01: deve validar formato de CPF inválido no frontend', async ({ page }) => {
    await loginAndSetStorage(page);
    await page.goto('/dashboard/integrantes/novo');
    await waitForHydration(page);

    const cpfInput = page.locator('input[name="cpf"]');
    await cpfInput.fill('123456'); // Menos de 11 dígitos

    // Clica no botão para disparar a validação
    await page.click('button:has-text("Finalizar Cadastro")');

    await expect(page.locator('form p:text("CPF deve ter pelo menos 11")').first()).toBeVisible();
  });

  // ID: SRCH-03 - Filtro Vazio
  test('SRCH-03: deve exibir mensagem quando nenhum resultado for encontrado', async ({ page }) => {
    await loginAndSetStorage(page);
    await page.goto('/dashboard/integrantes');
    await waitForHydration(page);

    await page.fill('input[placeholder="Filtrar por nome..."]', 'Nome Que Nao Existe 123456');
    await page.click('button:has-text("Filtrar")');

    await expect(page.locator('text=Nenhum integrante encontrado')).toBeVisible();
  });

});
