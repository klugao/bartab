# 🚀 Deploy Manual no Render - Passo a Passo Simples

Guia simplificado para fazer deploy manual do BarTab no Render (sem usar Blueprint/render.yaml).

## 📋 Ordem de Deploy

1. ✅ Banco de Dados (PostgreSQL)
2. ✅ Backend (Web Service)
3. ✅ Frontend (Static Site)

---

## 1️⃣ Criar Banco de Dados PostgreSQL

### Passo a Passo:

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"PostgreSQL"**
3. Preencha:
   - **Name**: `bartab-db`
   - **Database**: `pdv_dev`
   - **User**: `pdv`
   - **Region**: `Oregon` (ou sua região preferida)
   - **PostgreSQL Version**: `16`
   - **Instance Type**: `Free`

4. Clique em **"Create Database"**
5. Aguarde até o status ficar **"Available"** (1-2 minutos)

### ✅ Copiar Connection String:

Na página do banco, copie a **"Internal Database URL"**:
```
postgresql://pdv:senha@internal-host.render.com/pdv_dev
```

**💾 Salve essa URL! Você vai precisar no backend.**

---

## 2️⃣ Criar Backend (Web Service)

### Passo a Passo:

1. No Dashboard, clique em **"New +"** → **"Web Service"**
2. Clique em **"Connect a repository"** (se ainda não conectou)
3. Selecione seu repositório `bartab`

### Configurações Básicas:

| Campo | Valor |
|-------|-------|
| **Name** | `bartab-backend` |
| **Region** | `Oregon` (mesma do banco) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Instance Type** | `Free` |

### Adicionar Variáveis de Ambiente:

Clique em **"Advanced"** → **"Add Environment Variable"**

Adicione cada uma dessas:

```env
NODE_ENV=production
```

```env
DATABASE_URL=<Cole aqui a Internal Database URL do passo 1>
```

```env
JWT_SECRET=sua-chave-super-secreta-aqui-mude-isso
```

```env
PORT=10000
```

```env
CORS_ORIGIN=https://bartab-frontend.onrender.com
```
**(Você vai atualizar isso depois com a URL real)**

```env
FRONTEND_URL=https://bartab-frontend.onrender.com
```
**(Você vai atualizar isso depois com a URL real)**

```env
GOOGLE_CALLBACK_URL=https://bartab-backend.onrender.com/api/auth/google/callback
```
**(Você vai atualizar isso depois com a URL real)**

```env
SMTP_HOST=smtp.gmail.com
```

```env
SMTP_PORT=587
```

```env
SMTP_USER=seu-email@gmail.com
```

```env
SMTP_PASS=sua-senha-de-app-do-gmail
```
**⚠️ Use senha de aplicativo, não sua senha normal!**
Como criar: https://support.google.com/accounts/answer/185833

```env
SMTP_FROM=noreply@bartab.com
```

### (Opcional) Google OAuth:

Se quiser habilitar login com Google:

```env
GOOGLE_CLIENT_ID=seu-client-id-do-google-cloud
```

```env
GOOGLE_CLIENT_SECRET=seu-client-secret-do-google-cloud
```

### Criar o Serviço:

1. Clique em **"Create Web Service"**
2. O Render vai começar o build (5-10 minutos)
3. Aguarde até o status ficar **"Live"**

### ✅ Copiar URL do Backend:

Na página do serviço, copie a URL:
```
https://bartab-backend-xxxx.onrender.com
```

**💾 Salve essa URL! Você vai usar no frontend.**

---

## 3️⃣ Criar Frontend (Static Site)

### Passo a Passo:

1. No Dashboard, clique em **"New +"** → **"Static Site"**
2. Selecione seu repositório `bartab`

### Configurações Básicas:

| Campo | Valor |
|-------|-------|
| **Name** | `bartab-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Adicionar Variáveis de Ambiente:

```env
VITE_API_BASE_URL=<Cole aqui a URL do backend>/api
```

Exemplo:
```env
VITE_API_BASE_URL=https://bartab-backend-xxxx.onrender.com/api
```

```env
VITE_APP_TITLE=BarTab
```

### Criar o Site:

1. Clique em **"Create Static Site"**
2. O Render vai fazer o build (3-5 minutos)
3. Aguarde até o status ficar **"Live"**

### ✅ Copiar URL do Frontend:

```
https://bartab-frontend-xxxx.onrender.com
```

---

## 4️⃣ Atualizar URLs no Backend

Agora que você tem as URLs reais, volte ao backend e atualize:

1. Vá em **Dashboard** → **bartab-backend**
2. Clique em **"Environment"**
3. Edite estas variáveis:

```env
CORS_ORIGIN=https://bartab-frontend-xxxx.onrender.com
```
**(Use a URL real do seu frontend, SEM barra no final)**

```env
FRONTEND_URL=https://bartab-frontend-xxxx.onrender.com
```

```env
GOOGLE_CALLBACK_URL=https://bartab-backend-xxxx.onrender.com/api/auth/google/callback
```

4. Clique em **"Save Changes"**
5. O backend vai fazer redeploy automaticamente

---

## 5️⃣ Inicializar o Banco de Dados

### Executar Seed:

1. Vá em **bartab-backend** → **"Shell"**
2. Execute:
```bash
npm run seed
```

3. Você deve ver mensagens de sucesso criando usuário admin e dados iniciais

---

## 6️⃣ Testar o Deploy

### Testar Backend:

Abra no navegador:
```
https://bartab-backend-xxxx.onrender.com/api
```

Deve retornar algo como:
```json
{"status":"ok"}
```

### Testar Frontend:

Abra no navegador:
```
https://bartab-frontend-xxxx.onrender.com
```

Deve carregar a página de login do BarTab.

### Testar Login:

1. Tente fazer login com:
   - Email: `admin@bartab.com`
   - Senha: `admin123` (ou conforme seu seed)

2. Se funcionar, **parabéns! Deploy completo! 🎉**

---

## 🐛 Problemas Comuns

### Backend não inicia (sempre em "Deploying"):

1. Verifique os **Logs** do backend
2. Procure por erros como:
   - Erro de conexão com banco
   - Variáveis de ambiente faltando
   - Erro no build

### CORS Error no Frontend:

1. Verifique se `CORS_ORIGIN` no backend = URL exata do frontend
2. Não deve ter `/` no final
3. Deve ser HTTPS

### Frontend carrega mas não conecta ao backend:

1. Verifique se `VITE_API_BASE_URL` está correto
2. Deve incluir `/api` no final
3. Abra o Console do navegador (F12) para ver erros

### Banco não conecta:

1. Use a **Internal Database URL**, não External
2. Verifique se o banco está "Available"
3. Verifique se backend e banco estão na mesma região

---

## ✅ Checklist Final

- [ ] Banco de dados criado e "Available"
- [ ] Backend deployado e "Live"
- [ ] Frontend deployado e "Live"
- [ ] URLs atualizadas no backend
- [ ] Seed executado com sucesso
- [ ] Backend responde em `/api`
- [ ] Frontend carrega no navegador
- [ ] Login funciona
- [ ] Criar cliente funciona
- [ ] Criar comanda funciona

---

## 📝 Notas Importantes

### Free Tier:
- Backend entra em **sleep** após 15 min sem uso
- Primeiro acesso após sleep demora ~30 segundos
- PostgreSQL tem **1 GB** de storage

### Upgrade para Starter ($7/mês):
- Sem sleep
- Melhor performance
- Vale a pena para produção

### Deploy Automático:
- Sempre que você fizer `git push`, o Render faz deploy automaticamente
- Não precisa refazer nada manualmente

---

## 🔄 Próximos Deploys

Para atualizar o código:

```bash
git add .
git commit -m "Nova feature"
git push origin main
```

O Render detecta e faz deploy automaticamente! ✨

---

**🎉 Seu BarTab está no ar!**

URLs:
- Frontend: `https://seu-frontend.onrender.com`
- Backend: `https://seu-backend.onrender.com`
- Banco: Acessível apenas pelo backend

**💡 Dica**: Salve essas URLs e compartilhe com sua equipe!

