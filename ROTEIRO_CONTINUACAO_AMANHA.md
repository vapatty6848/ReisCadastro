# 📋 Roteiro de Continuação: Finalização do Deploy (20/01/2026)

Este roteiro foca na mudança do domínio da API para `api.vaniapatricia.cloud`, resolvendo os problemas de DNS e o erro 403 Forbidden encontrados hoje.

---

## 🛠️ PASSO 1: Configuração no CyberPanel (Navegador)

1.  **Criar o Novo Site:**
    - Acesse o CyberPanel (`https://76.13.69.213:8090`).
    - Vá em **Websites** -> **Create Website**.
    - **Domain Name:** `api.vaniapatricia.cloud`.
    - **Select PHP:** Escolha PHP 8.1 ou 8.2.
    - Clique em **Create Website**.

2.  **Emitir SSL (HTTPS):**
    - Vá em **Websites** -> **List Websites** -> **Manage** (do site api.vaniapatricia.cloud).
    - Clique em **Issue SSL**. Isso garantirá que o cadeado apareça.

3.  **Configurar a "Ponte" (External App):**
    - No mesmo menu **Manage**, clique em **vHost Conf**.
    - Role até o final do texto e cole este bloco:

    ```text
    extprocessor backend-node {
      type                    proxy
      address                 127.0.0.1:3001
      maxConns                100
      pcKeepAliveTimeout      60
      initTimeout             60
      retryTimeout            0
      respBuffer              0
    }
    ```

    - Clique em **Save**.

4.  **Configurar o Redirecionamento (Rewrite Rules):**
    - No menu **Manage**, clique em **Rewrite Rules**.
    - Apague tudo e cole:

    ```htaccess
    RewriteEngine On
    RewriteCond %{HTTPS} !=on
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Envia tudo para o Node.js na porta 3001 usando o nome configurado acima
    RewriteRule ^(.*)$ http://backend-node/$1 [P,L]
    ```

    - Clique em **Save Rewrite Rules**.

---

## 💻 PASSO 2: Comandos no Terminal (SSH)

1.  **Reiniciar o Servidor Web:**

    ```bash
    systemctl restart lsws
    ```

2.  **Garantir que o Backend (Node.js) está rodando:**

    ```bash
    pm2 restart backend-reis
    # Verifique se o status é 'online'
    pm2 status
    ```

3.  **Teste de Prova Real (Interno):**
    ```bash
    curl -I https://api.vaniapatricia.cloud/api/health
    ```
    _Deverá retornar `HTTP/1.1 200 OK`._

---

## 🌍 PASSO 3: DNS na Hostinger (Se necessário)

- Vá ao painel de DNS da Hostinger para o domínio **vaniapatricia.cloud**.
- Verifique se existe um registro tipo **A**, nome **api**, apontando para o IP **76.13.69.213**.
- Se não existir, adicione-o.

---

## 🎨 PASSO 4: Vercel (Frontend)

1.  Acesse o painel da **Vercel**.
2.  Vá em **Settings** -> **Environment Variables**.
3.  Edite a variável `NEXT_PUBLIC_API_URL` para: `https://api.vaniapatricia.cloud`.
4.  Vá na aba **Deployments** do seu projeto.
5.  Clique nos três pontinhos (`...`) do deploy mais recente e escolha **Redeploy**.

---

## ✅ CHECKLIST FINAL

- [ ] Abrir [https://api.vaniapatricia.cloud/api/health](https://api.vaniapatricia.cloud/api/health) e ver o JSON.
- [ ] Abrir o site da Vercel e tentar fazer Login.
- [ ] Verificar se as fotos estão carregando por HTTPS.

---

_Assinado: GitHub Copilot (Gemini 3 Flash)_
Otimizando a seleção de ferramentas...

3 tarefas pendentes criadas

Leitura [](file:///home/patricia/ReisCadastro/ROTEIRO_DEPLOY_AMANHA.md#1-1), linhas 1 para 50

Leitura [](file:///home/patricia/ReisCadastro/infra/docker-compose.yml#1-1), linhas 1 para 50

Leia [](file:///home/patricia/ReisCadastro/backend/src/app.ts)

Leitura [](file:///home/patricia/ReisCadastro/ROTEIRO_CONTINUACAO_AMANHA.md#1-1), linhas 1 para 100

Para usar o domínio do seu cliente, você precisará seguir um processo muito parecido com o que foi planejado para o seu próprio domínio (`vaniapatricia.cloud`), mas com foco na infraestrutura do cliente.

Aqui estão os passos principais:

### 1. Configuração de DNS (No painel onde o cliente comprou o domínio)
O cliente (ou você, com acesso ao painel dele) precisará criar registros apontando para o seu servidor:
- **Para a API:** Criar um registro tipo `A` (ex: `api.dominiodocliente.com`) apontando para o IP do seu servidor: `76.13.69.213`.
- **Para o Frontend:** Se o frontend for ficar no domínio principal (`www.dominiodocliente.com`), você precisará configurar o CNAME ou registros A conforme as instruções da Vercel.

### 2. No Servidor (CyberPanel)
Você precisa avisar ao servidor que ele agora deve responder também pelo novo domínio:
1.  **Criar o Website:** No CyberPanel, vá em `Websites` -> `Create Website` e use o domínio do cliente (ex: `api.dominiodocliente.com`).
2.  **Configurar SSL:** Emita o certificado SSL para esse novo domínio no CyberPanel para garantir o `https`.
3.  **Configurar o vHost:** Repita a configuração do **Passo 1.3** do seu ROTEIRO_CONTINUACAO_AMANHA.md, colando o bloco `extprocessor` para que o CyberPanel saiba que deve enviar as requisições para a porta `3001`.
4.  **Rewrite Rules:** No menu do novo site, cole as regras de redirecionamento para enviar o tráfego para o processo Node.js.

### 3. No Frontend (Vercel)
Se você estiver usando a Vercel para o frontend:
1.  Vá em **Settings** -> **Domains** e adicione o domínio do cliente.
2.  Siga as instruções da Vercel para validar o domínio (geralmente adicionar um registro CNAME ou A no DNS do cliente).
3.  **Variável de Ambiente:** Em **Settings** -> **Environment Variables**, mude a `NEXT_PUBLIC_API_URL` para `https://api.dominiodocliente.com`.
4.  Faça um **Redeploy** para que o frontend passe a conversar com a nova URL da API.

### 4. No Backend (CORS)
Atualmente, seu backend está configurado para aceitar qualquer origem (`origin: true` em app.ts), então ele funcionará automaticamente com o novo domínio. No futuro, por segurança, você poderá restringir apenas para os domínios do cliente.

**Resumo:** O trabalho maior é no **DNS do cliente** e na criação do **novo site no seu CyberPanel** para "escutar" esse domínio e repassar para a sua aplicação que já está rodando na porta 3001.
atty, como você já tem uma VPS (1188787), o caminho é fazer deploy nela (é sua “nuvem” com acesso root).

    Acesse por SSH e vá para a pasta do site (CyberPanel):
Auth.Hostinger@#6848
ssh root@76.13.69.213
cd /home/vaniapatricia.cloud/public_html

    Clone o repositório e instale dependências:

git --version
git clone <URL_DO_SEU_REPO> .
node -vls

npm -v
npm install

    Suba o Node como serviço (PM2) e habilite no boot:

npm install -g pm2
pm2 start &lt;arquivo_entrada.js&gt; --name api
pm2 save
pm2 startup

    Publique no domínio via proxy (Nginx/OpenLiteSpeed do CyberPanel): sua API deve rodar em uma porta (ex. 3000) e o painel deve encaminhar vaniapatricia.cloud para http://127.0.0.1:3000.

Me diga: qual é a URL do repositório e qual é o arquivo de entrada (server.js, app.js?) e a porta que sua API usa, que eu te passo os comandos exatos para o seu caso no CyberPanel.
s
