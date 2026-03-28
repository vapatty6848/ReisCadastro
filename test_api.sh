#!/bin/bash

API_URL="http://localhost:3001/api"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@corporacao.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

echo "--- 0. Autenticação ---"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\", \"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -oP '"token":"\K[^"]+')

if [ -z "$TOKEN" ]; then
  echo "❌ Erro ao obter token. Verifique se o backend está rodando e o seed foi executado."
  exit 1
fi

echo "✅ Token obtido com sucesso."

echo -e "\n--- 1. Teste de Criação e Edição ---"
NEW_ID=$(curl -s -X POST "$API_URL/integrantes" \
  -H "Authorization: Bearer $TOKEN" \
  -F 'data={"nome":"Integrante Temporario","cpf":"99988877766","dataNascimento":"2010-01-01","telefone":"11999999999","tipoIntegrante":"CORPO_MUSICAL","dataMatricula":"2023-01-01","responsavel":{"nome":"Resp","cpf":"11122233344","telefone":"11000000000","parentesco":"Mãe"},"corporacao":{"nome":"Corporação","telefone":"11000000000"}}' | grep -oP '"id":"\K[^"]+' | head -n 1)

if [ -z "$NEW_ID" ]; then
  echo "❌ Erro ao criar integrante."
  exit 1
fi

echo "ID Criado: $NEW_ID"

curl -s -X PATCH "$API_URL/integrantes/$NEW_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -F 'data={"nome":"Integrante Teste Editado"}'

echo -e "\n\n--- 2. Teste de Erro: CPF Duplicado ---"
curl -s -X POST "$API_URL/integrantes" \
  -H "Authorization: Bearer $TOKEN" \
  -F 'data={"nome":"Outro Integrante","cpf":"99988877766","dataNascimento":"2010-01-01","telefone":"11999999999","turma":"A","tipoIntegrante":"CORPO_MUSICAL","dataMatricula":"2023-01-01","responsavel":{"nome":"Resp","cpf":"00000000000","telefone":"11000000000","parentesco":"Mãe"},"corporacao":{"nome":"Corporação","telefone":"11000000000"}}'

echo -e "\n\n--- 3. Teste de Listagem ---"
curl -s -X GET "$API_URL/integrantes" \
  -H "Authorization: Bearer $TOKEN" | cut -c 1-100

echo -e "\n\n--- 4. Teste de Exclusão ---"
curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/integrantes/$NEW_ID" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n--- 5. Teste de Mudança de Senha ---"
curl -s -X POST "$API_URL/auth/change-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"admin123","newPassword":"novaSenha123"}'

echo -e "\n\n--- 6. Teste de Login com Nova Senha ---"
NEW_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\", \"password\":\"novaSenha123\"}" | grep -oP '"token":"\K[^"]+')

if [ -n "$NEW_TOKEN" ]; then
  echo "✅ Login com nova senha funcionou!"
else
  echo "❌ Falha no login com nova senha"
fi
echo -e " (Status Code)"
