import { test, expect } from '@playwright/test';
import { loginAndSetStorage, waitForHydration } from './utils/auth-helper';

/**
 * Factory para gerar dados de integrante para testes E2E.
 * Segue princípios de Clean Code ao centralizar a criação de dados aleatórios.
 */
const createTestData = () => {
  const timestamp = Date.now();
  return {
    nome: `INTEGRANTE E2E ${timestamp}`,
    cpf: Math.floor(Math.random() * 90000000000 + 10000000000).toString(),
    dataNascimento: '2005-10-20',
    telefone: '11999998888',
    responsavel: {
      nome: 'Responsavel E2E',
      cpf: '12312312311',
      parentesco: 'Pai',
      telefone: '11977776666'
    },
    corporacao: {
      nome: 'Corporação E2E',
      telefone: '1133332222',
      dataMatricula: '2024-01-01'
    },
    atuacao: {
      tipo: 'CORPO_MUSICAL',
      subtipo: 'INSTRUMENTOS',
      instrumento: 'Saxofone',
      patrimonio: `E2E-PAT-${timestamp}`,
      origem: 'PROJETO'
    },
    tamanhos: {
      uniforme: '42',
      bota: '40'
    }
  };
};

test.describe.serial('Gestão de Integrantes (E2E)', () => {
  const data = createTestData();
  const nomeEditado = `${data.nome} (EDITADO)`;

  test.beforeEach(async ({ page }) => {
    await loginAndSetStorage(page);
    await page.goto('/dashboard/integrantes');
    await page.waitForLoadState('networkidle');
  });

  test('deve navegar corretamente entre abas e cadastrar novo integrante', async ({ page }) => {
    await page.goto('/dashboard/integrantes/novo');
    await waitForHydration(page);

    // Identificação
    await page.fill('input[name="nome"]', data.nome);
    await page.fill('input[name="cpf"]', data.cpf);
    await page.fill('input[name="dataNascimento"]', data.dataNascimento);
    await page.fill('input[name="telefone"]', data.telefone);

    // Responsável
    await page.fill('input[name="responsavel.nome"]', data.responsavel.nome);
    await page.fill('input[name="responsavel.cpf"]', data.responsavel.cpf);
    // parentesco deixado em branco para testar se é opcional
    await page.fill('input[name="responsavel.telefone"]', data.responsavel.telefone);

    // Corporação
    await page.fill('input[name="corporacao.nome"]', data.corporacao.nome);
    await page.fill('input[name="corporacao.telefone"]', data.corporacao.telefone);
    await page.fill('input[name="dataMatricula"]', data.corporacao.dataMatricula);

    // Atuação e Instrumento
    await page.selectOption('select[name="tipoIntegrante"]', data.atuacao.tipo);
    await page.selectOption('select[name="subtipoIntegrante"]', data.atuacao.subtipo);
    await page.fill('input[name="instrumento"]', data.atuacao.instrumento);
    await page.fill('input[name="patrimonio"]', data.atuacao.patrimonio);
    await page.selectOption('select[name="instrumentoOrigem"]', data.atuacao.origem);

    // Tamanhos
    await page.fill('input[name="tamanhoUniforme"]', data.tamanhos.uniforme);
    await page.fill('input[name="tamanhoBota"]', data.tamanhos.bota);

    // Finalizar
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/integrantes') && res.status() === 201),
      page.click('button:has-text("Finalizar Cadastro")')
    ]);

    await expect(page).toHaveURL(/\/dashboard\/integrantes/);
  });

  test('deve realizar busca sob demanda e validar visualização', async ({ page }) => {
    await page.fill('input[placeholder="Filtrar por nome..."]', data.nome);
    // O fetch é automático via debounce no componente

    await expect(page.locator(`text=${data.nome}`)).toBeVisible();

    // Validar status de devolução
    await page.fill('input[placeholder="Filtrar por patrimônio..."]', data.atuacao.patrimonio);
    await page.click('button:has-text("Filtrar")');
    await expect(page.locator('table >> text=Não devolvido').first()).toBeVisible();
  });

  test('deve permitir editar e salvar alterações', async ({ page }) => {
    await page.fill('input[placeholder="Filtrar por nome..."]', data.nome);
    await page.click('button:has-text("Filtrar")');

    await page.click('a[title="Editar"]');
    await waitForHydration(page);

    await page.fill('input[name="nome"]', nomeEditado);
    await page.check('input[type="checkbox"]'); // Marcar como devolvido

    await Promise.all([
      page.waitForResponse(res => res.status() === 200),
      page.click('button:has-text("Salvar Alterações")')
    ]);

    await expect(page).toHaveURL(/\/dashboard\/integrantes/);

    // Validar atualização na lista
    await page.fill('input[placeholder="Filtrar por nome..."]', nomeEditado);
    await page.selectOption('select[name="statusDevolucao"]', 'DEVOLVIDO');
    await page.click('button:has-text("Filtrar")');

    await expect(page.locator(`text=${nomeEditado}`)).toBeVisible();
    await expect(page.locator('table >> text=Não devolvido')).not.toBeVisible();
  });

  test('deve excluir o integrante e limpar a lista', async ({ page }) => {
    await page.fill('input[placeholder="Filtrar por nome..."]', nomeEditado);
    await page.click('button:has-text("Filtrar")');

    page.on('dialog', dialog => dialog.accept());

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/integrantes') && res.request().method() === 'DELETE'),
      page.click('button[title="Excluir"]')
    ]);

    expect(response.status()).toBe(204);
    await expect(page.locator('text=Nenhum integrante encontrado')).toBeVisible();
  });
});
