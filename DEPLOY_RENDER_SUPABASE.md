# 🚀 Deploy BarTab - Render + Supabase

Guia completo para fazer deploy do BarTab usando:
- 🗄️ **Supabase** para o banco de dados PostgreSQL
- 🔧 **Render** para o backend (API)
- 🎨 **Render** para o frontend (Static Site)

---

## 📋 Ordem de Deploy

1. ✅ Banco de Dados no Supabase
2. ✅ Backend no Render
3. ✅ Frontend no Render

---

## 1️⃣ Criar Banco de Dados no Supabase

### Passo 1: Criar Conta

1. Acesse: https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com GitHub (recomendado) ou email

### Passo 2: Criar Projeto

1. Clique em **"New Project"**
2. Preencha:
   - **Name**: `bartab` ou `bartab-prod`
   - **Database Password**: Crie uma senha forte (SALVE ESSA SENHA!)
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
   - **Pricing Plan**: Free

3. Clique em **"Create new project"**
4. Aguarde 1-2 minutos enquanto o Supabase provisiona o banco

### Passo 3: Obter Connection String

1. No painel do projeto, vá em **"Settings"** (ícone de engrenagem) → **"Database"**
2. Role até **"Connection string"**
3. Selecione **"URI"** (não Session Mode)
4. Copie a connection string:

```
postgresql://postgres:[SUA-SENHA]@db.xxxxx.supabase.co:5432/postgres
```

5. Substitua `[SUA-SENHA]` pela senha que você criou no Passo 2

**Exemplo:**
```
postgresql://postgres:MinhaSenh@123@db.abcdefgh.supabase.co:5432/postgres
```

### Passo 4: Configurar Connection Pooler (Recomendado)

Para melhor performance e evitar limite de conexões:

1. Na mesma página (**Settings** → **Database**)
2. Role até **"Connection Pooling"**
3. Copie a **"Connection string"** do pooler (porta 6543):

```
postgresql://postgres.[project-ref]:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**💡 Use esta URL do pooler no backend!**

### ✅ O que você precisa salvar:

- ✏️ **Database Password**: `_______________`
- ✏️ **Connection String (Pooler)**: `postgresql://postgres...`
- ✏️ **Project URL**: `https://xxxxx.supabase.co`

---

## 2️⃣ Criar Backend no Render

### Passo 1: Criar Web Service

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório `bartab`

### Passo 2: Configurar Serviço

| Campo | Valor |
|-------|-------|
| **Name** | `bartab-backend` |
| **Region** | `Oregon` (ou próxima da sua escolha) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Instance Type** | `Free` |

### Passo 3: Adicionar Variáveis de Ambiente

Clique em **"Advanced"** e adicione:

#### Banco de Dados (Supabase):
```env
DATABASE_URL=postgresql://postgres.[project-ref]:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```
**⚠️ Use a Connection String do Pooler do Supabase!**

#### Configurações Gerais:
```env
NODE_ENV=production
```

```env
PORT=10000
```

#### JWT (Gere uma chave forte):
```env
JWT_SECRET=cole-aqui-uma-chave-super-secreta-de-32-caracteres-ou-mais
```

**💡 Para gerar uma chave segura:**
```bash
# No terminal local (Mac/Linux):
openssl rand -base64 32

# Ou use: https://generate-secret.vercel.app/32
```

#### URLs (Atualize depois):
```env
CORS_ORIGIN=https://bartab-frontend.onrender.com
```

```env
FRONTEND_URL=https://bartab-frontend.onrender.com
```

```env
GOOGLE_CALLBACK_URL=https://bartab-backend.onrender.com/api/auth/google/callback
```

#### SMTP (Email):
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
**⚠️ Use senha de aplicativo:** https://support.google.com/accounts/answer/185833

```env
SMTP_FROM=noreply@bartab.com
```

#### Google OAuth (Opcional):
```env
GOOGLE_CLIENT_ID=seu-google-client-id
```

```env
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

### Passo 4: Criar e Aguardar Deploy

1. Clique em **"Create Web Service"**
2. O Render vai fazer o build (5-10 minutos no primeiro deploy)
3. Aguarde até o status ficar **"Live"** (bolinha verde)

### ✅ Copiar URL do Backend:

Exemplo: `https://bartab-backend.onrender.com`

**💾 Salve essa URL!**

---

## 3️⃣ Executar Migrations/Seed no Banco

### Opção A: Via Shell do Render (Recomendado)

1. No dashboard do **bartab-backend**, clique em **"Shell"**
2. Execute o seed:

```bash
npm run seed
```

3. Você deve ver mensagens de sucesso criando tabelas e dados iniciais

### Opção B: Via Supabase SQL Editor

1. No Supabase, vá em **"SQL Editor"**
2. Clique em **"New query"**
3. Cole o conteúdo do arquivo `docs/seed.sql` (se existir)
4. Clique em **"Run"**

### Opção C: Via psql Local

```bash
# No terminal local
psql "postgresql://postgres.[ref]:[senha]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"

# Depois dentro do psql, execute as migrations manualmente
```

### ✅ Verificar se deu certo:

No **Supabase Dashboard**:
1. Vá em **"Table Editor"**
2. Você deve ver tabelas como: `users`, `customers`, `tabs`, `items`, etc.

---

## 4️⃣ Criar Frontend no Render

### Passo 1: Criar Static Site

1. No Render Dashboard, clique em **"New +"** → **"Static Site"**
2. Selecione seu repositório `bartab`

### Passo 2: Configurar Site

| Campo | Valor |
|-------|-------|
| **Name** | `bartab-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Passo 3: Adicionar Variáveis de Ambiente

```env
VITE_API_BASE_URL=https://bartab-backend.onrender.com/api
```
**⚠️ Substitua pela URL real do seu backend**

```env
VITE_APP_TITLE=BarTab
```

### Passo 4: Criar e Aguardar Deploy

1. Clique em **"Create Static Site"**
2. Aguarde o build (3-5 minutos)
3. Status deve ficar **"Live"**

### ✅ Copiar URL do Frontend:

Exemplo: `https://bartab-frontend.onrender.com`

---

## 5️⃣ Atualizar URLs no Backend

Agora que você tem as URLs reais, volte ao backend:

1. Dashboard → **bartab-backend** → **"Environment"**
2. Edite estas variáveis com as URLs REAIS:

```env
CORS_ORIGIN=https://bartab-frontend-xxxx.onrender.com
```
**⚠️ Sem `/` no final!**

```env
FRONTEND_URL=https://bartab-frontend-xxxx.onrender.com
```

```env
GOOGLE_CALLBACK_URL=https://bartab-backend-xxxx.onrender.com/api/auth/google/callback
```

3. Clique em **"Save Changes"**
4. O backend vai fazer redeploy automático (1-2 min)

---

## 6️⃣ Testar o Deploy

### ✅ Testar Backend:

Abra no navegador:
```
https://bartab-backend-xxxx.onrender.com/api
```

Deve retornar algo como:
```json
{"status":"ok","timestamp":"2025-11-02T..."}
```

### ✅ Testar Frontend:

Abra no navegador:
```
https://bartab-frontend-xxxx.onrender.com
```

Deve carregar a tela de login do BarTab!

### ✅ Testar Banco (via Supabase):

1. No Supabase, vá em **"Table Editor"**
2. Clique na tabela `users`
3. Você deve ver o usuário admin criado pelo seed

### ✅ Testar Login:

1. Na tela de login, use:
   - **Email**: `admin@bartab.com`
   - **Senha**: `admin123` (ou conforme seu seed)

2. Se logar com sucesso: **🎉 Deploy completo!**

---

## 🔐 Configurar Google OAuth (Opcional)

Se quiser habilitar login com Google:

### 1. Google Cloud Console

1. Acesse: https://console.cloud.google.com
2. Crie um projeto ou selecione existente
3. Vá em **APIs & Services** → **Credentials**
4. Crie **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Name: `BarTab Production`

5. **Authorized JavaScript origins**:
   ```
   https://bartab-frontend-xxxx.onrender.com
   https://bartab-backend-xxxx.onrender.com
   ```

6. **Authorized redirect URIs**:
   ```
   https://bartab-backend-xxxx.onrender.com/api/auth/google/callback
   ```

7. Copie **Client ID** e **Client Secret**

### 2. Adicionar no Backend (Render)

1. Vá em **bartab-backend** → **Environment**
2. Adicione/edite:
   ```env
   GOOGLE_CLIENT_ID=seu-client-id
   GOOGLE_CLIENT_SECRET=seu-client-secret
   ```

3. Salve e aguarde redeploy

---

## 🗄️ Gerenciar Banco no Supabase

### Ver Dados:

1. **Table Editor**: Interface visual para ver/editar tabelas
2. **SQL Editor**: Executar queries SQL
3. **Database**: Ver estatísticas e configurações

### Fazer Backup:

1. **Settings** → **Database** → **Backups**
2. No free tier: backups automáticos diários por 7 dias
3. Você pode fazer backup manual via **SQL Editor**:

```sql
-- Exemplo: exportar usuários
SELECT * FROM users;
```

### Monitorar Uso:

1. **Settings** → **Billing**
2. Ver uso de:
   - Database size
   - Bandwidth
   - API requests

### Limites do Free Tier:

- ✅ 500 MB de storage
- ✅ 2 GB de transferência/mês
- ✅ 50 MB de file storage
- ✅ Ilimitadas API requests (com rate limit)

---

## 🐛 Troubleshooting

### Backend não conecta ao Supabase:

**Erro comum**: `connection refused` ou `timeout`

**Solução**:
1. Verifique se usou a **Connection Pooler URL** (porta 6543)
2. Verifique se a senha está correta (sem caracteres especiais estranhos)
3. Teste a conexão localmente:
   ```bash
   psql "sua-connection-string-aqui"
   ```

### Erro: "too many connections"

**Solução**: Use o Connection Pooler (porta 6543) ao invés da conexão direta (porta 5432)

### CORS Error:

**Solução**:
1. `CORS_ORIGIN` deve ser exatamente a URL do frontend
2. Sem `/` no final
3. Protocolo HTTPS

### Frontend carrega mas não conecta:

**Solução**:
1. Abra DevTools (F12) → Console
2. Veja o erro de rede
3. Verifique se `VITE_API_BASE_URL` está correto
4. Deve incluir `/api` no final

---

## 📊 Monitoramento

### Logs do Backend (Render):

1. **bartab-backend** → **Logs**
2. Visualize em tempo real
3. Filtre por "error" ou "warn"

### Métricas do Banco (Supabase):

1. **Reports** → **Database**
2. Ver:
   - Connection count
   - Query performance
   - Storage usage

### Uptime:

- Supabase: Sempre disponível (não entra em sleep)
- Render Free: Entra em sleep após 15 min (primeiro acesso demora ~30s)

---

## 💰 Custos

### Free Tier (R$ 0/mês):

| Serviço | Plano | Limitações |
|---------|-------|------------|
| Supabase | Free | 500 MB database, sem sleep |
| Render Backend | Free | Sleep após 15 min inativo |
| Render Frontend | Free | Sempre disponível, ilimitado |

**Total**: **Grátis!** ✨

### Upgrade Recomendado (R$ ~40/mês):

| Serviço | Plano | Custo | Benefício |
|---------|-------|-------|-----------|
| Supabase | Pro | $25/mês | 8 GB database, backups maiores |
| Render Backend | Starter | $7/mês | Sem sleep, melhor performance |
| Render Frontend | Free | $0 | Suficiente |

**Total**: ~$32/mês (~R$ 160/mês)

---

## ✅ Checklist Final

### Supabase:
- [ ] Projeto criado
- [ ] Connection String salva
- [ ] Pooler configurado
- [ ] Seed executado
- [ ] Tabelas visíveis no Table Editor

### Backend (Render):
- [ ] Serviço criado e "Live"
- [ ] DATABASE_URL configurado (Supabase)
- [ ] Todas variáveis de ambiente configuradas
- [ ] URL do backend copiada
- [ ] Endpoint `/api` responde

### Frontend (Render):
- [ ] Site criado e "Live"
- [ ] VITE_API_BASE_URL configurado
- [ ] URL do frontend copiada
- [ ] Site carrega no navegador

### Integração:
- [ ] CORS_ORIGIN atualizado no backend
- [ ] Login funciona
- [ ] Criar cliente funciona
- [ ] Criar comanda funciona
- [ ] Dados aparecem no Supabase Table Editor

---

## 🎯 Vantagens desta Stack

✅ **Totalmente gratuito** para começar
✅ **Deploy automático** via Git push
✅ **Banco sempre disponível** (Supabase não dorme)
✅ **Dashboard visual** para gerenciar dados
✅ **Escalável** (fácil fazer upgrade depois)
✅ **SSL/HTTPS** incluído
✅ **Backups automáticos**
✅ **Fácil de manter**

---

## 🔄 Próximas Atualizações

Para fazer deploy de novas versões:

```bash
git add .
git commit -m "Nova funcionalidade"
git push origin main
```

O Render detecta automaticamente e faz deploy! ✨

O banco no Supabase continua intacto (dados não são perdidos).

---

## 📚 Links Úteis

- [Supabase Dashboard](https://app.supabase.com)
- [Render Dashboard](https://dashboard.render.com)
- [Supabase Docs](https://supabase.com/docs)
- [Render Docs](https://render.com/docs)

---

**🎉 Seu BarTab está no ar com Supabase + Render!**

**URLs**:
- 🎨 Frontend: `https://bartab-frontend-xxxx.onrender.com`
- 🔧 Backend: `https://bartab-backend-xxxx.onrender.com`
- 🗄️ Database: Supabase Dashboard

**💡 Salve essas URLs e compartilhe com sua equipe!**

