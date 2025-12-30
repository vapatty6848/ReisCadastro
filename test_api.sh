#!/bin/bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YjMzMzA4Ny0yZGRjLTQ2MmQtYTA3ZC1lZjg1ZjY2NmE3OTYiLCJpYXQiOjE3NjY1MTY4MzEsImV4cCI6MTc2NjYwMzIzMX0.KMPPRhADjq59uWLBU8ajoSfTBXpUquiYgvhrincnIug"
ID="e6151113-ead7-4421-aeb7-abf27b58f122"

echo "--- 1. Teste de Edição (Update) ---"
# Criar um novo para garantir que o ID existe (já que o anterior foi deletado no teste 4)
NEW_ID=$(curl -s -X POST http://localhost:3001/api/integrantes \
  -H "Authorization: Bearer $TOKEN" \
  -F 'data={"nome":"Integrante Temporario","cpf":"99988877766","dataNascimento":"2010-01-01","telefone":"11999999999","turma":"A","tipoIntegrante":"CORPO_MUSICAL","dataMatricula":"2023-01-01","responsavel":{"nome":"Resp","cpf":"11122233344","telefone":"11000000000","parentesco":"Mãe"},"corporacao":{"nome":"Corporação","telefone":"11000000000"}}' | grep -oP '"id":"\K[^"]+')

echo "ID Criado: $NEW_ID"

curl -s -X PATCH "http://localhost:3001/api/integrantes/$NEW_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -F 'data={"nome":"Integrante Teste Editado"}'

echo -e "\n\n--- 2. Teste de Erro: CPF Duplicado ---"
curl -s -X POST http://localhost:3001/api/integrantes \
  -H "Authorization: Bearer $TOKEN" \
  -F 'data={"nome":"Outro Integrante","cpf":"99988877766","dataNascimento":"2010-01-01","telefone":"11999999999","turma":"A","tipoIntegrante":"CORPO_MUSICAL","dataMatricula":"2023-01-01","responsavel":{"nome":"Resp","cpf":"00000000000","telefone":"11000000000","parentesco":"Mãe"},"corporacao":{"nome":"Corporação","telefone":"11000000000"}}'

echo -e "\n\n--- 3. Teste de Listagem (List) ---"
curl -s -X GET http://localhost:3001/api/integrantes \
  -H "Authorization: Bearer $TOKEN" | cut -c 1-100

echo -e "\n\n--- 4. Teste de Exclusão (Delete) ---"
curl -s -o /dev/null -w "%{http_code}" -X DELETE "http://localhost:3001/api/integrantes/$NEW_ID" \
  -H "Authorization: Bearer $TOKEN"
echo -e " (Status Code)"
