# 🚀 Guia de Deploy no Render - BarTab

Este guia detalha como fazer o deploy do frontend e backend do BarTab no Render.

## 📋 Pré-requisitos

1. Conta no [Render](https://render.com) (gratuita)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Código commitado e enviado para o repositório

## 🗄️ Passo 1: Deploy do Banco de Dados PostgreSQL

### 1.1 Criar o PostgreSQL
1. Acesse o [Dashboard do Render](https://dashboard.render.com)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `bartab-database` (ou nome de sua preferência)
   - **Database**: `pdv_dev`
   - **User**: `pdv` (ou deixe o padrão)
   - **Region**: escolha a região mais próxima
   - **PostgreSQL Version**: 16
   - **Instance Type**: Free (para testes) ou Starter ($7/mês)
4. Clique em **"Create Database"**

### 1.2 Obter a Connection String
Após a criação, você verá informações do banco:
- **Internal Database URL**: Use esta para conectar serviços dentro do Render
- **External Database URL**: Use esta para conectar de fora do Render

Formato: `postgresql://usuario:senha@host:porta/database`

**⚠️ Importante**: Salve essa URL, você precisará dela no backend!

## 🔧 Passo 2: Deploy do Backend (API NestJS)

### 2.1 Preparar o Backend para Produção

Primeiro, vamos criar um arquivo de configuração para o Render:

**Crie o arquivo `render.yaml` na raiz do projeto:**

```yaml
services:
  # Backend API
  - type: web
    name: bartab-backend
    runtime: node
    region: oregon # ou sua região preferida
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: DATABASE_URL
        sync: false # Você configurará manualmente no dashboard
      - key: JWT_SECRET
        generateValue: true # Gera automaticamente um valor seguro
      - key: CORS_ORIGIN
        sync: false
      - key: FRONTEND_URL
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: GOOGLE_CALLBACK_URL
        sync: false
      - key: SMTP_HOST
        value: smtp.gmail.com
      - key: SMTP_PORT
        value: 587
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
      - key: SMTP_FROM
        value: noreply@bartab.com
    healthCheckPath: /api
```

### 2.2 Criar o Web Service no Render (Alternativa Manual)

Se preferir não usar o `render.yaml`, siga estes passos:

1. No Dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório Git
3. Configure:
   - **Name**: `bartab-backend`
   - **Region**: escolha a região mais próxima
   - **Branch**: `main` (ou sua branch principal)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: Free (para testes) ou Starter ($7/mês)

### 2.3 Configurar Variáveis de Ambiente

No painel do seu serviço backend, vá em **"Environment"** e adicione:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...  # Cole a Internal Database URL do Passo 1
JWT_SECRET=seu-secret-super-seguro-aqui
CORS_ORIGIN=https://bartab-frontend.onrender.com
FRONTEND_URL=https://bartab-frontend.onrender.com
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_CALLBACK_URL=https://bartab-backend.onrender.com/api/auth/google/callback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@bartab.com
```

**⚠️ Notas Importantes:**
- Substitua `bartab-backend` e `bartab-frontend` pelos nomes reais dos seus serviços
- O Render atribui a porta automaticamente na variável `PORT` (normalmente 10000)
- Use URLs HTTPS no `CORS_ORIGIN` e `FRONTEND_URL`
- Para o Gmail, use uma [senha de aplicativo](https://support.google.com/accounts/answer/185833)

### 2.4 Deploy e Migração

1. Clique em **"Deploy"** para iniciar o deploy
2. Aguarde a conclusão do build
3. Após o deploy, execute as migrações:
   - Vá em **"Shell"** no dashboard do serviço
   - Execute: `cd backend && npm run migration:run` (se tiver configurado)
   - Ou execute o seed: `npm run seed`

**URL do Backend**: `https://bartab-backend.onrender.com`

## 🎨 Passo 3: Deploy do Frontend (React + Vite)

### 3.1 Ajustar Configuração do Frontend

**Atualize o arquivo `frontend/vite.config.ts`:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  // Importante para o Render
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
```

### 3.2 Criar o Static Site no Render

1. No Dashboard do Render, clique em **"New +"** → **"Static Site"**
2. Conecte seu repositório Git
3. Configure:
   - **Name**: `bartab-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 3.3 Configurar Variáveis de Ambiente

No painel do frontend, adicione:

```env
VITE_API_BASE_URL=https://bartab-backend.onrender.com/api
VITE_APP_TITLE=BarTab
```

### 3.4 Configurar Redirecionamento para SPA

Crie o arquivo `frontend/public/_redirects`:

```
/*    /index.html   200
```

Este arquivo garante que o React Router funcione corretamente no Render.

### 3.5 Deploy

1. Clique em **"Create Static Site"**
2. O Render fará o build e deploy automaticamente
3. **URL do Frontend**: `https://bartab-frontend.onrender.com`

## 🔄 Passo 4: Atualizar URLs no Backend

Após obter as URLs do Render, volte ao backend e atualize:

1. Vá nas variáveis de ambiente do backend
2. Atualize:
   ```env
   CORS_ORIGIN=https://bartab-frontend.onrender.com
   FRONTEND_URL=https://bartab-frontend.onrender.com
   GOOGLE_CALLBACK_URL=https://bartab-backend.onrender.com/api/auth/google/callback
   ```
3. Salve e aguarde o redeploy automático

## 🔐 Passo 5: Configurar Google OAuth (Opcional)

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Vá em **APIs & Services** → **Credentials**
3. Edite seu OAuth 2.0 Client ID
4. Adicione nas **Authorized redirect URIs**:
   ```
   https://bartab-backend.onrender.com/api/auth/google/callback
   ```
5. Adicione nas **Authorized JavaScript origins**:
   ```
   https://bartab-frontend.onrender.com
   https://bartab-backend.onrender.com
   ```

## 📊 Passo 6: Verificar o Deploy

### Testar o Backend
```bash
curl https://bartab-backend.onrender.com/api
```

### Testar o Frontend
Abra no navegador: `https://bartab-frontend.onrender.com`

## ⚙️ Configurações Adicionais

### Deploy Automático
O Render faz deploy automático quando você faz push para a branch configurada.

### Custom Domain (Opcional)
1. No painel do serviço, vá em **"Settings"** → **"Custom Domain"**
2. Adicione seu domínio (ex: `app.bartab.com`)
3. Configure os registros DNS conforme instruído

### Logs
- Acesse os logs em tempo real na aba **"Logs"** de cada serviço
- Útil para debug de erros em produção

### Ambiente de Staging (Opcional)
Repita o processo criando novos serviços conectados a uma branch `staging`.

## 🐛 Troubleshooting

### Backend não inicia
- Verifique os logs no dashboard
- Confirme que todas as variáveis de ambiente estão configuradas
- Verifique a conexão com o banco de dados

### Frontend não carrega
- Verifique se o arquivo `_redirects` existe
- Confirme que a `VITE_API_BASE_URL` está correta
- Verifique os logs de build

### Erro de CORS
- Verifique se `CORS_ORIGIN` no backend está correto
- Deve ser a URL completa do frontend: `https://bartab-frontend.onrender.com`

### Banco de dados não conecta
- Use a **Internal Database URL** se backend e banco estão no Render
- Verifique se a string de conexão está correta
- Confirme que o banco está ativo

### Migrations não executadas
- Execute manualmente via Shell no dashboard do backend
- Ou configure um script de inicialização que roda as migrations

## 💰 Custos

### Plano Free
- ✅ 750 horas de Web Service por mês (suficiente para 1 serviço 24/7)
- ✅ PostgreSQL com 90 dias de retenção
- ✅ Sites estáticos ilimitados
- ⚠️ Serviços free entram em "sleep" após 15 min de inatividade

### Plano Starter ($7/mês por serviço)
- ✅ Sem sleep
- ✅ Maior performance
- ✅ Mais recursos (RAM, CPU)

## 🔄 Atualizações e Manutenção

### Fazer Deploy de Nova Versão
1. Commit e push suas alterações para o Git
2. O Render detecta e faz deploy automático
3. Monitore os logs durante o deploy

### Rollback
1. Vá na aba **"Events"**
2. Clique em **"Rollback"** para voltar a uma versão anterior

### Backups do Banco
- Free: backups diários por 7 dias
- Pago: backups configuráveis

## 📚 Recursos Úteis

- [Documentação do Render](https://render.com/docs)
- [Render Status](https://status.render.com)
- [Community Forum](https://community.render.com)

## ✅ Checklist Final

- [ ] Banco de dados PostgreSQL criado
- [ ] Backend deployado e rodando
- [ ] Frontend deployado e acessível
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] Google OAuth configurado (se aplicável)
- [ ] Migrations executadas
- [ ] Seed executado (se necessário)
- [ ] Testado login e funcionalidades principais
- [ ] Logs verificados para erros

---

**🎉 Parabéns! Seu BarTab está no ar!**

Se tiver dúvidas, consulte a [documentação oficial do Render](https://render.com/docs) ou abra uma issue no repositório.

