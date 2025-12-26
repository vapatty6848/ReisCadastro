#!/bin/bash

echo "🚀 Iniciando setup do projeto Cadastro Integrantes Corporação..."

# Backend
echo "📦 Configurando Backend..."
cd backend
npm install
# npx prisma generate # Requer banco rodando ou skip-generate

# Frontend
echo "📦 Configurando Frontend..."
cd ../frontend
npm install

# Infra
echo "🐳 Subindo infraestrutura (Docker)..."
cd ../infra
docker-compose up -d

echo "⏳ Aguardando banco de dados ficar pronto..."
sleep 5

# Backend Migrations
echo "🔄 Executando migrações do banco de dados..."
cd ../backend
npx prisma migrate dev --name init
npx prisma db seed

echo "✅ Setup concluído!
Para rodar o backend: cd backend && npm run dev
Para rodar o frontend: cd frontend && npm run dev"
