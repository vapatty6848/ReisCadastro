# 🔍 Guia Rápido - Resolver Erro de Login

## ⚠️ ERRO CORS (MAIS COMUM NO CODESPACES)

Se você ver no console do navegador:
```
CORS Missing Allow Origin
```

**Solução Rápida:**
```bash
chmod +x fix-cors.sh
./fix-cors.sh
```

Este script irá:
1. Configurar automaticamente CORS para o Codespaces
2. Reconstruir apenas o backend
3. Reiniciar os serviços

Aguarde ~10 segundos após o script terminar e tente fazer login novamente.

---

## Passo 1: Execute o Diagnóstico

```bash
chmod +x diagnose.sh
./diagnose.sh
```

Este script irá verificar:
- ✅ Status dos containers
- ✅ Se o usuário admin existe no banco
- ✅ Se o endpoint de login está respondendo

## Passo 2: Interpretando os Resultados

### ✅ Se o diagnóstico mostrar HTTP 200
O backend está funcionando! O problema pode ser:
- CORS ou comunicação frontend-backend
- Abra o DevTools (F12) no navegador e veja o Console

### ❌ Se mostrar "Erro ao acessar banco"
O banco não foi inicializado. Execute:
```bash
npm run db:migrate
npm run db:seed
```

### ❌ Se mostrar HTTP 401
O usuário existe mas a senha está errada. Recrie o usuário:
```bash
docker exec -it reis_backend_v2 npm run seed
```

### ❌ Se não houver resposta
O backend não está rodando. Reinicie:
```bash
./restart.sh
```

## Passo 3: Verificações no Navegador

1. Abra o DevTools (F12)
2. Vá para a aba **Console**
3. Tente fazer login
4. Procure por mensagens como:
   - `🌐 GitHub Codespaces detectado - Backend URL: ...`
   - `🔑 Tentando login...`
   - `✅ Login bem-sucedido!` ou `❌ Erro no login:`

## Passo 4: URLs Corretas no Codespaces

No GitHub Codespaces, as URLs devem ser:
- Frontend: `https://seu-codespace-3000.app.github.dev/`
- Backend: `https://seu-codespace-3001.app.github.dev/`

**NÃO use a porta 5434** (essa é do banco de dados).

## Credenciais

```
Email: admin@corporacao.com
Senha: admin123
```

## Comandos Úteis

```bash
# Ver logs do backend
docker logs reis_backend_v2 --tail 50

# Ver logs do frontend  
docker logs reis_frontend_v2 --tail 50

# Reiniciar tudo
./restart.sh

# Recriar usuário admin
docker exec -it reis_backend_v2 npm run seed
```
