# 🔧 Correção de CORS no Render - BarTab

## Problema
O frontend no Render (`https://bartab-frontend.onrender.com`) estava sendo bloqueado pelo CORS do backend.

## Solução Aplicada

### 1. Correção no `backend/src/main.ts`
- Adicionada validação explícita de origens com callback
- Incluídos logs para debug (`console.log` quando bloqueia)
- Lista explícita de origens permitidas:
  - `https://bartab-frontend.onrender.com`
  - Variáveis de ambiente `CORS_ORIGIN` e `FRONTEND_URL`

### 2. Correção no `frontend/src/pages/Register.tsx`
- Substituída URL hard-coded por variável de ambiente
- Agora usa `VITE_API_BASE_URL` configurada no Render

## Como Verificar se Está Funcionando

### 1. Verificar Logs do Backend
No Dashboard do Render → bartab-backend → **Logs**, procure por:
- `✅ Allowed origins:` - lista as origens permitidas
- `❌ CORS blocked origin:` - mostra origens bloqueadas (se houver)

### 2. Testar no Terminal
```bash
# Testar se CORS está permitindo o frontend
curl -I https://bartab-backend-n6nm.onrender.com/api \
  -H "Origin: https://bartab-frontend.onrender.com" \
  | grep -i "access-control"
```

**Resposta esperada:**
```
access-control-allow-origin: https://bartab-frontend.onrender.com
access-control-allow-credentials: true
```

### 3. Testar no Browser Console
```javascript
fetch('https://bartab-backend-n6nm.onrender.com/api', {
  method: 'GET',
  headers: { 'Origin': 'https://bartab-frontend.onrender.com' }
})
.then(r => {
  console.log('✅ CORS OK!');
  console.log('Access-Control-Allow-Origin:', r.headers.get('access-control-allow-origin'));
})
.catch(e => console.error('❌ CORS Error:', e));
```

## Variáveis de Ambiente no Render

### Backend (bartab-backend)
```env
NODE_ENV=production
DATABASE_URL=<sua-database-url>
JWT_SECRET=<seu-secret>
PORT=10000

# CORS
CORS_ORIGIN=https://bartab-frontend.onrender.com
FRONTEND_URL=https://bartab-frontend.onrender.com
```

### Frontend (bartab-frontend)
```env
VITE_API_BASE_URL=https://bartab-backend-n6nm.onrender.com/api
VITE_APP_TITLE=BarTab
```

## Troubleshooting

### ❌ Erro: "Access to fetch has been blocked by CORS policy"

**Causa**: O backend ainda não foi redeployado ou não tem as variáveis de ambiente.

**Solução**:
1. Forçar redeploy manual no Dashboard do Render
2. Verificar logs do backend para mensagens de CORS
3. Confirmar que variáveis de ambiente estão configuradas

### ❌ Erro: "net::ERR_FAILED"

**Causa**: Backend está offline ou URL incorreta.

**Solução**:
1. Verificar se backend está "Live" no Dashboard
2. Testar manualmente: `curl https://bartab-backend-n6nm.onrender.com/api`
3. Aguardar alguns minutos se estiver fazendo deploy

### ❌ Erro: "Not allowed by CORS" nos logs

**Causa**: A origem não está na lista de permitidas.

**Solução**:
1. Verificar nos logs qual é a origem que está sendo bloqueada
2. Adicionar essa origem nas variáveis `CORS_ORIGIN` ou `FRONTEND_URL`
3. Fazer redeploy do backend

### ⚠️ Backend está em "Sleep Mode"

No plano Free do Render, serviços ficam inativos após 15 minutos sem uso.

**Solução**:
- Primeira requisição pode demorar 30-60 segundos
- Aguarde e tente novamente
- Considere plano Starter ($7/mês) para evitar sleep

## Como Forçar Redeploy

1. Acesse: https://dashboard.render.com
2. Clique no serviço **bartab-backend**
3. Canto superior direito → **"Manual Deploy"** → **"Deploy latest commit"**
4. Aguarde até aparecer "Live" ✅

## Próximos Passos

Após o redeploy:
1. ✅ Aguardar 3-5 minutos
2. ✅ Verificar logs para confirmar configuração
3. ✅ Testar cadastro de estabelecimento no frontend
4. ✅ Confirmar que não há mais erros de CORS

## Referências

- [Documentação CORS NestJS](https://docs.nestjs.com/security/cors)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)
- [Debugging CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors)

