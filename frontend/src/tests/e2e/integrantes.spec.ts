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
    email: `integrante.${timestamp}@e2e.com`,
    responsavel: {
      nome: "Responsavel E2E",
      cin: "12312312311",
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

async function validarCamposPreenchidosNaEdicao(
  integrantesPage: IntegrantesPage,
  dadosIntegranteTeste: ReturnType<typeof createTestData>,
) {
  await expect(integrantesPage.nomeInput).toHaveValue(
    dadosIntegranteTeste.nome,
  );
  await expect(integrantesPage.documentoInput).toHaveValue(
    dadosIntegranteTeste.documento,
  );

  const dataNascimentoNaTela =
    await integrantesPage.dataNascimentoInput.inputValue();
  if (dataNascimentoNaTela) {
    await expect(integrantesPage.dataNascimentoInput).toHaveValue(
      dadosIntegranteTeste.dataNascimento,
    );
  }

  await expect(integrantesPage.telefoneInput).toHaveValue(
    dadosIntegranteTeste.telefone,
  );
  await expect(integrantesPage.emailInput).toHaveValue(
    dadosIntegranteTeste.email,
  );

  await expect(
    integrantesPage.page.locator('input[name="matriculaNumero"]'),
  ).not.toHaveValue("");
  await expect(integrantesPage.tipoSelect).toHaveValue(
    dadosIntegranteTeste.atuacao.tipo,
  );
  await expect(integrantesPage.subtipoSelect).toHaveValue(
    dadosIntegranteTeste.atuacao.subtipo,
  );
  await expect(integrantesPage.instrumentoInput).toHaveValue(
    dadosIntegranteTeste.atuacao.instrumento,
  );
  await expect(integrantesPage.origemSelect).toHaveValue(
    dadosIntegranteTeste.atuacao.origem,
  );
}

test.describe.serial("Gestão de Integrantes (E2E)", () => {
  const dadosIntegranteTeste = createTestData();
  const nomeIntegranteEditado = `${dadosIntegranteTeste.nome} (EDITADO)`;

  test.beforeEach(async ({ page }) => {
    await loginAndSetStorage(page);
    const integrantesPage = new IntegrantesPage(page);
    await integrantesPage.navegarParaLista();
    await integrantesPage.waitForListaPronta();
    await page.waitForLoadState("networkidle");
  });

  test("deve navegar corretamente entre abas e cadastrar novo integrante", async ({
    page,
  }) => {
    const integrantesPage = new IntegrantesPage(page);
    await integrantesPage.navegarParaNovo();
    await waitForHydration(page);

    await integrantesPage.preencherIdentificacao({
      nome: dadosIntegranteTeste.nome,
      documento: dadosIntegranteTeste.documento,
      dataNascimento: dadosIntegranteTeste.dataNascimento,
      telefone: dadosIntegranteTeste.telefone,
      email: dadosIntegranteTeste.email,
    });

    await integrantesPage.preencherResponsavel({
      nome: dadosIntegranteTeste.responsavel.nome,
      cin: dadosIntegranteTeste.documento,
    });
    await integrantesPage.copiarDadosIntegranteParaResponsavel();
    await integrantesPage.validarResponsavelComDadosDoIntegrante(
      dadosIntegranteTeste,
    );

    await integrantesPage.preencherCorporacao({
      nome: dadosIntegranteTeste.corporacao.nome,
      dataMatricula: dadosIntegranteTeste.corporacao.dataMatricula,
    });

    await integrantesPage.preencherAtuacao(dadosIntegranteTeste.atuacao);
    await integrantesPage.preencherTamanhos(dadosIntegranteTeste.tamanhos);

    await integrantesPage.finalizarCadastro();

    await expect(page).toHaveURL(/\/dashboard\/integrantes/);
  });

  test("deve realizar busca sob demanda e validar visualização", async ({
    page,
  }) => {
    const integrantesPage = new IntegrantesPage(page);

    await integrantesPage.buscarPorNome(dadosIntegranteTeste.nome);
    await integrantesPage.validarVisibilidade(dadosIntegranteTeste.nome);

    await integrantesPage.buscarPorPatrimonio(
      dadosIntegranteTeste.atuacao.patrimonio,
    );
    await expect(
      page.locator("table >> text=Não devolvido").first(),
    ).toBeVisible();
  });

  test("deve permitir editar e salvar alterações", async ({ page }) => {
    const integrantesPage = new IntegrantesPage(page);

    await integrantesPage.buscarPorNome(dadosIntegranteTeste.nome);
    await integrantesPage.btnFiltrar.click();

    await integrantesPage.abrirEdicaoPorNome(dadosIntegranteTeste.nome);
    await waitForHydration(page);

    await validarCamposPreenchidosNaEdicao(
      integrantesPage,
      dadosIntegranteTeste,
    );

    await integrantesPage.preencherIdentificacao({
      nome: nomeIntegranteEditado,
    });
    await integrantesPage.marcarDevolvido();

    await integrantesPage.salvarAlteracoes();

    await expect(page).toHaveURL(/\/dashboard\/integrantes/);

    // Validar atualização na lista
    await integrantesPage.buscarPorNome(nomeIntegranteEditado);
    await integrantesPage.selecionarStatusFiltro("DEVOLVIDO");
    await integrantesPage.btnFiltrar.click();

    await integrantesPage.validarVisibilidade(nomeIntegranteEditado);
    await expect(page.locator("table >> text=Não devolvido")).not.toBeVisible();
  });

  test("deve editar no celular mantendo os campos preenchidos", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const integrantesPage = new IntegrantesPage(page);

    await integrantesPage.buscarPorNome(nomeIntegranteEditado);
    await integrantesPage.btnFiltrar.click();

    await integrantesPage.abrirEdicaoPorNome(nomeIntegranteEditado);
    await waitForHydration(page);

    await validarCamposPreenchidosNaEdicao(integrantesPage, {
      ...dadosIntegranteTeste,
      nome: nomeIntegranteEditado,
    });

    await integrantesPage.preencherIdentificacao({
      nome: `${nomeIntegranteEditado} MOBILE`,
    });

    await integrantesPage.salvarAlteracoes();

    await expect(page).toHaveURL(/\/dashboard\/integrantes/);
    await integrantesPage.buscarPorNome(`${nomeIntegranteEditado} MOBILE`);
    await integrantesPage.btnFiltrar.click();
    await integrantesPage.validarVisibilidade(
      `${nomeIntegranteEditado} MOBILE`,
    );
  });

  test("deve excluir o integrante e limpar a lista", async ({ page }) => {
    const integrantesPage = new IntegrantesPage(page);

    await integrantesPage.buscarPorNome(nomeIntegranteEditado);
    await integrantesPage.btnFiltrar.click();

    await integrantesPage.excluir();

    await expect(
      page.locator("text=Nenhum integrante encontrado"),
    ).toBeVisible();
  });

  test("deve exibir campos corretos para subtipo Instrumentos/Rotativos", async ({
    page,
  }) => {
    const integrantesPage = new IntegrantesPage(page);
    await integrantesPage.navegarParaNovo();
    await waitForHydration(page);

    await integrantesPage.preencherAtuacao({
      tipo: "CORPO_MUSICAL",
      subtipo: "INSTRUMENTOS_ROTATIVOS",
    });

    await expect(integrantesPage.instrumentoInput).toBeVisible();
    await expect(integrantesPage.origemSelect).toBeVisible();
    await expect(integrantesPage.patrimonioInput).not.toBeVisible();
    await expect(integrantesPage.chkDevolvido).not.toBeVisible();
    await expect(
      page.locator('input[name="instrumentoDevolucao"]'),
    ).not.toBeVisible();
  });
});
