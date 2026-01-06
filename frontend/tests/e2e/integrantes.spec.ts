import { test, expect } from '@playwright/test';

test.describe.serial('Gestão de Integrantes (CRUD)', () => {
  const integranteNome = 'Playwright Test Integrante ' + Date.now();
  const integranteCpf = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');

  test.beforeAll(async ({ request }) => {
    // Login via API uma única vez para a suíte serial
    const response = await request.post('http://localhost:3001/api/auth/login', {
      data: {
        email: 'admin@corporacao.com',
        password: 'admin123'
      }
    });
    const { token, user } = await response.json();
    process.env.TEST_TOKEN = token;
    process.env.TEST_USER = JSON.stringify(user);
  });

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('errors')) {
        console.log(`BROWSER LOG [${msg.type()}]: ${msg.text()}`);
      }
    });

    await page.goto('/login'); // Ir para uma página válida antes de setar localStorage
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('@Corporacao:token', token!);
      localStorage.setItem('@Corporacao:user', user!);
    }, { token: process.env.TEST_TOKEN, user: process.env.TEST_USER });

    await page.goto('/dashboard/integrantes');
    await page.waitForLoadState('networkidle');
  });

  test('deve cadastrar um novo integrante com sucesso', async ({ page }) => {
    await page.goto('/dashboard/integrantes/novo');
    await page.waitForLoadState('networkidle');

    // Wait for hydration
    await page.waitForTimeout(2000);

    // Dados do Integrante
    await page.fill('input[name="nome"]', integranteNome);
    await page.fill('input[name="cpf"]', integranteCpf);
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

    // Corporação
    await page.fill('input[name="corporacao.nome"]', 'Corporação Playwright');
    await page.fill('input[name="corporacao.telefone"]', '1133334444');
    await page.fill('input[name="turma"]', '7º Ano A');
    await page.fill('input[name="dataMatricula"]', '2023-02-01');

    // Atuação
    await page.selectOption('select[name="tipoIntegrante"]', 'CORPO_MUSICAL');
    await page.selectOption('select[name="subtipoIntegrante"]', 'INSTRUMENTOS');

    // Intercepta e clica
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/integrantes') && res.request().method() === 'POST', { timeout: 30000 }),
      page.click('button:has-text("Finalizar Cadastro")')
    ]);

    expect(response.status()).toBe(201);
    await expect(page).toHaveURL(/\/dashboard\/integrantes/);
    await expect(page.locator(`text=${integranteNome}`)).toBeVisible();
  });

  test('deve pesquisar e editar um integrante', async ({ page }) => {
    await page.fill('input[placeholder="Filtrar por nome..."]', integranteNome);
    await page.click('button:has-text("Filtrar")');

    await expect(page.locator(`text=${integranteNome}`)).toBeVisible();

    // Clica no botão de editar
    await page.click('a[title="Editar"]');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    const novoNome = integranteNome + ' EDITADO';
    await page.fill('input[name="nome"]', novoNome);

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/integrantes') && res.request().method() === 'PATCH', { timeout: 30000 }),
      page.click('button:has-text("Salvar Alterações")')
    ]);

    expect(response.status()).toBe(200);
    await expect(page).toHaveURL(/\/dashboard\/integrantes/);
    await expect(page.locator(`text=${novoNome}`)).toBeVisible();
  });

  test('deve permitir cadastrar um irmão com o mesmo CPF do responsável usando o botão copiar', async ({ page }) => {
    const nomeIrmao = 'Irmão Teste ' + Date.now();
    const cpfResponsavel = '99988877766';

    await page.goto('/dashboard/integrantes/novo');
    await page.waitForTimeout(2000);

    // Preenche dados do responsável primeiro
    await page.fill('input[name="responsavel.nome"]', 'Pai de Dois');
    await page.fill('input[name="responsavel.cpf"]', cpfResponsavel);
    await page.fill('input[name="responsavel.parentesco"]', 'Pai');
    await page.fill('input[name="responsavel.telefone"]', '11999998888');

    // Usa o botão "Copiar do Responsável" para o CPF do integrante
    await page.click('button:has-text("Copiar do Responsável")');
    const cpfValue = await page.inputValue('input[name="cpf"]');
    expect(cpfValue).toBe(cpfResponsavel);

    // Preenche o restante
    await page.fill('input[name="nome"]', nomeIrmao);
    await page.fill('input[name="dataNascimento"]', '2012-10-10');
    await page.fill('input[name="telefone"]', '11999998888');
    await page.fill('input[name="turma"]', '5º Ano B');
    await page.fill('input[name="dataMatricula"]', '2023-02-01');
    await page.fill('input[name="corporacao.nome"]', 'Escola Teste');
    await page.fill('input[name="corporacao.telefone"]', '1144445555');

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/integrantes') && res.request().method() === 'POST'),
      page.click('button:has-text("Finalizar Cadastro")')
    ]);

    expect(response.status()).toBe(201);
    await page.goto('/dashboard/integrantes');
    await page.fill('input[placeholder="Filtrar por nome..."]', nomeIrmao);
    await page.click('button:has-text("Filtrar")');
    await expect(page.locator(`text=${nomeIrmao}`)).toBeVisible();
  });

  test('deve excluir um integrante', async ({ page }) => {
    await page.fill('input[placeholder="Filtrar por nome..."]', integranteNome);
    await page.click('button:has-text("Filtrar")');

    // Configura o diálogo de confirmação
    page.on('dialog', dialog => dialog.accept());

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/integrantes') && res.request().method() === 'DELETE'),
      page.click('button[title="Excluir"]')
    ]);

    expect(response.status()).toBe(200);
    await expect(page.locator(`text=${integranteNome}`)).not.toBeVisible();
  });
});
