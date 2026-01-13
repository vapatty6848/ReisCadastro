#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando setup automatizado do projeto Cadastro Integrantes Corporação...${NC}"

# Verificar Docker
if ! [ -x "$(command -v docker)" ]; then
  echo '❌ Erro: Docker não está instalado.' >&2
  exit 1
fi

# Instalação de dependências
echo -e "${BLUE}📦 Instalando dependências em todos os módulos...${NC}"
npm run install:all

# Infraestrutura
echo -e "${BLUE}🐳 Limpando ambiente e subindo containers (Banco, Backend, Frontend)...${NC}"
npm run docker:down
npm run docker:build
npm run docker:up

echo -e "${BLUE}⏳ Aguardando serviços ficarem prontos...${NC}"
# Aguarda até que os containers estejam realmente rodando
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
  if [ "$(docker inspect -f '{{.State.Running}}' reis_frontend_v2 2>/dev/null)" == "true" ]; then
    echo -e "${GREEN}✅ Serviços iniciados!${NC}"
    break
  fi
  echo -n "."
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  echo -e "\n❌ ${RED}Erro: Os containers não iniciaram a tempo.${NC}"
  echo -e "${BLUE}Dica: Tente rodar 'docker compose -f infra/docker-compose.yml logs' para ver o problema.${NC}"
  exit 1
fi

# Banco de Dados
echo -e "${BLUE}🔄 Aplicando migrações do Prisma...${NC}"
npm run db:migrate

echo -e "${BLUE}🌱 Populando banco de dados (Seed)...${NC}"
npm run db:seed

echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo "--------------------------------------------------"
echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "Backend:  ${GREEN}http://localhost:3001${NC}"
echo -e "Swagger:  ${GREEN}http://localhost:3001/api-docs${NC}"
echo "--------------------------------------------------"
echo "Credenciais padrão: admin@corporacao.com / admin123"
