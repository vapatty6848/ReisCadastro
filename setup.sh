#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
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
echo -e "${BLUE}🐳 Subindo containers Docker (Banco, Backend, Frontend)...${NC}"
npm run docker:build
npm run docker:up

echo -e "${BLUE}⏳ Aguardando serviços ficarem prontos...${NC}"
sleep 15

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
