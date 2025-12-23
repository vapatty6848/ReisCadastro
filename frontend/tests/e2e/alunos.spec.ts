import { test, expect } from '@playwright/test';

test.describe.serial('Gestão de Integrantes (CRUD)', () => {
  const alunoNome = 'Playwright Test Aluno ' + Date.now();
  const alunoCpf = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');

  test.beforeAll(async ({ request }) => {
    // Login via API uma única vez para a suíte serial
    const response = await request.post('http://localhost:3001/api/auth/login', {
      data: {
        email: 'admin@fanfarra.com',
        password: 'admin123'
      }
    });
    const { token, user } = await response.json();
    process.env.TEST_TOKEN = token;
    process.env.TEST_USER = JSON.stringify(user);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login'); // Ir para uma página válida antes de setar localStorage
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('@Fanfarra:token', token);
      localStorage.setItem('@Fanfarra:user', user);
    }, { token: process.env.TEST_TOKEN, user: process.env.TEST_USER });

    await page.goto('/dashboard/alunos');
    await page.waitForLoadState('networkidle');
  });

  test('deve cadastrar um novo integrante com sucesso', async ({ page }) => {
    await page.goto('/dashboard/alunos/novo');
    await page.waitForLoadState('networkidle');

    // Wait for hydration
    await page.waitForTimeout(4000);

    // Dados do Aluno
    await page.fill('input[name="nome"]', alunoNome);
    await page.fill('input[name="cpf"]', alunoCpf);
    await page.fill('input[name="dataNascimento"]', '2010-05-15');
    await page.fill('input[name="telefone"]', '11988887777');
    await page.fill('input[name="email"]', 'playwright@teste.com');

    // Endereço
    await page.fill('input[name="rua"]', 'Rua de Teste');
    await page.fill('input[name="numero"]', '123');
    await page.fill('input[name="bairro"]', 'Bairro Teste');
    await page.fill('input[name="cep"]', '01234567');

    // Responsável
    await page.fill('input[name="responsavel.nome"]', 'Responsavel Playwright');
    await page.fill('input[name="responsavel.cpf"]', '11122233344');
    await page.fill('input[name="responsavel.parentesco"]', 'Pai');
    await page.fill('input[name="responsavel.telefone"]', '11977776666');

    // Escola
    await page.fill('input[name="escola.nome"]', 'Escola Playwright');
    await page.fill('input[name="escola.telefone"]', '1133334444');
    await page.fill('input[name="turma"]', '7º Ano A');
    await page.fill('input[name="dataMatricula"]', '2023-02-01');

    // Atuação
    await page.selectOption('select[name="tipoIntegrante"]', 'CORPO_MUSICAL');

    // Intercepta e clica
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/alunos') && res.request().method() === 'POST', { timeout: 15000 }),
      page.click('button:has-text("Finalizar Cadastro")')
    ]);

    expect(response.status()).toBe(201);
    await expect(page).toHaveURL(/\/dashboard\/alunos/);
    await expect(page.locator(`text=${alunoNome}`)).toBeVisible();
  });

  test('deve pesquisar e editar um integrante', async ({ page }) => {
    await page.fill('input[placeholder="Pesquisar por nome..."]', alunoNome);
    await page.click('button:has-text("Filtrar")');

    await expect(page.locator(`text=${alunoNome}`)).toBeVisible();

    // Clica no botão de editar
    await page.click('a[title="Editar"]');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(4000);

    const novoNome = alunoNome + ' EDITADO';
    await page.fill('input[name="nome"]', novoNome);

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/alunos') && res.request().method() === 'PATCH', { timeout: 15000 }),
      page.click('button:has-text("Salvar Alterações")')
    ]);

    expect(response.status()).toBe(200);
    await expect(page).toHaveURL(/\/dashboard\/alunos/);
    await expect(page.locator(`text=${novoNome}`)).toBeVisible();
  });

  test('deve excluir um integrante', async ({ page }) => {
    await page.fill('input[placeholder="Pesquisar por nome..."]', alunoNome);
    await page.click('button:has-text("Filtrar")');

    // Configura o diálogo de confirmação
    page.on('dialog', dialog => dialog.accept());

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/alunos') && res.request().method() === 'DELETE'),
      page.click('button[title="Excluir"]')
    ]);

    expect(response.status()).toBe(204);
    await expect(page.locator(`text=${alunoNome}`)).not.toBeVisible();
  });
});
