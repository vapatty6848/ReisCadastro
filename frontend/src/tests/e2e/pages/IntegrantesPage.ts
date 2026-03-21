import { Page, expect, Locator } from "@playwright/test";

export class IntegrantesPage {
  readonly page: Page;

  // Locators - Identificação
  readonly nomeInput: Locator;
  readonly cpfInput: Locator;
  readonly dataNascimentoInput: Locator;
  readonly telefoneInput: Locator;

  // Locators - Responsável
  readonly respNomeInput: Locator;
  readonly respCpfInput: Locator;
  readonly respTelefoneInput: Locator;

  // Locators - Corporação
  readonly corporacaoSelect: Locator;
  readonly corpTelefoneInput: Locator;
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
    this.cpfInput = page.locator('input[name="cpf"]');
    this.dataNascimentoInput = page.locator('input[name="dataNascimento"]');
    this.telefoneInput = page.locator('input[name="telefone"]');

    // Responsável
    this.respNomeInput = page.locator('input[name="responsavel.nome"]');
    this.respCpfInput = page.locator('input[name="responsavel.cpf"]');
    this.respTelefoneInput = page.locator('input[name="responsavel.telefone"]');

    // Corporação
    this.corporacaoSelect = page.locator('select[name="corporacao.id"]');
    this.corpTelefoneInput = page.locator('input[name="corporacao.telefone"]');
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
      (res) => res.status() === 200,
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
    if (data.cpf) await this.cpfInput.fill(data.cpf);
    if (data.dataNascimento)
      await this.dataNascimentoInput.fill(data.dataNascimento);
    if (data.telefone) await this.telefoneInput.fill(data.telefone);
  }

  async preencherResponsavel(data: any) {
    if (data.nome) await this.respNomeInput.fill(data.nome);
    if (data.cpf) await this.respCpfInput.fill(data.cpf);
    if (data.telefone) await this.respTelefoneInput.fill(data.telefone);
  }

  async preencherCorporacao(data: any) {
    if (data.nome)
      await this.corporacaoSelect.selectOption(new RegExp(data.nome, "i"));
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
