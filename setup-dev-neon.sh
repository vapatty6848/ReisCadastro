#!/bin/bash

# Script para configurar ambiente de desenvolvimento com Neon
# Uso: ./setup-dev-neon.sh [connection-string]

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Configurando ambiente de desenvolvimento com Neon...${NC}"

# Verificar se foi passada uma connection string
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Erro: Connection string do Neon é obrigatória${NC}"
    echo "Uso: $0 'postgresql://user:password@host/database?sslmode=require'"
    echo ""
    echo "Para obter a connection string:"
    echo "1. Acesse https://console.neon.tech"
    echo "2. Selecione seu projeto"
    echo "3. Vá em 'Connection Details'"
    echo "4. Copie a string no formato PostgreSQL"
    exit 1
fi

NEON_URL="$1"

# Verificar se o diretório backend existe
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Erro: Execute este script da raiz do projeto${NC}"
    exit 1
fi

echo -e "${BLUE}📝 Configurando variáveis de ambiente...${NC}"

# Criar .env.development se não existir
if [ ! -f "backend/.env.development" ]; then
    cat > backend/.env.development << EOF
PORT=3001
DATABASE_URL="${NEON_URL}"
JWT_SECRET="dev_secret_key_$(openssl rand -hex 16)"
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ Arquivo backend/.env.development criado${NC}"
else
    echo -e "${BLUE}⚠️  Arquivo backend/.env.development já existe. Verifique se precisa atualizar a DATABASE_URL${NC}"
fi

echo -e "${BLUE}🔄 Executando migrações no Neon...${NC}"
cd backend
npx dotenv -e .env.development -- prisma migrate deploy

echo -e "${BLUE}🌱 Populando banco de dados...${NC}"
npx dotenv -e .env.development -- prisma db seed

cd ..

echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo ""
echo -e "${BLUE}Para iniciar o desenvolvimento:${NC}"
echo "  npm run dev:backend    # Backend"
echo "  npm run dev:frontend   # Frontend (em outro terminal)"
echo "  # ou"
echo "  npm run dev            # Ambos simultaneamente"
echo ""
echo -e "${BLUE}URLs de desenvolvimento:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Swagger:  http://localhost:3001/api-docs"
