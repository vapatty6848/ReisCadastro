#!/bin/bash

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

SKIP_INSTALL=0
SKIP_BUILD=0

for arg in "$@"; do
  case "$arg" in
    --skip-install)
      SKIP_INSTALL=1
      ;;
    --skip-build)
      SKIP_BUILD=1
      ;;
  esac
done

remove_conflicting_named_containers() {
  local names=("reis_frontend_v2" "reis_backend_v2" "reis_db_v2")

  for cname in "${names[@]}"; do
    if docker ps -a --format '{{.Names}}' | grep -Fxq "$cname"; then
      echo -e "${YELLOW}⚠️  Removendo container conflitante: $cname${NC}"
      docker rm -f "$cname" >/dev/null 2>&1 || true
    fi
  done
}

wait_for_backend_health() {
  echo -e "${BLUE}⏳ Aguardando backend ficar pronto...${NC}"
  MAX=40
  i=1
  until curl -sf http://localhost:3001/api/health >/dev/null 2>&1; do
    if [[ $i -gt $MAX ]]; then
      echo -e "\n${RED}❌ Backend não respondeu após $((MAX * 3)) segundos.${NC}"
      echo -e "${YELLOW}Dica: verifique os logs com: npm run docker:logs${NC}"
      return 1
    fi
    echo -n "."
    sleep 3
    i=$((i + 1))
  done
  echo -e "\n${GREEN}✅ Backend pronto!${NC}"
}

# --- Cleanup automático em caso de erro ---
cleanup() {
  if [[ $? -ne 0 ]]; then
    echo -e "\n${RED}❌ Erro durante o setup. Derrubando containers para manter ambiente limpo...${NC}"
    npm run docker:down:clean 2>/dev/null || true
  fi
}
trap cleanup EXIT

# --- Verificações iniciais ---
echo -e "${BLUE}🚀 Setup do ReisCadastro${NC}"
echo "--------------------------------------------------"

if ! command -v docker &>/dev/null; then
  echo -e "${RED}❌ Docker não encontrado. Instale em https://docs.docker.com/get-docker/${NC}" >&2
  exit 1
fi

if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ Node.js não encontrado. Instale a versão 22.x em https://nodejs.org/${NC}" >&2
  exit 1
fi

# --- Dependências ---
if [[ $SKIP_INSTALL -eq 0 ]]; then
  echo -e "${BLUE}📦 Instalando dependências...${NC}"
  npm run install:all
else
  echo -e "${YELLOW}⏭️  Pulando instalação de dependências (--skip-install).${NC}"
fi

# --- Containers ---
echo -e "${BLUE}🐳 Limpando e reconstruindo containers...${NC}"
npm run docker:down:clean
remove_conflicting_named_containers

if [[ $SKIP_BUILD -eq 0 ]]; then
  npm run docker:build
else
  echo -e "${YELLOW}⏭️  Pulando build de imagens (--skip-build).${NC}"
fi

npm run docker:up

# --- Aguardar backend saudável (health check real) ---
wait_for_backend_health

# --- Banco de dados ---
echo -e "${BLUE}🔄 Aplicando migrações...${NC}"
npm run db:migrate

echo -e "${BLUE}🌱 Populando banco de dados...${NC}"
npm run db:seed

# --- Sucesso ---
echo ""
echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo "--------------------------------------------------"
echo -e "  Frontend : ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend  : ${GREEN}http://localhost:3001${NC}"
echo -e "  Swagger  : ${GREEN}http://localhost:3001/api-docs${NC}"
echo "--------------------------------------------------"
echo -e "${YELLOW}Para derrubar o ambiente: npm run docker:down:clean${NC}"
echo -e "${YELLOW}Para testar a API:        ./test_api.sh${NC}"
echo "Credenciais iniciais definidas em backend/prisma/seed.ts"
