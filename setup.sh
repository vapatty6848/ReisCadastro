#!/bin/bash

echo "🚀 Iniciando setup automatizado do projeto Cadastro Integrantes Corporação..."

# Instalação de dependências
echo "📦 Instalando dependências em todos os módulos..."
npm run install:all

# Infraestrutura
echo "🐳 Subindo containers Docker (Banco, Backend, Frontend)..."
npm run docker:up

echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Banco de Dados
echo "🔄 Aplicando migrações do Prisma..."
npm run db:migrate

echo "🌱 Populando banco de dados (Seed)..."
npm run db:seed

echo "✅ Setup concluído com sucesso!"
echo "--------------------------------------------------"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo "Swagger:  http://localhost:3001/api-docs"
echo "--------------------------------------------------"
echo "Credenciais padrão: admin@corporacao.com / admin123"
