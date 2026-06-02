#!/bin/bash

# ============================================================
# test_api.sh — Testa os principais endpoints da API local
# Uso: ./test_api.sh [email] [senha]
# Exemplo: ./test_api.sh admin@corporacao.com admin123
# ============================================================

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="http://localhost:3001/api"
ADMIN_EMAIL="${1:-admin@corporacao.com}"
ADMIN_PASSWORD="${2:-admin123}"
AUTO_SETUP="${AUTO_SETUP:-1}"

PASS=0
FAIL=0
NEW_ID=""

# --- Helpers ---
ok()   { echo -e "  ${GREEN}✅ $1${NC}"; PASS=$((PASS+1)); }
fail() { echo -e "  ${RED}❌ $1${NC}"; FAIL=$((FAIL+1)); }
header() { echo -e "\n${BLUE}--- $1 ---${NC}"; }

# --- Cleanup automático ao sair ---
cleanup() {
  if [[ -n "$NEW_ID" ]]; then
    header "Limpeza: removendo integrante de teste"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/integrantes/$NEW_ID" \
      -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "000")
    [[ "$STATUS" == "204" || "$STATUS" == "200" ]] && ok "Integrante de teste removido" || fail "Não foi possível remover integrante ($STATUS)"
  fi
  echo ""
  echo -e "${BLUE}Resultado: ${GREEN}$PASS passou(aram)${NC}  ${RED}$FAIL falhou(aram)${NC}"
  echo "--------------------------------------------------"
}
trap cleanup EXIT

# --- Verificar se backend está no ar ---
header "0. Health Check"
if curl -sf "$API_URL/health" >/dev/null 2>&1; then
  ok "Backend respondendo em $API_URL"
else
  if [[ "$AUTO_SETUP" == "1" ]]; then
    echo -e "  ${YELLOW}⚠️ Backend indisponível. Tentando preparar ambiente automaticamente...${NC}"
    if npm run setup -- --skip-install; then
      if curl -sf "$API_URL/health" >/dev/null 2>&1; then
        ok "Backend respondeu após setup automático"
      else
        fail "Backend ainda indisponível após setup automático"
        exit 1
      fi
    else
      fail "Falha no setup automático"
      exit 1
    fi
  else
    fail "Backend não está respondendo. Rode: npm run setup"
    exit 1
  fi
fi

# --- Autenticação ---
header "1. Autenticação"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\", \"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -oP '"token":"\K[^"]+' || true)

if [[ -z "$TOKEN" ]]; then
  fail "Login falhou. Verifique credenciais ou se o seed foi executado"
  exit 1
fi
ok "Login bem-sucedido (token obtido)"

# --- Corporações ---
header "2. Corporações"
CORP_RESPONSE=$(curl -s "$API_URL/corporacoes" -H "Authorization: Bearer $TOKEN")
CORP_COUNT=$(echo "$CORP_RESPONSE" | grep -o '"id"' | wc -l | tr -d ' ')
if [[ "$CORP_COUNT" -ge 4 ]]; then
  ok "$CORP_COUNT corporação(ões) predefinidas encontradas"
else
  fail "Esperava ≥4 corporações, encontrou $CORP_COUNT"
fi

# --- Criar integrante ---
header "3. Criação de integrante"
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/integrantes" \
  -H "Authorization: Bearer $TOKEN" \
  -F 'data={"nome":"Integrante Teste API","documento":"99988877766","documentoTipo":"CIN","dataNascimento":"2010-01-01","telefone":"11999999999","tipoIntegrante":"CORPO_MUSICAL","dataMatricula":"2023-01-01","responsavel":{"nome":"Responsavel Teste","cin":"11122233344","telefone":"11000000000","parentesco":"Mãe"},"corporacao":{"nome":"EM Dr Getúlio Vargas"}}')

HTTP_STATUS=$(echo "$CREATE_RESPONSE" | tail -n1)
CREATE_BODY=$(echo "$CREATE_RESPONSE" | head -n-1)
NEW_ID=$(echo "$CREATE_BODY" | grep -oP '"id":"\K[^"]+' | head -n1 || true)

if [[ "$HTTP_STATUS" == "201" && -n "$NEW_ID" ]]; then
  ok "Integrante criado (ID: $NEW_ID)"
else
  fail "Criação falhou — HTTP $HTTP_STATUS"
fi

# --- Editar integrante ---
header "4. Edição de integrante"
if [[ -n "$NEW_ID" ]]; then
  EDIT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$API_URL/integrantes/$NEW_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -F 'data={"nome":"Integrante Teste API Editado"}')
  [[ "$EDIT_STATUS" == "200" ]] && ok "Edição bem-sucedida" || fail "Edição falhou — HTTP $EDIT_STATUS"
else
  fail "Pulando edição (sem ID)"
fi

# --- Listagem ---
header "5. Listagem de integrantes"
LIST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/integrantes" \
  -H "Authorization: Bearer $TOKEN")
[[ "$LIST_STATUS" == "200" ]] && ok "Listagem OK" || fail "Listagem falhou — HTTP $LIST_STATUS"

# --- Estatísticas ---
header "6. Estatísticas"
STATS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/stats" \
  -H "Authorization: Bearer $TOKEN")
[[ "$STATS_STATUS" == "200" ]] && ok "Stats OK" || fail "Stats falhou — HTTP $STATS_STATUS"

# (cleanup automático via trap remove o integrante de teste)
