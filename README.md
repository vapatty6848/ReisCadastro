# 🎼 ReisCadastro

Sistema de cadastro de integrantes de corporações musicais. Permite gerenciar membros, instrumentos, uniformes e responsáveis de bandas marciais, fanfarras e escolas de música.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Rodando Localmente](#-rodando-localmente)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Banco de Dados](#-banco-de-dados)
- [Testes](#-testes)
- [Deploy em Produção](#-deploy-em-produção)
- [Documentação da API](#-documentação-da-api)

---

## 📌 Sobre o Projeto

O **ReisCadastro** é uma aplicação fullstack para gestão de integrantes de corporações musicais. Funcionalidades principais:

- Cadastro completo de integrantes (dados pessoais, uniforme, instrumento, fotos)
- Controle de responsáveis (pais/tutores)
- Vinculação a corporações predefinidas ou personalizadas
- Dashboard com estatísticas
- Autenticação com JWT (perfis Admin e Super Admin)
- Upload de fotos de perfil e documentos

---

## 🛠 Tecnologias

### Frontend

| Tecnologia      | Versão |
| --------------- | ------ |
| Next.js         | 14.x   |
| React           | 18.x   |
| TypeScript      | 5.x    |
| React Hook Form | 7.x    |
| Zod             | 3.x    |
| Tailwind CSS    | 3.x    |
| Axios           | 1.x    |

### Backend

| Tecnologia         | Versão |
| ------------------ | ------ |
| Node.js            | 22.x   |
| Express            | 4.x    |
| TypeScript         | 5.x    |
| Prisma ORM         | 5.x    |
| PostgreSQL         | 15.x   |
| JWT (jsonwebtoken) | 9.x    |
| Zod                | 3.x    |
| Multer             | 2.x    |
| Swagger            | 6.x    |

### Testes

| Ferramenta      | Uso                                     |
| --------------- | --------------------------------------- |
| Jest            | Testes unitários e integração (backend) |
| Playwright      | Testes E2E (frontend)                   |
| Testing Library | Testes de componentes (frontend)        |

---

## 📁 Estrutura do Projeto

```
ReisCadastro/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos do banco de dados
│   │   ├── seed.ts             # Dados iniciais
│   │   └── migrations/         # Histórico de migrações
│   └── src/
│       ├── controllers/        # Lógica de requisições HTTP
│       ├── services/           # Regras de negócio
│       ├── routes/             # Definição de rotas
│       ├── middlewares/        # Autenticação, validação, erros
│       ├── schemas/            # Validações Zod
│       ├── errors/             # Tratamento de erros customizados
│       ├── lib/                # Instância do Prisma
│       ├── config/             # Swagger e configurações
│       └── __tests__/          # Testes unitários e de integração
├── frontend/
│   └── src/
│       ├── app/                # Páginas Next.js (App Router)
│       ├── components/         # Componentes React reutilizáveis
│       ├── hooks/              # Custom hooks
│       ├── contexts/           # Context API (autenticação)
│       ├── schemas/            # Validações Zod do formulário
│       ├── lib/                # Instância Axios
│       └── tests/              # Testes E2E e unitários
├── infra/
│   └── docker-compose.yml      # Stack local (banco + backend + frontend)
├── performance/
│   └── load-test.js            # Teste de carga
└── package.json                # Scripts raiz (monorepo)
```

---

## ✅ Pré-requisitos

- [Node.js 22.x](https://nodejs.org/)
- [Docker](https://www.docker.com/) e Docker Compose
- [Git](https://git-scm.com/)

---

## ⚙️ Configuração do Ambiente

### 1. Clonar o repositório

```bash
git clone https://github.com/vapatty6848/ReisCadastro.git
cd ReisCadastro
```

### 2. Instalar dependências

```bash
npm run install:all
```

### 3. Configurar variáveis de ambiente

**Backend** — copie o exemplo e preencha:

```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env`:

```dotenv
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5434/corporacao_db?schema=public"
JWT_SECRET="sua_chave_secreta_aqui"
NODE_ENV=development
```

**Frontend** — copie o exemplo:

```bash
cp frontend/.env.example frontend/.env.local
```

Edite `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🚀 Rodando Localmente

### Com Docker (recomendado)

Sobe banco + backend + frontend:

```bash
npm run docker:up
```

Aplica as migrações e popula o banco:

```bash
npm run db:migrate
npm run db:seed
```

Para tudo:

```bash
npm run docker:down
```

### Sem Docker

Precisa de um PostgreSQL rodando localmente. Então:

```bash
npm run dev:backend   # porta 3001
npm run dev:frontend  # porta 3000
```

Ou os dois juntos:

```bash
npm run dev
```

---

## 🔐 Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável       | Descrição                     | Exemplo                          |
| -------------- | ----------------------------- | -------------------------------- |
| `PORT`         | Porta do servidor             | `3001`                           |
| `DATABASE_URL` | URL de conexão PostgreSQL     | `postgresql://user:pass@host/db` |
| `JWT_SECRET`   | Chave secreta para tokens JWT | string longa e aleatória         |
| `NODE_ENV`     | Ambiente de execução          | `development` / `production`     |

### Frontend (`frontend/.env.local`)

| Variável              | Descrição       | Exemplo                 |
| --------------------- | --------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | URL base da API | `https://seu endereçoa` |

---

## 🗄 Banco de Dados

### Modelos principais

- **User** — Administradores do sistema (ADMIN / SUPER_ADMIN)
- **Integrante** — Membro da corporação com dados pessoais, instrumento, uniforme e fotos
- **Corporacao** — Entidade musical à qual o integrante pertence
- **Responsavel** — Pai/tutor do integrante

### Comandos úteis (Prisma)

```bash
# Gerar cliente Prisma
cd backend && npx prisma generate

# Aplicar migrações em produção
npx prisma migrate deploy

# Abrir interface visual do banco
npx prisma studio

# Popular o banco com dados iniciais
npx prisma db seed
```

### Corporações predefinidas

O sistema inclui automaticamente 4 corporações ao iniciar:

- EM Dr Getúlio Vargas
- Banda Marcial de Tapiraí
- Fanfarra de Tapiraí
- EM Prof. Flávio de Souza Nogueira

---

## 🧪 Testes

### Backend (Jest)

```bash
cd backend
npm test
```

Cobertura de testes:

```bash
npm test -- --coverage
```

### Frontend — Testes de componentes (Jest)

```bash
cd frontend
npm test
```

### Frontend — Testes E2E (Playwright)

```bash
cd frontend
npm run test:e2e
```

---

## 🌐 Deploy em Produção

### Frontend — Vercel

1. Conectar repositório na [Vercel](endereço vercel)
2. **Root Directory:** `frontend`
3. Variável de ambiente: `NEXT_PUBLIC_API_URL=https://seu endereço`
4. Deploy automático a cada push no `master`

### Backend — Hostinger (VPS)

```bash
ssh root@<IP_DO_SERVIDOR>

cd /nome da pasta do projeto
git pull origin master

cd nome da pasta  referente ao back
npm install
npm run build
npx prisma migrate deploy
pm2 restart nome da pasta referente  ao back
```

Verificar status:

```bash
pm2 status
curl -i https://< seu endereço>/health
```

---

## 📖 Documentação da API

Com o backend rodando, acesse:

```
http://localhost:3001/api/docs
```

### Principais endpoints

| Método   | Rota                   | Descrição            |
| -------- | ---------------------- | -------------------- |
| `POST`   | `/api/auth/login`      | Autenticação         |
| `GET`    | `/api/integrantes`     | Listar integrantes   |
| `POST`   | `/api/integrantes`     | Cadastrar integrante |
| `GET`    | `/api/integrantes/:id` | Buscar integrante    |
| `PATCH`  | `/api/integrantes/:id` | Atualizar integrante |
| `DELETE` | `/api/integrantes/:id` | Excluir integrante   |
| `GET`    | `/api/corporacoes`     | Listar corporações   |
| `POST`   | `/api/corporacoes`     | Criar corporação     |
| `GET`    | `/api/stats`           | Estatísticas gerais  |
| `GET`    | `/api/health`          | Status da API        |

---

## 📜 Licença

Projeto de uso interno. Todos os direitos reservados.
