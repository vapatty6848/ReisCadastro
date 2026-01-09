# 🎯 Master Blueprint: Sistema de Gestão de Integrantes (Corporação)

Este documento serve como a especificação técnica definitiva e guia de execução para o projeto **ReisCadastro**. Ele contém todos os detalhes necessários para reconstruir ou expandir a aplicação sem erros.

---

## 🚀 Visão Geral do Sistema

Sistema Full-Stack para gestão de integrantes de uma corporação, permitindo o cadastro completo de integrantes, seus responsáveis e informações da corporação, incluindo upload de fotos e controle de instrumentos/uniformes.

### Fluxo Principal:

1. **Autenticação:** Login administrativo via JWT (Expira em 24h).
2. **Gestão (CRUD):** Cadastro centralizado. O Backend sanitiza campos `null` para `""` para evitar erros de renderização no Frontend.
3. **Relacionamentos:**
   - `resolveResponsavel`: Verifica CPF já existente. Se existir, atualiza os dados do responsável e vincula ao novo integrante.
   - `resolveCorporacao`: Vincula à corporação pelo Nome Único.
4. **Arquivos:** Upload via `multer`. Na edição, fotos removidas da lista enviada via JSON são deletadas fisicamente do storage pelo Backend (`fs.unlinkSync`).

---

## 🛠️ Stack Tecnológica

### Backend:

- **Arquitetura:** Camada de Serviço (Logic) + Controller (HTTP).
- **Runtime:** Node.js 22 (LTS)
- **Framework:** Express.js
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL (Porta: **5434** no host para evitar conflitos)
- **Documentação:** Swagger (JSDoc)
- **Segurança:** JWT + Bcrypt
- **Docker:** Imagem `node:22-slim` com OpenSSL instalado.

### Frontend:

- **Framework:** Next.js 14+ (App Router)
- **Visualização de Dados:** Recharts (Estatísticas do Dashboard)
- **Estilização:** Tailwind CSS + Lucide React (Ícones)
- **Impressão:** CSS Media Queries dedicadas para listagens e fichas.
- **Formulários:** React Hook Form + Zod (Validação)
- **HTTP Client:** Axios (Centralizado em `src/lib/api.ts`)
- **Docker:** Build `standalone` para alta performance.

### QA & DevOps:

- **E2E Testing:** Cypress (Visual) & Playwright (Headless)
- **Unit Testing:** Jest
- **Containerização:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
  - `quality.yml`: Executa Lint e Testes Unitários em todo o monorepo.
  - `docker-build.yml`: Valida o build das imagens Docker do Frontend e Backend.

---

## 📊 Modelo de Dados (Prisma)

### Entidades Principais:

- **User:** Admin (email, password).
- **Integrante:** Dados pessoais, fotos (array de strings), enums `TipoIntegrante` (CORPO_MUSICAL, LINHA_FRENTE).
- **Responsável:** Dados de contato e endereço, vinculado ao Integrante.
- **Corporacao:** Dados da instituição, vinculada ao Integrante.

---

## 🔌 API Endpoints (Swagger em `/api-docs`)

| Método | Rota                    | Descrição                        | Protegida? |
| :----- | :---------------------- | :------------------------------- | :--------- |
| POST   | `/api/auth/login`       | Autenticação e geração de Token  | Não        |
| GET    | `/api/integrantes`      | Listagem com filtros (nome, CPF) | Sim        |
| POST   | `/api/integrantes`      | Cadastro (Multipart/Form-Data)   | Sim        |
| GET    | `/api/integrantes/{id}` | Detalhes de um integrante        | Sim        |
| PATCH  | `/api/integrantes/{id}` | Atualização parcial              | Sim        |
| DELETE | `/api/integrantes/{id}` | Exclusão                         | Sim        |

---

## ⚙️ Configuração e Execução (Sem Erros)

### 1. Variáveis de Ambiente (.env)

**Backend (`backend/.env`):**

```env
DATABASE_URL="postgresql://user:password@localhost:5434/corporacao_db?schema=public"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=3001
```

**Frontend (`frontend/.env.local`):**

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 2. Comandos de Inicialização (Docker - Recomendado)

```bash
# 1. Instalar dependências em todos os módulos
npm run install:all

# 2. Subir a stack completa (DB, Backend, Frontend)
npm run docker:up

# 3. Aplicar migrações e popular banco (Seed)
npm run db:migrate
npm run db:seed
```

### 3. Desenvolvimento Local (Sem Docker para Apps)

```bash
# 1. Subir apenas o banco
docker compose -f infra/docker-compose.yml up -d db

# 2. Rodar backend e frontend simultaneamente
npm run dev
```

### 4. Credenciais Padrão

- **Usuário:** `admin@corporacao.com`
- **Senha:** `admin123`

---

## 🧪 Estratégia de Testes

### Cypress (E2E Interativo)

- **Configuração:** `supportFile: false` no `cypress.config.js`.
- **Execução:** `cd frontend && npx cypress run`.
- **Fluxos:** Login, Cadastro Completo, Edição e Exclusão.

### Playwright (E2E Headless)

- **Execução:** `cd frontend && npx playwright test`.

### GitHub Actions

O workflow está dividido em 4 estágios para facilitar o debug:

1. **Lint:** Verifica padrões de código.
2. **Test:** Executa testes unitários (Jest).
3. **Backend:** Valida build e migrações.
4. **Frontend:** Valida build e testes E2E.

---

## 📝 Notas de Implementação (Dicas para o Dev)

- **Upload de Fotos:** O backend usa `multer`. As fotos são salvas em `backend/uploads/` e servidas como estáticos.
- **CPF:** Validação rigorosa de 11 dígitos (apenas números) em ambos os lados.
- **Hidratação Next.js:** Em testes E2E, sempre use `cy.wait(1000)` ou verifique a visibilidade do formulário antes de interagir para evitar erros de hidratação do React.
- **Otimização de Listagem:** Utiliza debounce (atraso programado) na busca e carregamento automático ao montar o componente para melhor UX.
- **Relatórios:** Possui aba específica para relatórios agrupados por corporação com filtros dinâmicos de unidade e status de material devolvido.
- **Impressão:** CSS dedicado via `@media print` que remove fundos, ajusta tamanhos de fonte (10px para tabelas) e gerencia margens (0.5cm) para economia de papel e clareza.
- **Camada de Serviço:** O Backend utiliza `IntegranteService` para isolar consultas Prisma complexas (filtros dinâmicos, ordenação) da lógica de roteamento.

  - Backend: `src/schemas/` com schemas Zod separados por domínio
  - Frontend: `schemas/` com validações de formulário
  - Criar `utils/resolvers.ts` para lógica de vinculação automática (CPF, etc)

6. **Estrutura de Pastas:**

- aqui depois colocar a estrutura

7. **Documentar casos de testes para futura melhoria**

### Etapas de Desenvolvimento:

### Para Adaptar Stack:

- Trocar PostgreSQL
- Usar Next.js
- Adicionar Redis para cache
- Usar tRPC ao invés de RES

**Fase 1 - Setup Inicial:**

1. Criar estrutura de pastas (frontend + backend) dentro de cada a sua pasta infra deixando facil o entendimento
2. Configurar Docker Compose (PostgreSQL)
3. Setup Prisma com schema inicial
4. Configurar Express com middlewares básicos
5. Setup Next + Tailwind + typescript + lint + jest
6. workflows (github)

**Fase 2 - Autenticação:**

1. Criar model User no Prisma
2. Implementar POST /api/auth/login
3. Implementar GET /api/auth/me
4. Criar AuthContext no frontend
5. Criar LoginPage com validação

**Fase 3 - CRUD Principal:**

1. Criar models no Prisma ([ENTIDADE_PRINCIPAL] + relacionadas)
2. Criar schemas Zod (backend)
3. Implementar resolvers para entidades relacionadas
4. Criar rotas da API (POST, GET, PATCH, DELETE)
5. Adicionar validação e autenticação

**Fase 4 - Frontend:**

1. Criar schemas Zod (frontend)
2. Criar página principal login e de cadastro
3. Separar em componentes especializados
4. Criar componentes base reutilizáveis
5. Integrar com API

**Fase 5 - Testes:**

1. Configurar (frontend + backend)
2. Criar testes unitários de componentes
3. Criar testes de integração
4. Criar testes E2E da API
5. Organizar em pastas **tests**/

**Fase 6 - Refatoração:**

1. Identificar código duplicado
2. Extrair para utils/
3. Remover rotas não utilizadas
4. Simplificar Swagger
5. Atualizar documentação

**Fase 7 - Documentação:**

1. Criar README.md completo
2. Criar documentação para futuras manutenções e melhorias

### Endpoints Esperados:

- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Usuário autenticado
- `POST /api/[entidade]` — Criar (com relacionadas)
- `GET /api/[entidade]` — Listar/filtrar
- `PATCH /api/[entidade]/:id` — Atualizar
- `DELETE /api/[entidade]/:id` — Deletar

### Scripts Necessários:

**Backend:**

- `npm run dev` — Desenvolvimento
- `npm run build` — Build produção
- `npm run test` — Rodar testes
- `npm run prisma:migrate` — Rodar migrations
- `npm run prisma:seed` — Popular banco
- `npm run prisma:studio` — GUI do banco

**Frontend:**

- `npm run dev` — Desenvolvimento
- `npm run build` — Build produção
- `npm run test` — Rodar testes
- `npm run test:e2e` — Testes E2E

### Checklist de Qualidade:

- [ ] Componentes com responsabilidade única (< 150 linhas)
- [ ] Testes organizados em **tests**/
- [ ] Sem código duplicado
- [ ] Utils para lógica compartilhada
- [ ] Apenas rotas utilizadas no frontend
- [ ] Validação client-side e server-side
- [ ] Tratamento de erros consistente
- [ ] Swagger atualizado
- [ ] README com estrutura e endpoints
- [ ] Todos os testes passando
- [ ] TypeScript sem erros
- [ ] ESLint sem warnings

### Observações Importantes:

1. **Resolvers:** Use resolvers para criar entidades relacionadas automaticamente (ex: buscar ou criar por identificador único como CPF, email, etc)

2. **Validações Compartilhadas:** Extraia para `utils.ts` validações que podem ser reutilizadas (CPF, telefone, CEP, email, etc)

3. **Formulários Modulares:** Separe formulários grandes em componentes menores e mais gerenciáveis

4. **API Minimalista:** Implemente apenas o necessário. Se o frontend só usa GET e POST, não crie PUT/DELETE

5. **Testes Pragmáticos:** Foque em testar comportamento crítico, não implemente testes apenas por cobertura

6. **Formatar os commits com base nas boas praticas**- os commits serão validados e não será aceito commit direto na main principal, deverá primeiro abrir uma brench que sera validada pelo gitAction via pulll request e posterior merge

7. **Documentação:** Mantenha README sincronizados com o código

```

```
