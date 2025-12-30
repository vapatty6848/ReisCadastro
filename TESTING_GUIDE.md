# 📖 Guia de Testes e Qualidade: ReisCadastro

Este guia detalha os procedimentos para garantir a qualidade, performance e segurança da aplicação.

---

## 1. Testes Manuais

### 1.1 Interface (UI)

1. Acesse `http://localhost:3000`.
2. Realize o login com `admin@corporacao.com` / `admin123`.
3. Siga os fluxos descritos no arquivo `TEST_CASES.md`.

### 1.2 API (Swagger)

1. Com o backend rodando, acesse `http://localhost:3001/api-docs`.
2. Utilize o botão "Try it out" para testar os endpoints diretamente.
3. **Dica**: Para endpoints protegidos, faça o login no `/api/auth/login`, copie o token e use o botão "Authorize" no topo da página.

---

## 2. Testes Automatizados

### 2.1 Testes de Unidade e Integração (Jest)

Testam a lógica isolada e a comunicação com o banco de dados.

- **Backend**:
  ```bash
  cd backend && npm test
  ```
- **Frontend**:
  ```bash
  cd frontend && npm test
  ```

### 2.2 Testes End-to-End (E2E)

Simulam a jornada real do usuário no navegador.

- **Cypress (Interativo)**:
  Ideal para desenvolvimento, pois permite ver o navegador em tempo real.
  ```bash
  cd frontend && npx cypress open
  ```
- **Playwright (Headless/CI)**:
  Ideal para automação e CI/CD.
  ```bash
  cd frontend && npx playwright test
  ```

---

## 3. Testes de Performance

Para garantir que a aplicação suporte carga e seja rápida.

### 3.1 Lighthouse (Frontend)

Mede performance, acessibilidade e SEO.

1. Abra o Chrome DevTools (F12).
2. Vá na aba **Lighthouse**.
3. Clique em **Analyze page load**.

- **Meta**: Score > 90 em todas as categorias.

### 3.2 k6 (Carga na API)

Ferramenta para simular múltiplos usuários simultâneos e medir o tempo de resposta sob estresse.

1. **Instalação**:

   - **Linux**: `sudo apt-get update && sudo apt-get install k6` (ou via repositório oficial).
   - **macOS**: `brew install k6`
   - **Windows**: `winget install k6`

2. **Execução**:
   O script já está configurado em `performance/load-test.js`. Ele simula o login e a listagem de integrantes.

   ```bash
   k6 run performance/load-test.js
   ```

3. **O que observar**:
   - `http_req_duration`: Tempo médio de resposta (ideal < 200ms).
   - `http_req_failed`: Taxa de erro (deve ser 0%).
   - `p(95)`: Indica que 95% das requisições foram rápidas.

---

## 4. Testes de Segurança

### 4.1 Auditoria de Dependências

Verifica se existem bibliotecas com vulnerabilidades conhecidas.

```bash
npm audit
```

### 4.2 OWASP ZAP (Dast)

Para testes de penetração automatizados.

1. Baixe o [OWASP ZAP](https://www.zaproxy.org/).
2. Aponte para `http://localhost:3000` e execute o "Automated Scan".
3. Verifique se há falhas de Injeção de SQL ou Cross-Site Scripting (XSS).

### 4.3 Segurança de Cabeçalhos (Helmet)

O backend já utiliza a biblioteca `helmet` para configurar cabeçalhos HTTP seguros (HSTS, CSP, etc).

---

## 5. Automação (CI/CD)

Os testes são executados automaticamente a cada **Push** ou **Pull Request** via GitHub Actions.

- **Arquivo**: `.github/workflows/main.yml`
- **Jobs**:
  1. `lint`: Verifica padrões de código.
  2. `test-backend`: Roda Jest no backend.
  3. `test-frontend-cypress`: Roda Cypress.
  4. `test-frontend-playwright`: Roda Playwright.

---

## 6. Checklist de Lançamento (Production Ready)

- [ ] `npm audit` sem vulnerabilidades críticas.
- [ ] Cobertura de testes > 80%.
- [ ] Swagger atualizado com todos os endpoints.
- [ ] Variáveis de ambiente configuradas corretamente (`.env`).
- [ ] Build do frontend (`npm run build`) sem erros.
