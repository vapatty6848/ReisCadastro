import { Page, expect, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly btnEntrar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.btnEntrar = page.locator('button:has-text("Entrar")');
  }

  async navegar() {
    await this.page.goto("/login");
  }

  async preencherCredenciais(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
  }

  async entrar() {
    await this.btnEntrar.click();
  }

  async validarErro(mensagem: string) {
    await expect(
      this.page
        .locator("p.text-red-500, p.text-red-600")
        .filter({ hasText: mensagem }),
    ).toBeVisible();
  }
}
