#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() {
  echo -e "\n${BLUE}==>${NC} $1"
}

ok() {
  echo -e "${GREEN}✔${NC} $1"
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

fail() {
  echo -e "${RED}✖${NC} $1"
  exit 1
}

confirm() {
  local prompt="$1"
  read -r -p "$prompt [s/N]: " ans
  [[ "$ans" == "s" || "$ans" == "S" ]]
}

step "Precheck local"
cd "$PROJECT_ROOT"

if ! command -v git >/dev/null 2>&1; then
  fail "git não encontrado"
fi
if ! command -v npm >/dev/null 2>&1; then
  fail "npm não encontrado"
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "Branch atual: $BRANCH"

if [[ -n "$(git status --porcelain)" ]]; then
  warn "Há alterações não commitadas. Recomendado commitar antes do deploy."
  git status --short
  if ! confirm "Continuar mesmo assim?"; then
    fail "Deploy abortado pelo usuário"
  fi
else
  ok "Árvore git limpa"
fi

step "Validação local (lint)"
cd "$BACKEND_DIR"
npm run lint
ok "Backend lint OK"

cd "$FRONTEND_DIR"
npm run lint
ok "Frontend lint OK"

step "Resumo de variáveis obrigatórias (produção)"
cat <<'EOF'
No Hostinger (backend), confirme:
  NODE_ENV=production
  DATABASE_URL=<NEON_PROD_URL>
  JWT_SECRET=<SEGREDO_FORTE>
  PASSWORD_RECOVERY_ENABLED=false
  EXPOSE_RECOVERY_TOKEN_IN_RESPONSE=false
EOF

step "Comandos de deploy backend no servidor (Hostinger)"
cat <<'EOF'
# (executar no servidor)
cd /root/ReisCadastro

git fetch --all
git checkout <branch-release>
git pull origin <branch-release>

cd backend
npm install
npm run build
npx prisma migrate deploy
pm2 restart api
pm2 save
pm2 status
EOF

step "Comandos SQL para RBAC no Neon (produção)"
cat <<'EOF'
-- promover usuário principal para SUPER_ADMIN
UPDATE "User"
SET role = 'SUPER_ADMIN'
WHERE email = '<email-do-super-admin>';

-- validar papéis
SELECT email, name, role
FROM "User"
ORDER BY "createdAt";
EOF

step "Comandos de smoke test (produção)"
cat <<'EOF'
# health
curl -i https://<seu-backend>/api/health

# login
curl -i -X POST https://<seu-backend>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<email>","password":"<senha>"}'

# criar admin (somente SUPER_ADMIN com token válido)
curl -i -X POST https://<seu-backend>/api/auth/admins \
  -H "Authorization: Bearer <TOKEN_SUPER_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{"email":"novo@dominio.com","name":"Novo Admin","password":"SenhaForte123","role":"ADMIN"}'
EOF

step "Frontend (Vercel)"
cat <<'EOF'
Confirme no Vercel:
  NEXT_PUBLIC_API_URL=https://<seu-backend>

Depois publique a branch de release no Vercel.
EOF

ok "Roteiro executável gerado e validado localmente."
echo -e "\nArquivo de referência: docs/CHECKLIST_DEPLOY_PRODUCAO_RBAC.md"
