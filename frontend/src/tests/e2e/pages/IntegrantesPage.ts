import { Page, expect, Locator } from "@playwright/test";

export class IntegrantesPage {
  readonly page: Page;

  // Locators - Identificação
  readonly nomeInput: Locator;
  readonly documentoInput: Locator;
  readonly dataNascimentoInput: Locator;
  readonly telefoneInput: Locator;
  readonly emailInput: Locator;

  // Locators - Responsável
  readonly respNomeInput: Locator;
  readonly respCinInput: Locator;
  readonly respTelefoneInput: Locator;
  readonly respEmailInput: Locator;
  readonly btnCopiarDadosIntegrante: Locator;
  readonly chkDevolvido: Locator;

  // Locators - Corporação
  readonly corporacaoSelect: Locator;
  readonly dataMatriculaInput: Locator;

  // Locators - Atuação
  readonly tipoSelect: Locator;
  readonly subtipoSelect: Locator;
  readonly instrumentoInput: Locator;
  readonly patrimonioInput: Locator;
  readonly origemSelect: Locator;

  // Locators - Tamanhos
  readonly uniformeInput: Locator;
  readonly botaInput: Locator;

  // Ações
  readonly btnFinalizar: Locator;
  readonly btnFiltrar: Locator;
  readonly searchInput: Locator;
  readonly patrimonioSearchInput: Locator;

  constructor(page: Page) {
    this.page = page;

    // Identificação
    this.nomeInput = page.locator('input[name="nome"]');
    this.documentoInput = page.locator('input[name="documento"]');
    this.dataNascimentoInput = page.locator('input[name="dataNascimento"]');
    this.telefoneInput = page.locator('input[name="telefone"]');
    this.emailInput = page.locator('input[name="email"]');

    // Responsável
    this.respNomeInput = page.locator('input[name="responsavel.nome"]');
    this.respCinInput = page.locator('input[name="responsavel.cin"]');
    this.respTelefoneInput = page.locator('input[name="responsavel.telefone"]');
    this.respEmailInput = page.locator('input[name="responsavel.email"]');
    this.btnCopiarDadosIntegrante = page.locator(
      '[data-testid="btn-copiar-dados-integrante"]',
    );
    this.chkDevolvido = page.locator("#chkDevolvido");

    // Corporação
    this.corporacaoSelect = page.locator('select[name="corporacao.nome"]');
    this.dataMatriculaInput = page.locator('input[name="dataMatricula"]');

    // Atuação
    this.tipoSelect = page.locator('select[name="tipoIntegrante"]');
    this.subtipoSelect = page.locator('select[name="subtipoIntegrante"]');
    this.instrumentoInput = page.locator('input[name="instrumento"]');
    this.patrimonioInput = page.locator('input[name="patrimonio"]');
    this.origemSelect = page.locator('select[name="instrumentoOrigem"]');

    // Tamanhos
    this.uniformeInput = page.locator('input[name="tamanhoUniforme"]');
    this.botaInput = page.locator('input[name="tamanhoBota"]');

    // Ações e Listagem
    this.btnFinalizar = page.locator('button:has-text("Finalizar Cadastro")');
    this.btnFiltrar = page.locator('button:has-text("Filtrar")').first();
    this.searchInput = page.locator('input[placeholder="Filtrar por nome..."]');
    this.patrimonioSearchInput = page.locator(
      'input[placeholder="Filtrar por patrimônio..."]',
    );
  }

  async navegarParaNovo() {
    await this.page.goto("/dashboard/integrantes/novo");
  }

  async navegarParaLista() {
    await this.page.goto("/dashboard/integrantes");
  }

  async abrirEdicao() {
    await this.page.click('a[title="Editar"]');
  }

  async salvarAlteracoes() {
    const responsePromise = this.page.waitForResponse(
      (res) =>
        res.url().includes("/api/integrantes") &&
        res.request().method() === "PATCH" &&
        res.status() === 200,
    );
    await this.page.click('button:has-text("Salvar Alterações")');
    await responsePromise;
  }

  async marcarDevolvido() {
    await this.page.check('input[type="checkbox"]');
  }

  async excluir() {
    this.page.on("dialog", (dialog) => dialog.accept());
    const responsePromise = this.page.waitForResponse(
      (res) =>
        res.url().includes("/api/integrantes") &&
        res.request().method() === "DELETE",
    );
    await this.page.click('button[title="Excluir"]');
    await responsePromise;
  }

  async selecionarStatusFiltro(
    status: "DEVOLVIDO" | "NAO_DEVOLVIDO" | "TODOS",
  ) {
    await this.page.selectOption('select[name="statusDevolucao"]', status);
  }

  async preencherIdentificacao(data: any) {
    if (data.nome) await this.nomeInput.fill(data.nome);
    if (data.documento) await this.documentoInput.fill(data.documento);
    if (data.dataNascimento)
      await this.dataNascimentoInput.fill(data.dataNascimento);
    if (data.telefone) await this.telefoneInput.fill(data.telefone);
    if (data.email) await this.emailInput.fill(data.email);
  }

  async preencherResponsavel(data: any) {
    if (data.nome) await this.respNomeInput.fill(data.nome);
    if (data.cin) await this.respCinInput.fill(data.cin);
    if (data.telefone) await this.respTelefoneInput.fill(data.telefone);
    if (data.email) await this.respEmailInput.fill(data.email);
  }

  async copiarDadosIntegranteParaResponsavel() {
    await this.btnCopiarDadosIntegrante.scrollIntoViewIfNeeded();
    await this.btnCopiarDadosIntegrante.click();
  }

  async validarResponsavelComDadosDoIntegrante(data: any) {
    if (data.documento)
      await expect(this.respCinInput).toHaveValue(data.documento);
    if (data.telefone)
      await expect(this.respTelefoneInput).toHaveValue(data.telefone);
    if (data.email) await expect(this.respEmailInput).toHaveValue(data.email);
  }

  async preencherCorporacao(data: any) {
    if (data.nome) {
      await this.corporacaoSelect.selectOption({ label: data.nome });
    }
    if (data.dataMatricula)
      await this.dataMatriculaInput.fill(data.dataMatricula);
  }

  async preencherAtuacao(data: any) {
    if (data.tipo) await this.tipoSelect.selectOption(data.tipo);
    // Subtipo é condicional - só preencher se não for APOIO e se o campo for visível
    if (data.subtipo && data.tipo !== "APOIO") {
      try {
        await this.subtipoSelect.selectOption(data.subtipo);
      } catch (e) {
        // Subtipo pode não estar visível dependendo do tipo selecionado
        console.log("Subtipo não disponível para este tipo");
      }
    }
    if (data.instrumento) await this.instrumentoInput.fill(data.instrumento);
    if (data.patrimonio) await this.patrimonioInput.fill(data.patrimonio);
    if (data.origem) await this.origemSelect.selectOption(data.origem);
  }

  async preencherTamanhos(data: any) {
    if (data.uniforme) await this.uniformeInput.fill(data.uniforme);
    if (data.bota) await this.botaInput.fill(data.bota);
  }

  async finalizarCadastro() {
    const responsePromise = this.page.waitForResponse(
      (res) => res.url().includes("/api/integrantes") && res.status() === 201,
    );
    await this.btnFinalizar.click();
    await responsePromise;
  }

  async buscarPorNome(nome: string) {
    await this.searchInput.fill(nome);
  }

  async buscarPorPatrimonio(patrimonio: string) {
    await this.patrimonioSearchInput.fill(patrimonio);
    await this.btnFiltrar.click();
  }

  async validarVisibilidade(texto: string) {
    await expect(this.page.locator(`text=${texto}`).first()).toBeVisible();
  }
}
