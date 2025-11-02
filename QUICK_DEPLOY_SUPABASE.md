# ⚡ Deploy Rápido - Supabase + Render

Guia super resumido. Para detalhes, veja [DEPLOY_RENDER_SUPABASE.md](./DEPLOY_RENDER_SUPABASE.md)

---

## 🎯 Resumo

1. ⏱️ **5 min** - Criar banco no Supabase
2. ⏱️ **10 min** - Deploy backend no Render
3. ⏱️ **5 min** - Deploy frontend no Render
4. ⏱️ **2 min** - Atualizar URLs e testar

**Total: ~20 minutos**

---

## 1. Supabase (Banco de Dados)

### Criar:
1. https://supabase.com → Login → **New Project**
2. Nome: `bartab`, Senha: [crie forte], Region: South America
3. **Settings** → **Database** → Copiar **Connection Pooling** (porta 6543)

### ✅ Salvar:
```
postgresql://postgres.[ref]:[senha]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

---

## 2. Render - Backend

### Criar:
1. https://dashboard.render.com → **New +** → **Web Service**
2. Repositório: `bartab`
3. Configurar:
   ```
   Name: bartab-backend
   Root: backend
   Build: npm install && npm run build
   Start: npm run start:prod
   ```

### Variáveis:
```env
NODE_ENV=production
DATABASE_URL=[Cole URL do Supabase]
JWT_SECRET=[Gere: openssl rand -base64 32]
PORT=10000
CORS_ORIGIN=https://bartab-frontend.onrender.com
FRONTEND_URL=https://bartab-frontend.onrender.com
GOOGLE_CALLBACK_URL=https://bartab-backend.onrender.com/api/auth/google/callback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[seu-email@gmail.com]
SMTP_PASS=[senha-de-app]
SMTP_FROM=noreply@bartab.com
```

### ✅ Aguardar "Live" → Copiar URL

### Seed:
1. **Shell** → `npm run seed`

---

## 3. Render - Frontend

### Criar:
1. **New +** → **Static Site**
2. Repositório: `bartab`
3. Configurar:
   ```
   Name: bartab-frontend
   Root: frontend
   Build: npm install && npm run build
   Publish: dist
   ```

### Variáveis:
```env
VITE_API_BASE_URL=https://bartab-backend-xxxx.onrender.com/api
VITE_APP_TITLE=BarTab
```

### ✅ Aguardar "Live" → Copiar URL

---

## 4. Atualizar URLs

### No Backend:
Editar variáveis com URLs reais:
```env
CORS_ORIGIN=https://[sua-url-frontend].onrender.com
FRONTEND_URL=https://[sua-url-frontend].onrender.com
GOOGLE_CALLBACK_URL=https://[sua-url-backend].onrender.com/api/auth/google/callback
```

---

## 5. Testar

### Backend:
```
https://bartab-backend-xxxx.onrender.com/api
→ Deve retornar JSON
```

### Frontend:
```
https://bartab-frontend-xxxx.onrender.com
→ Deve carregar tela de login
```

### Login:
```
Email: admin@bartab.com
Senha: admin123
→ Deve logar com sucesso
```

---

## ✅ Checklist

- [ ] Supabase: projeto criado, URL copiada
- [ ] Backend: deployado, variáveis configuradas, seed executado
- [ ] Frontend: deployado, VITE_API_BASE_URL configurado
- [ ] URLs atualizadas no backend
- [ ] Login funciona
- [ ] Dados aparecem no Supabase Table Editor

---

## 🐛 Problemas?

### Backend não conecta ao banco:
- Use **Connection Pooler** (porta 6543), não conexão direta
- Verifique senha na URL

### CORS Error:
- `CORS_ORIGIN` = URL exata do frontend (sem `/` no final)

### Frontend não carrega:
- Verifique `VITE_API_BASE_URL` (deve ter `/api` no final)
- Abra F12 → Console para ver erros

---

## 💰 Custos

**GRÁTIS** nos planos free! 🎉

Limitações:
- Backend entra em sleep após 15 min
- 500 MB de banco de dados
- Suficiente para desenvolvimento/protótipo

---

## 🔄 Atualizações

```bash
git push origin main
```

Deploy automático! ✨

---

**📖 Guia completo**: [DEPLOY_RENDER_SUPABASE.md](./DEPLOY_RENDER_SUPABASE.md)

