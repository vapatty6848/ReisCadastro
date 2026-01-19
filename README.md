# Cadastro Integrantes Corporação 🥁

Sistema full-stack para gestão de integrantes de corporação, incluindo dados de integrantes, responsáveis e corporações.

## 🚀 Tecnologias

### Backend

- **Node.js 22** + **Express**
- **PostgreSQL** + **Prisma ORM** (Adoção de `upsert` e `findUnique`)
- **JWT** para autenticação segura
- **Zod** para validação rigorosa de esquemas e contratos
- **Arquitetura Service Layer**: Lógica desacoplada das rotas HTTP
- **Jest** + **Supertest** para testes de integração
- **Swagger** para documentação interativa em `/api-docs`

### Frontend

- **Next.js 14** (App Router)
- **TypeScript** para segurança de tipos
- **Tailwind CSS** + **Lucide Icons**
- **React Hook Form** + **Zod**
- **Page Object Model (POM)**: Estrutura de testes sustentável
- **Axios** com interceptores para auth
- **Playwright** & **Cypress** para cobertura completa de E2E

---

## 🏗️ Infraestrutura e Deploy

O projeto está configurado para ambientes de desenvolvimento e produção:

### Produção (Arquitetura Atual)

- **Frontend**: [Vercel](https://vercel.com) (Deploy automático via GitHub).
- **Backend**: VPS [Hostinger](https://hostinger.com) rodando **Node.js 22** e gerenciado pelo **PM2**.
- **Banco de Dados**: [Neon.tech](https://neon.tech) (PostgreSQL Serverless).

### CI/CD e Qualidade

O projeto conta com pipelines automatizados via **GitHub Actions** localizados em `.github/workflows/`:

- **Quality**: Execução de linting e testes unitários a cada Push/PR.
- **Docker**: Build automático e verificação de integridade das imagens de Backend e Frontend.
- **E2E**: Execução de testes de fluxo completo (Cypress/Playwright).

---

## ✨ Funcionalidades Avançadas

- **Dashboard de Estatísticas**: Visualização rápida do total de integrantes, distribuição por tipo e métricas por corporação.
- **Relatórios Dinâmicos**: Filtros em tempo real por Corporação, Tipo (Musical/Frente) e Status de Devolução.
- **Impressão Reativa**: Layouts otimizados para impressão de fichas individuais e listagens agrupadas, com controle de quebra de página e tipografia econômica.
- **Gestão de Arquivos**: Suporte para até 5 anexos (fotos/PDFs) por integrante, com limpeza automática de arquivos órfãos no servidor.
- **Relacionamentos Inteligentes**: Vinculação automática de responsáveis e corporações já cadastrados, evitando redundância de dados.
- **Busca Eficiente**: Listagem com carregamento automático e busca debounced (com atraso) para preservar performance.
- **Exportação**: Suporte para CSV e modo de impressão amigável.

## 🧪 Testes

O projeto possui uma suíte de testes ponta-a-ponta (E2E) para garantir o funcionamento do fluxo crítico.

### Executar Testes do Cypress (Frontend)

Com o sistema rodando (`npm run dev` ou container):

```bash
# Executar todos os testes em modo headless
cd frontend && npm run cypress:run

# Abrir a interface visual do Cypress
cd frontend && npm run cypress:open
```

### Executar Testes Unitários (Backend)

```bash
# Os testes do backend exigem o banco de dados rodando
cd backend && npm test
```

### Executar Testes Unitários (Frontend)

```bash
cd frontend && npm test
```

## 🛠️ Como rodar o projeto

### Pré-requisitos

- Docker e Docker Compose
- Node.js 22+

### Setup Rápido (Docker - Recomendado)

Este comando sobe o banco de dados, o backend e o frontend simultaneamente:

```bash
npm run docker:up
```

Após os containers subirem, você precisa aplicar as migrações e o seed (apenas na primeira vez):

```bash
npm run db:migrate
npm run db:seed
```

O sistema estará disponível em:

- **Local**: `http://localhost:3000`
- **Produção**: `https://reis-cadastro.vercel.app` (Ou seu domínio Vercel)

---

## 📚 Documentação Interna

Para detalhes específicos de processos, consulte:

- [Roteiro de Deploy](ROTEIRO_DEPLOY_AMANHA.md): Checklist e status da infraestrutura.
- [Histórico de Projeto](Rascunhos/HISTORY.md): Evolução das fases de desenvolvimento.
- [Guia de Replicação](Rascunhos/PROMPT.MD): Blueprint técnico para clonar o sistema.
- [Diagnóstico de Erros](Rascunhos/acodespace/RELATORIO_FINAL.md): Relatório de correções críticas.

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Banco de Dados: Porta `5434` (Host)

### Desenvolvimento Local (Sem Docker para App)

1. **Instale todas as dependências (Raiz, Frontend e Backend):**

   ```bash
   npm run install:all
   ```

2. **Suba apenas o Banco de Dados:**

   ```bash
   docker compose -f infra/docker-compose.yml up -d db
   ```

3. **Rode o Backend e Frontend em paralelo:**
   ```bash
   npm run dev
   ```

## 🔑 Credenciais Padrão

Para acessar o sistema em ambiente de desenvolvimento:

- **Usuário:** `admin@corporacao.com`
- **Senha:** `admin123`

## 📖 Documentação da API

A documentação Swagger está disponível em `http://localhost:3001/api-docs`.

### Endpoints Principais

- `POST /api/auth/login` - Login do usuário
- `GET /api/auth/me` - Dados do usuário logado
- `POST /api/integrantes` - Cadastrar integrante (com responsável e corporação)
- `GET /api/integrantes` - Listar todos os integrantes
- `GET /api/integrantes/:id` - Detalhes de um integrante
- `PATCH /api/integrantes/:id` - Atualizar integrante
- `DELETE /api/integrantes/:id` - Remover integrante

## 🧪 Testes e Qualidade

### Backend

- **Unitários:** `npm test`
- **Lint/Tipagem:** `npm run lint`
- **Documentação:** Acesse `http://localhost:3001/api-docs` com o servidor rodando.

### Frontend

- **Unitários:** `npm test`
- **Playwright (E2E):** `npx playwright test`
- **Cypress (E2E):** `npx cypress run`

## 🧪 Guia Completo de Qualidade

Para detalhes sobre como executar testes de **Performance**, **Segurança** e **Automação**, consulte o nosso:
👉 **[Guia de Testes e Qualidade (TESTING_GUIDE.md)](./TESTING_GUIDE.md)**

---

## 📄 Licença

Este projeto está sob a licença MIT.

```bash
cd frontend
npx playwright install # Necessário na primeira vez
npm run test:e2e       # Executa os testes em modo headless
```

- **Cypress (E2E):**
  ```bash
  cd frontend
  npm run cypress:open   # Abre a interface visual do Cypress
  npm run cypress:run    # Executa os testes no terminal
  ```

## 🤖 GitHub Actions (CI)

O projeto possui um workflow de Integração Contínua (`.github/workflows/ci.yml`) dividido em 4 estágios para facilitar a visualização:

1. **Lint Check:** Validação de padrões de código e tipos.
2. **Unit Tests:** Execução de testes unitários (Jest).
3. **Backend Build:** Validação de compilação do servidor.
4. **Frontend Build:** Validação de compilação da interface.

## 📄 Arquivos de Referência

- `PROMPT.MD`: Master Blueprint com a especificação técnica detalhada.
- `project-manifest.json`: Manifesto estruturado para automação e IA.

## 📁 Estrutura de Pastas

```
.
├── backend/             # API Express + Prisma
│   ├── prisma/          # Schema e Migrations
│   └── src/
│       ├── controllers/ # Lógica de negócio
│       ├── routes/      # Definição de rotas
│       ├── schemas/     # Validações Zod
│       └── utils/       # Resolvers e helpers
├── frontend/            # Next.js App
│   ├── src/
│   │   ├── app/         # Páginas e Layouts
│   │   ├── components/  # Componentes React
│   │   ├── contexts/    # Context API (Auth)
│   │   └── schemas/     # Validações de formulário
└── infra/               # Docker Compose e DB
```

## �️ Troubleshooting de Build e Deploy

### 🛑 Erro de Build Docker (Next.js Standalone)
**Problema:** Erro `failed to solve: /app/.next/standalone: not found` durante o build da imagem Docker.
**Causa:** O arquivo `next.config.js` estava sem a configuração `output: 'standalone'`.
**Solução:** Sempre garantir que `output: 'standalone'` esteja presente no `next.config.js` do frontend, pois o Dockerfile depende dessa estrutura para imagens otimizadas de produção.

---

## �📝 Licença

Este projeto está sob a licença MIT.
