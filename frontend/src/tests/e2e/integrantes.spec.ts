import { test, expect } from '@playwright/test';
import { loginAndSetStorage, waitForHydration } from './utils/auth-helper';

test.describe.serial('Gestão de Integrantes (E2E)', () => {
  const integranteNome = `INTEGRANTE E2E ${Date.now()}`;
  const integranteCpf = Math.floor(Math.random() * 90000000000 + 10000000000).toString();

  test.beforeEach(async ({ page }) => {
    await loginAndSetStorage(page);
    await page.goto('/dashboard/integrantes');
    await page.waitForLoadState('networkidle');
  });

  test('deve navegar corretamente entre abas e cadastrar novo integrante', async ({ page }) => {
    // Acessar formulário
    await page.goto('/dashboard/integrantes/novo');
    await waitForHydration(page);

    // Preencher formulário completo
    await page.fill('input[name="nome"]', integranteNome);
    await page.fill('input[name="cpf"]', integranteCpf);
    await page.fill('input[name="dataNascimento"]', '2005-10-20');
    await page.fill('input[name="telefone"]', '11999998888');

    // Responsável
    await page.fill('input[name="responsavel.nome"]', 'Responsavel E2E');
    await page.fill('input[name="responsavel.cpf"]', '12312312311');
    await page.fill('input[name="responsavel.parentesco"]', 'Pai');
    await page.fill('input[name="responsavel.telefone"]', '11977776666');

    // Corporação e Turma
    await page.fill('input[name="corporacao.nome"]', 'Corporação E2E');
    await page.fill('input[name="corporacao.telefone"]', '1133332222');
    await page.fill('input[name="turma"]', 'Turma Alpha');
    await page.fill('input[name="dataMatricula"]', '2024-01-01');

    // Atuação e Instrumento (Logica condicionais)
    await page.selectOption('select[name="tipoIntegrante"]', 'CORPO_MUSICAL');
    await page.selectOption('select[name="subtipoIntegrante"]', 'INSTRUMENTOS');
    await page.fill('input[name="instrumento"]', 'Saxofone');
    await page.fill('input[name="patrimonio"]', 'E2E-PAT-123');
    await page.selectOption('select[name="instrumentoOrigem"]', 'PROJETO');

    // Tamanhos
    await page.fill('input[name="tamanhoUniforme"]', '42');
    await page.fill('input[name="tamanhoBota"]', '40');

    // Finalizar
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/integrantes') && res.status() === 201),
      page.click('button:has-text("Finalizar Cadastro")')
    ]);

    await expect(page).toHaveURL(/\/dashboard\/integrantes/);
  });

  test('deve realizar busca sob demanda e validar visualização', async ({ page }) => {
    // Inicialmente a lista deve estar vazia/pronto para buscar
    await expect(page.locator('text=Pronto para buscar')).toBeVisible();

    // Pesquisar pelo nome criado
    await page.fill('input[placeholder="Filtrar por nome..."]', integranteNome);
    await page.click('button:has-text("Filtrar")');

    // Verificar se o integrante aparece na lista
    await expect(page.locator(`text=${integranteNome}`)).toBeVisible();

    // Verificar se o status "Não devolvido" está visível na tabela ao filtrar por patrimônio
    await page.fill('input[placeholder="Filtrar por patrimônio..."]', 'E2E-PAT-123');
    await page.click('button:has-text("Filtrar")');
    await expect(page.locator('table >> text=Não devolvido').first()).toBeVisible();
  });

  test('deve permitir editar e salvar alterações', async ({ page }) => {
    // Buscar primeiro
    await page.fill('input[placeholder="Filtrar por nome..."]', integranteNome);
    await page.click('button:has-text("Filtrar")');

    // Editar
    await page.click('a[title="Editar"]');
    await waitForHydration(page);

    const nomeEditado = integranteNome + ' (EDITADO)';
    await page.fill('input[name="nome"]', nomeEditado);

    // Testar o novo checkbox de devolução
    await page.check('input[type="checkbox"]'); // Já devolveu?

    await Promise.all([
      page.waitForResponse(res => res.status() === 200),
      page.click('button:has-text("Salvar Alterações")')
    ]);

    await expect(page).toHaveURL(/\/dashboard\/integrantes/);

    // Validar na lista que não é mais "Não devolvido"
    await page.fill('input[placeholder="Filtrar por nome..."]', nomeEditado);

    // Testar o novo filtro de Devolução usando o atributo name
    await page.selectOption('select[name="statusDevolucao"]', 'DEVOLVIDO');

    await page.click('button:has-text("Filtrar")');
    await expect(page.locator(`text=${nomeEditado}`)).toBeVisible();
    await expect(page.locator('table >> text=Não devolvido')).not.toBeVisible();
  });

  test('deve excluir o integrante e limpar a lista', async ({ page }) => {
    const nomeFinal = integranteNome + ' (EDITADO)';
    await page.fill('input[placeholder="Filtrar por nome..."]', nomeFinal);
    await page.click('button:has-text("Filtrar")');

    // Configura o diálogo de confirmação
    page.on('dialog', dialog => dialog.accept());

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/integrantes') && res.request().method() === 'DELETE'),
      page.click('button[title="Excluir"]')
    ]);

    expect(response.status()).toBe(204);
    await expect(page.locator('text=Nenhum integrante encontrado')).toBeVisible();
  });
});
