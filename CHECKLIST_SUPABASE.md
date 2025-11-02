# ✅ Checklist Deploy - Supabase + Render

Marque cada item conforme completa. Tempo total: ~20 minutos.

---

## 🗄️ Parte 1: Supabase (5 min)

### Criar Projeto
- [ ] Acessar https://supabase.com
- [ ] Fazer login (GitHub recomendado)
- [ ] Clicar em "New Project"
- [ ] Preencher:
  - [ ] Name: `bartab`
  - [ ] Password: `__________________` (salvar!)
  - [ ] Region: South America (São Paulo)
- [ ] Aguardar provisionamento (1-2 min)

### Obter Connection String
- [ ] **Settings** → **Database**
- [ ] Rolar até "Connection Pooling"
- [ ] Copiar URI (porta 6543):
  ```
  postgresql://postgres.[ref]:[senha]@...pooler.supabase.com:6543/postgres
  ```
- [ ] Substituir `[senha]` pela senha real
- [ ] Salvar URL: `_________________________________`
postgresql://postgres:tcc123!@db.trzpxzqjdxyttxfudpqv.supabase.co:5432/postgres

---

## 🔧 Parte 2: Backend no Render (10 min)
    
### Criar Serviço
- [ ] Acessar https://dashboard.render.com
- [ ] **New +** → **Web Service**
- [ ] Conectar repositório `bartab`
- [ ] Configurar:
  - [ ] Name: `bartab-backend`
  - [ ] Region: Oregon
  - [ ] Branch: `main`
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Start Command: `npm run start:prod`

### Variáveis de Ambiente
Clicar em "Advanced", adicionar cada uma:

#### Essenciais:
- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = `[URL do Supabase]`
- [ ] `JWT_SECRET` = `[gerar: openssl rand -base64 32]`
- [ ] `PORT` = `10000`

#### URLs (temporárias, atualizar depois):
- [ ] `CORS_ORIGIN` = `https://bartab-frontend.onrender.com`
- [ ] `FRONTEND_URL` = `https://bartab-frontend.onrender.com`
- [ ] `GOOGLE_CALLBACK_URL` = `https://bartab-backend.onrender.com/api/auth/google/callback`

#### SMTP:
- [ ] `SMTP_HOST` = `smtp.gmail.com`
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_USER` = `_________________@gmail.com`
- [ ] `SMTP_PASS` = `________________` (senha de app)
- [ ] `SMTP_FROM` = `noreply@bartab.com`

#### OAuth (opcional):
- [ ] `GOOGLE_CLIENT_ID` = `________________`
- [ ] `GOOGLE_CLIENT_SECRET` = `________________`

### Deploy
- [ ] Clicar em "Create Web Service"
- [ ] Aguardar build (5-10 min)
- [ ] Status "Live" ✅
- [ ] Copiar URL: `https://bartab-backend-________.onrender.com`

### Seed
- [ ] Ir na aba "Shell"
- [ ] Executar: `npm run seed`
- [ ] Ver mensagens de sucesso ✅

---

## 🎨 Parte 3: Frontend no Render (5 min)

### Criar Site
- [ ] **New +** → **Static Site**
- [ ] Selecionar repositório `bartab`
- [ ] Configurar:
  - [ ] Name: `bartab-frontend`
  - [ ] Branch: `main`
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Publish Directory: `dist`

### Variáveis de Ambiente
- [ ] `VITE_API_BASE_URL` = `https://bartab-backend-_______.onrender.com/api`
- [ ] `VITE_APP_TITLE` = `BarTab`

### Deploy
- [ ] Clicar em "Create Static Site"
- [ ] Aguardar build (3-5 min)
- [ ] Status "Live" ✅
- [ ] Copiar URL: `https://bartab-frontend-________.onrender.com`

---

## 🔄 Parte 4: Atualizar URLs (2 min)

### No Backend (Render)
- [ ] Ir em **bartab-backend** → **Environment**
- [ ] Editar com URLs reais:
  - [ ] `CORS_ORIGIN` = `https://bartab-frontend-[real].onrender.com`
  - [ ] `FRONTEND_URL` = `https://bartab-frontend-[real].onrender.com`
  - [ ] `GOOGLE_CALLBACK_URL` = `https://bartab-backend-[real].onrender.com/api/auth/google/callback`
- [ ] Salvar
- [ ] Aguardar redeploy (1-2 min)

---

## ✅ Parte 5: Testar

### Backend API
- [ ] Abrir: `https://bartab-backend-_______.onrender.com/api`
- [ ] Deve retornar JSON (status ok) ✅

### Frontend
- [ ] Abrir: `https://bartab-frontend-_______.onrender.com`
- [ ] Página de login carrega ✅
- [ ] Sem erros no console (F12) ✅

### Banco de Dados
- [ ] Supabase → **Table Editor**
- [ ] Ver tabela `users` ✅
- [ ] Ver usuário `admin@bartab.com` ✅

### Login
- [ ] Email: `admin@bartab.com`
- [ ] Senha: `admin123`
- [ ] Login com sucesso ✅
- [ ] Dashboard carrega ✅

### Funcionalidades
- [ ] Criar cliente funciona ✅
- [ ] Criar item/produto funciona ✅
- [ ] Abrir comanda funciona ✅
- [ ] Adicionar item na comanda funciona ✅
- [ ] Registrar pagamento funciona ✅
- [ ] Dados aparecem no Supabase ✅

---

## 🎉 Deploy Completo!

### Salvar Informações

**URLs de Produção:**
- Frontend: `_________________________________`
- Backend: `_________________________________`
- Supabase: `_________________________________`

**Credenciais Admin:**
- Email: `admin@bartab.com`
- Senha: `admin123` (mudar em produção!)

**Banco de Dados:**
- Connection String: `_________________________________`
- Senha: `_________________________________`

---

## 📝 Próximos Passos

- [ ] Compartilhar URLs com equipe
- [ ] Alterar senha do admin
- [ ] Criar usuários para testes
- [ ] Testar com dados reais
- [ ] Configurar domínio customizado (opcional)
- [ ] Configurar alertas no Render
- [ ] Documentar processo para equipe

---

## 🔧 Manutenção

### Atualizações de Código
```bash
git add .
git commit -m "Nova feature"
git push origin main
```
- [ ] Render faz deploy automático ✅

### Monitorar
- [ ] Logs: Render Dashboard → Logs
- [ ] Banco: Supabase → Reports
- [ ] Erros: Render → Events

### Backup
- [ ] Supabase faz backup automático diário ✅
- [ ] Retenção: 7 dias (free tier)

---

## 💰 Custos Atuais

- Supabase: **Grátis** (500 MB)
- Render Backend: **Grátis** (com sleep)
- Render Frontend: **Grátis** (ilimitado)

**Total: R$ 0,00/mês** 🎉

---

## 📞 Suporte

**Guias:**
- Completo: [DEPLOY_RENDER_SUPABASE.md](./DEPLOY_RENDER_SUPABASE.md)
- Rápido: [QUICK_DEPLOY_SUPABASE.md](./QUICK_DEPLOY_SUPABASE.md)

**Links:**
- [Supabase Dashboard](https://app.supabase.com)
- [Render Dashboard](https://dashboard.render.com)
- [Supabase Docs](https://supabase.com/docs)
- [Render Docs](https://render.com/docs)

---

**✅ Parabéns! Seu BarTab está no ar!** 🚀

