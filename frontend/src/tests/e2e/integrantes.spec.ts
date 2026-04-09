import { test, expect } from "@playwright/test";
import { loginAndSetStorage, waitForHydration } from "./utils/auth-helper";
import { IntegrantesPage } from "./pages/IntegrantesPage";

/**
 * Factory para gerar dados de integrante para testes E2E.
 * Segue princípios de Clean Code ao centralizar a criação de dados aleatórios.
 */
const createTestData = () => {
  const timestamp = Date.now();
  return {
    nome: `INTEGRANTE E2E ${timestamp}`,
    documento: Math.floor(Math.random() * 90000000000 + 10000000000).toString(),
    dataNascimento: "2005-10-20",
    telefone: "11999998888",
    responsavel: {
      nome: "Responsavel E2E",
      cpf: "12312312311",
      parentesco: "Pai",
      telefone: "11977776666",
    },
    corporacao: {
      nome: "EM Dr Getúlio Vargas", // Usar corporação predefinida do seed
      dataMatricula: "2024-01-01",
    },
    atuacao: {
      tipo: "CORPO_MUSICAL",
      subtipo: "INSTRUMENTOS",
      instrumento: "Saxofone",
      patrimonio: `E2E-PAT-${timestamp}`,
      origem: "PROJETO",
    },
    tamanhos: {
      uniforme: "42",
      bota: "40",
    },
  };
};

test.describe.serial("Gestão de Integrantes (E2E)", () => {
  const data = createTestData();
  const nomeEditado = `${data.nome} (EDITADO)`;

  test.beforeEach(async ({ page }) => {
    await loginAndSetStorage(page);
    const integrantesPage = new IntegrantesPage(page);
    await integrantesPage.navegarParaLista();
    await page.waitForLoadState("networkidle");
  });

  test("deve navegar corretamente entre abas e cadastrar novo integrante", async ({
    page,
  }) => {
    const integrantesPage = new IntegrantesPage(page);
    await integrantesPage.navegarParaNovo();
    await waitForHydration(page);

    await integrantesPage.preencherIdentificacao({
      nome: data.nome,
      documento: data.documento,
      dataNascimento: data.dataNascimento,
      telefone: data.telefone,
    });

    await integrantesPage.preencherResponsavel({
      nome: data.responsavel.nome,
      cpf: data.responsavel.cpf,
      telefone: data.responsavel.telefone,
    });

    await integrantesPage.preencherCorporacao({
      nome: data.corporacao.nome,
      dataMatricula: data.corporacao.dataMatricula,
    });

    await integrantesPage.preencherAtuacao(data.atuacao);
    await integrantesPage.preencherTamanhos(data.tamanhos);

    await integrantesPage.finalizarCadastro();

    await expect(page).toHaveURL(/\/dashboard\/integrantes/);
  });

  test("deve realizar busca sob demanda e validar visualização", async ({
    page,
  }) => {
    const integrantesPage = new IntegrantesPage(page);

    await integrantesPage.buscarPorNome(data.nome);
    await integrantesPage.validarVisibilidade(data.nome);

    await integrantesPage.buscarPorPatrimonio(data.atuacao.patrimonio);
    await expect(
      page.locator("table >> text=Não devolvido").first(),
    ).toBeVisible();
  });

  test("deve permitir editar e salvar alterações", async ({ page }) => {
    const integrantesPage = new IntegrantesPage(page);

    await integrantesPage.buscarPorNome(data.nome);
    await integrantesPage.btnFiltrar.click();

    await integrantesPage.abrirEdicao();
    await waitForHydration(page);

    await integrantesPage.preencherIdentificacao({ nome: nomeEditado });
    await integrantesPage.marcarDevolvido();

    await integrantesPage.salvarAlteracoes();

    await expect(page).toHaveURL(/\/dashboard\/integrantes/);

    // Validar atualização na lista
    await integrantesPage.buscarPorNome(nomeEditado);
    await integrantesPage.selecionarStatusFiltro("DEVOLVIDO");
    await integrantesPage.btnFiltrar.click();

    await integrantesPage.validarVisibilidade(nomeEditado);
    await expect(page.locator("table >> text=Não devolvido")).not.toBeVisible();
  });

  test("deve excluir o integrante e limpar a lista", async ({ page }) => {
    const integrantesPage = new IntegrantesPage(page);

    await integrantesPage.buscarPorNome(nomeEditado);
    await integrantesPage.btnFiltrar.click();

    await integrantesPage.excluir();

    await expect(
      page.locator("text=Nenhum integrante encontrado"),
    ).toBeVisible();
  });
});
