# ✅ Checklist de Deploy - BarTab no Render

Use este checklist para garantir que o deploy seja feito corretamente.

## 🎯 Pré-Deploy

### Preparação do Código
- [ ] Código testado localmente
- [ ] Todas as mudanças commitadas
- [ ] Push feito para o repositório Git
- [ ] Build do backend funciona: `cd backend && npm run build`
- [ ] Build do frontend funciona: `cd frontend && npm run build`
- [ ] Arquivo `render.yaml` presente na raiz
- [ ] Arquivo `frontend/public/_redirects` existe

### Credenciais Preparadas
- [ ] Google Client ID e Secret (se usar OAuth)
- [ ] Credenciais SMTP (Gmail ou outro)
- [ ] URL do repositório Git

## 🗄️ Deploy do Banco de Dados

- [ ] PostgreSQL criado no Render
  - Nome: `bartab-db`
  - Database: `pdv_dev`
  - Plan: Free ou Starter
- [ ] Connection String salva (Internal Database URL)
- [ ] Banco está "Available" no dashboard

## 🔧 Deploy do Backend

### Criação do Serviço
- [ ] Web Service criado
  - Nome: `bartab-backend`
  - Runtime: Node
  - Root: `backend`
  - Build: `npm install && npm run build`
  - Start: `npm run start:prod`

### Variáveis de Ambiente Configuradas
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `DATABASE_URL` (do banco criado)
- [ ] `JWT_SECRET` (gerado ou manualmente)
- [ ] `CORS_ORIGIN` (URL do frontend)
- [ ] `FRONTEND_URL` (URL do frontend)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_CALLBACK_URL` (URL do backend + /api/auth/google/callback)
- [ ] `SMTP_HOST=smtp.gmail.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_USER` (seu email)
- [ ] `SMTP_PASS` (senha de app)
- [ ] `SMTP_FROM=noreply@bartab.com`

### Deploy e Verificação
- [ ] Deploy completado com sucesso
- [ ] Logs não mostram erros críticos
- [ ] Health check passando (URL/api retorna algo)
- [ ] URL do backend anotada: `https://_____.onrender.com`

## 🎨 Deploy do Frontend

### Criação do Site
- [ ] Static Site criado
  - Nome: `bartab-frontend`
  - Root: `frontend`
  - Build: `npm install && npm run build`
  - Publish: `dist`

### Variáveis de Ambiente Configuradas
- [ ] `VITE_API_BASE_URL` (URL do backend + /api)
- [ ] `VITE_APP_TITLE=BarTab`

### Deploy e Verificação
- [ ] Deploy completado com sucesso
- [ ] Site carrega no navegador
- [ ] Console do navegador sem erros
- [ ] URL do frontend anotada: `https://_____.onrender.com`

## 🔄 Pós-Deploy

### Atualizar URLs
- [ ] `CORS_ORIGIN` no backend atualizado com URL real do frontend
- [ ] `FRONTEND_URL` no backend atualizado
- [ ] `GOOGLE_CALLBACK_URL` no backend atualizado
- [ ] `VITE_API_BASE_URL` no frontend atualizado
- [ ] Redeploy do backend feito (se necessário)
- [ ] Redeploy do frontend feito (se necessário)

### Configurar OAuth (se aplicável)
- [ ] Google Cloud Console acessado
- [ ] Redirect URIs atualizadas
- [ ] JavaScript origins atualizadas
- [ ] Credenciais salvas

### Inicializar Banco de Dados
- [ ] Migrations executadas (via Shell no backend)
- [ ] Seed executado: `npm run seed`
- [ ] Usuário admin criado
- [ ] Dados de teste inseridos (se necessário)

## ✅ Testes de Validação

### Backend
- [ ] `curl https://seu-backend.onrender.com/api` retorna resposta
- [ ] Endpoint de health check funciona
- [ ] Logs não mostram erros de conexão com banco

### Frontend
- [ ] Site abre no navegador
- [ ] Logo e estilos carregam corretamente
- [ ] Navegação entre páginas funciona

### Integração
- [ ] Login com email/senha funciona
- [ ] Login com Google funciona (se configurado)
- [ ] CORS não bloqueia requisições
- [ ] Tokens JWT são gerados
- [ ] Refresh token funciona

### Funcionalidades Principais
- [ ] Criar cliente
- [ ] Criar item/produto
- [ ] Abrir comanda
- [ ] Adicionar itens à comanda
- [ ] Registrar pagamento
- [ ] Fechar comanda
- [ ] Ver histórico
- [ ] Permissões RBAC funcionam

### Email (se configurado)
- [ ] Email de notificação é enviado
- [ ] Links no email funcionam
- [ ] SMTP não retorna erros

## 🐛 Troubleshooting

Se algo não funcionar, verifique:

### Backend não inicia
- [ ] Logs verificados no dashboard
- [ ] Todas variáveis de ambiente configuradas
- [ ] DATABASE_URL está correto
- [ ] Build completou sem erros

### Frontend não carrega
- [ ] Arquivo `_redirects` existe em `frontend/public/`
- [ ] Build gerou arquivos em `dist/`
- [ ] VITE_API_BASE_URL está correto

### CORS Error
- [ ] CORS_ORIGIN no backend = URL exata do frontend (sem / no final)
- [ ] Frontend faz requisições para URL correta do backend
- [ ] Protocolo HTTPS está sendo usado

### Banco não conecta
- [ ] DATABASE_URL é a Internal URL (não External)
- [ ] Banco está "Available" no dashboard
- [ ] PostgreSQL está na mesma região do backend

### OAuth não funciona
- [ ] URLs de callback corretas no Google Console
- [ ] GOOGLE_CALLBACK_URL no backend está correto
- [ ] Client ID e Secret estão corretos

## 📊 Métricas de Sucesso

- [ ] Tempo de resposta da API < 500ms
- [ ] Frontend carrega em < 3s
- [ ] Zero erros nos logs após 5 minutos
- [ ] Usuários conseguem fazer login e usar o sistema
- [ ] Dados são salvos corretamente no banco

## 📝 Documentação

- [ ] URLs de produção documentadas
- [ ] Credenciais salvas em gerenciador de senhas
- [ ] Equipe informada sobre o deploy
- [ ] Guia de uso atualizado (se necessário)

## 🎉 Deploy Completo!

Parabéns! Seu BarTab está rodando em produção no Render.

### Próximos Passos
1. Monitorar logs nas primeiras 24 horas
2. Configurar alertas no Render
3. Fazer backup do banco de dados
4. Testar com usuários reais
5. Coletar feedback

### Links Úteis
- Backend: https://seu-backend.onrender.com
- Frontend: https://seu-frontend.onrender.com
- Dashboard Render: https://dashboard.render.com
- Logs Backend: https://dashboard.render.com/web/[seu-service-id]
- Guia Completo: [DEPLOY_RENDER.md](./DEPLOY_RENDER.md)
- Dicas: [RENDER_TIPS.md](./RENDER_TIPS.md)

---

**⏱️ Tempo médio de deploy**: 15-20 minutos

**💡 Dica**: Salve este checklist preenchido para referência futura e próximos deploys.

