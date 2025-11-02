# 🚀 Deploy Rápido no Render - BarTab

Guia resumido para deploy rápido. Para detalhes completos, veja [DEPLOY_RENDER.md](./DEPLOY_RENDER.md).

## 📦 Opção 1: Deploy Automático (Recomendado)

### 1. Preparar o Repositório

```bash
# Certifique-se que tudo está commitado
git add .
git commit -m "Preparar para deploy no Render"
git push origin main
```

### 2. Deploy via render.yaml

1. Acesse [Dashboard do Render](https://dashboard.render.com)
2. Clique em **"New +"** → **"Blueprint"**
3. Conecte seu repositório Git
4. O Render detectará o `render.yaml` automaticamente
5. Clique em **"Apply"**

### 3. Configurar Variáveis Secretas

Após o deploy, configure estas variáveis manualmente no dashboard:

**Backend** (`bartab-backend`):
```env
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
```

### 4. Atualizar URLs

Após obter as URLs dos serviços, atualize no `render.yaml` e faça redeploy:

```yaml
# No backend
CORS_ORIGIN=https://seu-bartab-frontend.onrender.com
FRONTEND_URL=https://seu-bartab-frontend.onrender.com
GOOGLE_CALLBACK_URL=https://seu-bartab-backend.onrender.com/api/auth/google/callback

# No frontend
VITE_API_BASE_URL=https://seu-bartab-backend.onrender.com/api
```

## 📋 Opção 2: Deploy Manual

### Backend

1. **Novo Web Service** → Conectar repositório
2. Configuração:
   - Root: `backend`
   - Build: `npm install && npm run build`
   - Start: `npm run start:prod`
3. Adicionar variáveis de ambiente (ver guia completo)

### Frontend

1. **Novo Static Site** → Conectar repositório
2. Configuração:
   - Root: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `dist`
3. Adicionar variáveis de ambiente:
   ```env
   VITE_API_BASE_URL=https://seu-backend.onrender.com/api
   ```

### Banco de Dados

1. **Novo PostgreSQL**
2. Nome: `bartab-db`
3. Copiar a **Internal Database URL**
4. Adicionar no backend como `DATABASE_URL`

## ✅ Checklist Pós-Deploy

```bash
# 1. Testar backend
curl https://seu-backend.onrender.com/api

# 2. Executar seed (via Shell no dashboard do backend)
cd backend && npm run seed

# 3. Testar frontend
# Abrir no navegador: https://seu-frontend.onrender.com

# 4. Testar login
# Criar usuário e fazer login na aplicação
```

## ⚠️ Importantes Lembrar

1. **URLs HTTPS**: Sempre use `https://` nas variáveis de ambiente
2. **CORS**: Configure `CORS_ORIGIN` com a URL exata do frontend
3. **Google OAuth**: Adicione as URLs de callback no Google Cloud Console
4. **Senha Gmail**: Use [senha de aplicativo](https://support.google.com/accounts/answer/185833), não sua senha normal
5. **Free Tier**: Serviços entram em sleep após 15 min de inatividade

## 🐛 Problemas Comuns

### Backend não conecta ao banco
```bash
# Use a Internal Database URL, não a External
DATABASE_URL=postgresql://user:pass@internal-host/db
```

### CORS Error
```bash
# Verifique se o CORS_ORIGIN está correto (sem barra no final)
CORS_ORIGIN=https://seu-frontend.onrender.com
```

### Frontend não carrega
```bash
# Verifique se o arquivo _redirects existe em frontend/public/
cat frontend/public/_redirects
```

## 🔄 Atualizações

```bash
# Deploy automático ao fazer push
git add .
git commit -m "Nova funcionalidade"
git push origin main
# O Render detecta e faz deploy automaticamente
```

## 💡 Dicas

- **Logs**: Monitore sempre os logs durante o primeiro deploy
- **Shell**: Use a aba Shell no dashboard para executar comandos
- **Rollback**: Use a aba Events para voltar versões
- **Custom Domain**: Configure em Settings → Custom Domain

## 📞 Suporte

- Guia completo: [DEPLOY_RENDER.md](./DEPLOY_RENDER.md)
- Docs Render: https://render.com/docs
- Status: https://status.render.com

---

**⏱️ Tempo estimado de deploy**: 10-15 minutos

