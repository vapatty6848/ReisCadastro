# Cadastro Integrantes Corporação 🥁

Sistema full-stack para gestão de integrantes de corporação, incluindo dados de integrantes, responsáveis e corporações.

## 🚀 Tecnologias

### Backend

- **Node.js 22** + **Express**
- **PostgreSQL** + **Prisma ORM**
- **JWT** para autenticação
- **Zod** para validação de esquemas
- **Jest** + **Supertest** para testes
- **Swagger** para documentação da API

### Frontend

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hook Form** + **Zod**
- **Axios**
- **Jest** + **React Testing Library**
- **Playwright** / **Cypress** para E2E

## 🛠️ Como rodar o projeto

### Pré-requisitos

- Docker e Docker Compose
- Node.js 22+

### Setup Rápido

1. Execute o script de setup:
   ```bash
   ./setup.sh
   ```

### Manualmente

1. **Infraestrutura:**

   ```bash
   cd infra
   docker-compose up -d
   ```

   _Nota: O banco de dados PostgreSQL roda na porta **5434**._

2. **Backend:**

   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

3. **Frontend:**
   ```bash
   cd frontend
   npm install
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

## 📝 Licença

Este projeto está sob a licença MIT.
