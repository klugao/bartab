# 🎨 Deploy do Frontend no Render - Guia Rápido

## ⚡ Tempo Total: ~5 minutos

---

## 📋 Pré-requisitos

- [ ] Backend já deployado e funcionando
- [ ] URL do backend: `https://bartab-backend-[seu-id].onrender.com`

---

## 🚀 Passo a Passo

### 1️⃣ Criar Static Site no Render (2 min)

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** (canto superior direito)
3. Selecione **"Static Site"**
4. Conecte seu repositório (se ainda não conectou):
   - Clique em **"Connect a repository"**
   - Autorize o GitHub
   - Selecione o repositório `bartab`

### 2️⃣ Configurar o Site (2 min)

Preencha os campos:

**Basic:**
- **Name:** `bartab-frontend`
- **Region:** `Oregon` (ou mesma do backend)
- **Branch:** `main`
- **Root Directory:** `frontend`

**Build & Deploy:**
- **Build Command:**
  ```
  npm install && npm run build
  ```
- **Publish Directory:**
  ```
  dist
  ```

### 3️⃣ Adicionar Variáveis de Ambiente (1 min)

Clique em **"Advanced"** para expandir.

Adicione as seguintes variáveis:

**VITE_API_BASE_URL**
```
https://bartab-backend-[SEU-ID].onrender.com/api
```
⚠️ **Importante:** Substitua `[SEU-ID]` pela URL real do seu backend!

**VITE_APP_TITLE**
```
BarTab
```

**Exemplo completo:**
```
VITE_API_BASE_URL=https://bartab-backend-xyz123.onrender.com/api
VITE_APP_TITLE=BarTab
```

### 4️⃣ Configurar Rewrites (Necessário para React Router)

Ainda em **"Advanced"**, role até **"Rewrite Rules"**.

Clique em **"Add Rule"** e adicione:

- **Source:** `/*`
- **Destination:** `/index.html`
- **Action:** `Rewrite`

Isso garante que todas as rotas do React Router funcionem.

### 5️⃣ Criar o Site

1. Clique em **"Create Static Site"**
2. Aguarde o build (~3-5 minutos) ⏱️
3. Status deve ficar **"Live"** (verde) ✅

---

## ✅ Verificar se Funcionou

### 1. Testar o Site

Após o deploy:
1. Clique na URL do site (algo como `https://bartab-frontend-xyz.onrender.com`)
2. Deve carregar a página de login ✅
3. Abra o Console (F12) → sem erros vermelhos ✅

### 2. Testar Login

**Credenciais padrão:**
- Email: `admin@bartab.com`
- Senha: `admin123`

Se conseguir fazer login → **✅ TUDO FUNCIONANDO!**

---

## 🔄 Atualizar URL do Backend nas Variáveis

Depois que o backend está rodando, você precisa:

1. **Copiar a URL real do backend:**
   - Vá no serviço `bartab-backend`
   - Copie a URL (ex: `https://bartab-backend-abc123.onrender.com`)

2. **Atualizar no frontend:**
   - Vá no serviço `bartab-frontend`
   - Menu lateral: **Environment**
   - Edite `VITE_API_BASE_URL`
   - Cole: `https://bartab-backend-abc123.onrender.com/api` (com `/api` no final!)
   - **Save Changes**
   - Aguarde redeploy (~2 min)

---

## 🔧 Troubleshooting

### ❌ Erro: "Build failed" com TypeScript

**Solução:** Teste o build localmente:
```bash
cd frontend
npm install
npm run build
```

Se der erro, corrija antes de tentar o deploy.

### ❌ Página carrega mas não faz login (erro 404/500)

**Causa:** URL do backend incorreta

**Verificar:**
1. Frontend → Environment → `VITE_API_BASE_URL`
2. Deve ter `/api` no final
3. Backend deve estar "Live" (verde)

**Testar backend:**
```bash
curl https://bartab-backend-[seu-id].onrender.com/api
```
Deve retornar JSON.

### ❌ Páginas internas dão 404 (ex: /dashboard)

**Causa:** Faltou configurar Rewrite Rules

**Solução:**
1. Frontend → Settings
2. Role até "Rewrite Rules"
3. Adicione: `/*` → `/index.html` (Rewrite)
4. Save

### ❌ Erro de CORS no Console

**Verificar no Backend:**
1. Backend → Environment
2. Confirme que `CORS_ORIGIN` tem a URL do frontend
3. Exemplo: `https://bartab-frontend-xyz.onrender.com`
4. Se estava errado, corrija e aguarde redeploy

---

## 📊 Configuração Final do Backend (CORS)

Após obter a URL do frontend, atualize o backend:

1. **No Render:** bartab-backend → Environment
2. **Edite:**
   - `CORS_ORIGIN` = `https://bartab-frontend-[seu-id].onrender.com`
   - `FRONTEND_URL` = `https://bartab-frontend-[seu-id].onrender.com`
3. **Save Changes**
4. Aguarde redeploy do backend

---

## ✅ Checklist Final

- [ ] Static Site criado no Render
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] Root Directory: `frontend`
- [ ] Variável `VITE_API_BASE_URL` configurada (com `/api` no final)
- [ ] Variável `VITE_APP_TITLE` configurada
- [ ] Rewrite Rule adicionada: `/*` → `/index.html`
- [ ] Deploy completou (Status: Live)
- [ ] Site abre no navegador
- [ ] Consegui fazer login
- [ ] CORS_ORIGIN atualizado no backend com URL do frontend

---

## 🎉 URLs Finais

Salve para referência:

**Frontend:**
```
https://bartab-frontend-____________.onrender.com
```

**Backend:**
```
https://bartab-backend-____________.onrender.com
```

**API:**
```
https://bartab-backend-____________.onrender.com/api
```

---

## 📱 Testando Funcionalidades

Após login, teste:

- [ ] Dashboard carrega
- [ ] Criar cliente funciona
- [ ] Criar item/produto funciona
- [ ] Abrir comanda funciona
- [ ] Adicionar item na comanda funciona
- [ ] Registrar pagamento funciona
- [ ] Fechar comanda funciona

---

## 💰 Custo

**Frontend (Static Site):** **GRÁTIS** e ilimitado! 🎉

O Render não cobra por static sites.

---

## 🔄 Deploys Futuros

Toda vez que você fizer `git push origin main`:
- ✅ Frontend faz redeploy automático
- ✅ Backend faz redeploy automático

**Tempo de deploy:**
- Frontend: ~2-3 minutos
- Backend: ~5 minutos

---

## 📞 Próximos Passos

1. [ ] Compartilhar URLs com equipe
2. [ ] Alterar senha do admin
3. [ ] Testar todas as funcionalidades
4. [ ] Adicionar domínio customizado (opcional)
5. [ ] Configurar alertas de erro no Render

---

**✅ Parabéns! Seu BarTab está completamente no ar!** 🎉🚀

