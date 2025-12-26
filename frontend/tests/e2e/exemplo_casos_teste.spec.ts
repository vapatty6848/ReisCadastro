import { test, expect } from '@playwright/test';

/**
 * EXEMPLO DE IMPLEMENTAÇÃO DOS CASOS DE TESTE (TEST_CASES.md)
 *
 * Este arquivo demonstra como mapear os IDs do Plano de Testes para o código Playwright.
 * Os casos de teste são agnósticos à ferramenta; você pode usar o mesmo plano para Cypress ou Playwright.
 */

test.describe('Exemplos do Plano de Testes', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  // ID: AUTH-02 - Login com Senha Inválida
  test('AUTH-02: deve exibir erro ao inserir senha incorreta', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@corporacao.com');
    await page.fill('input[name="password"]', 'senha_errada_123');
    await page.click('button[type="submit"]');

    // Verifica se a mensagem de erro aparece (ajuste o seletor conforme seu componente de Toast/Erro)
    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
    await expect(page).toHaveURL('/login'); // Garante que não redirecionou
  });

  // ID: VAL-01 - Formato de CPF (Validação Frontend)
  test('VAL-01: deve validar formato de CPF inválido no frontend', async ({ page }) => {
    // Primeiro fazemos login para acessar o formulário de cadastro
    // (Em um teste real, usaríamos o token no localStorage para ganhar tempo)

    // Simulando navegação para o cadastro (assumindo que já está logado ou injetando token)
    await page.goto('/dashboard/integrantes/novo');

    // Aguarda hidratação do React
    await page.waitForTimeout(3000);

    // Tenta inserir um CPF com letras ou menos dígitos
    const cpfInput = page.locator('input[name="cpf"]');
    await cpfInput.fill('123.abc.789');

    // Clica fora ou tenta submeter para disparar a validação do Zod
    await page.click('button:has-text("Finalizar Cadastro")');

    // Verifica se a mensagem de erro do Zod/Hook Form aparece
    // O texto exato depende da sua tradução/configuração do Zod
    await expect(page.locator('text=CPF deve ter 11 dígitos')).toBeVisible();
  });

  // ID: SRCH-03 - Filtro Vazio
  test('SRCH-03: deve exibir mensagem quando nenhum resultado for encontrado', async ({ page }) => {
    // Injeta token para pular login
    await page.evaluate(() => {
      localStorage.setItem('@Corporacao:token', 'fake-token');
      localStorage.setItem('@Corporacao:user', JSON.stringify({ nome: 'Admin' }));
    });

    await page.goto('/dashboard/integrantes');

    await page.fill('input[placeholder="Nome..."]', 'Nome Que Nao Existe 123456');
    await page.click('button:has-text("Filtrar")');

    await expect(page.locator('text=Nenhum integrante encontrado')).toBeVisible();
  });

});
