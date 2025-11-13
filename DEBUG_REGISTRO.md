# 🔍 Guia de Debug - Problema de Registro

## 📋 O Problema

Quando o usuário preenche o nome do estabelecimento e clica em "Criar conta":
- Fica travado em "Criando conta..."
- Não redireciona para a página pendente/aguardando aprovação
- O email não é enviado

## ✅ Correções Aplicadas

### 1. Melhorado o Tratamento de Erros no Backend

**Arquivo**: `backend/src/modules/auth/controllers/auth.controller.ts`

**O que foi feito:**
- Adicionados logs detalhados em cada etapa do registro
- Agora o erro real é mostrado nos logs (antes estava sendo escondido)
- A mensagem de erro original é retornada ao frontend

### 2. Melhorado os Logs no Frontend

**Arquivo**: `frontend/src/pages/Register.tsx`

**O que foi feito:**
- Adicionados logs detalhados em cada etapa
- Melhor captura de erros com mais informações
- Mensagem de erro mais clara para o usuário

## 🧪 Como Testar

### Passo 1: Reiniciar o Backend

```bash
cd backend
npm run start:dev
```

**Aguarde até ver**: `Application is running on: http://...`

### Passo 2: Reiniciar o Frontend (em outro terminal)

```bash
cd frontend
npm run dev
```

### Passo 3: Tentar Fazer um Registro

1. Acesse o sistema
2. Faça login com Google
3. Quando pedir o nome do estabelecimento, coloque um nome e clique em "Criar conta"
4. **IMPORTANTE**: Abra o Console do Navegador (F12 → Console)

### Passo 4: Verificar os Logs

#### No Console do Navegador (Frontend)

Procure por mensagens começando com:
- 🟢 `[FRONTEND]` - indica que está funcionando
- ✅ `[FRONTEND]` - indica sucesso
- ❌ `[FRONTEND]` - indica erro

#### No Terminal do Backend

Procure por mensagens começando com:
- 🔵 `[REGISTER]` - indica que está processando
- ✅ `[REGISTER]` - indica sucesso em cada etapa
- ❌ `[REGISTER]` - indica erro (aqui terá a mensagem real do problema!)

## 🔎 Possíveis Causas do Problema

### 1. Problema de Conexão com o Banco de Dados

**Sintomas nos logs:**
```
❌ [REGISTER] ERRO NO REGISTRO!
❌ [REGISTER] Mensagem: Connection terminated unexpectedly
```

**Solução:**
- Verificar se o DATABASE_URL está correto no `.env`
- Verificar se o banco de dados está acessível

### 2. Timeout na Requisição

**Sintomas nos logs do frontend:**
```
❌ [FRONTEND] Erro ao registrar: TypeError: Failed to fetch
```

**Solução:**
- Verificar se o backend está rodando
- Verificar se o VITE_API_BASE_URL está correto
- Verificar firewall/antivírus

### 3. Erro ao Salvar no Banco

**Sintomas nos logs do backend:**
```
❌ [REGISTER] ERRO NO REGISTRO!
❌ [REGISTER] Mensagem: duplicate key value violates unique constraint
```

**Solução:**
- O estabelecimento ou usuário já existe
- Verificar se está tentando usar um nome já cadastrado

### 4. Problema com as Variáveis de Ambiente

**Sintomas nos logs do backend:**
```
❌ Email não enviado: SMTP não configurado
```

**Nota:** Isso NÃO impede o registro! O email apenas não será enviado.

**Solução (se quiser receber emails):**
- Adicionar `SMTP_USER` e `SMTP_PASS` no `.env` do backend
- Gerar uma senha de app no Gmail

## 📊 Exemplo de Logs de Sucesso

### Frontend (Console do Navegador):
```
🟢 [FRONTEND] Iniciando registro...
🟢 [FRONTEND] Nome do estabelecimento: Bar do João
🟢 [FRONTEND] API URL: http://localhost:3000/api/auth/register
🟢 [FRONTEND] Enviando requisição...
🟢 [FRONTEND] Resposta recebida: {status: 201, statusText: 'Created', ok: true}
✅ [FRONTEND] Registro bem-sucedido!
✅ [FRONTEND] Token recebido: Sim
✅ [FRONTEND] Login concluído, redirecionando...
```

### Backend (Terminal):
```
🔵 [REGISTER] Iniciando registro...
🔵 [REGISTER] Nome do estabelecimento: Bar do João
🔵 [REGISTER] Google Profile: { email: 'usuario@gmail.com', name: 'Usuario' }
🔵 [REGISTER] Chamando registerUser...
✅ [REGISTER] Usuário registrado com sucesso!
✅ [REGISTER] User ID: abc123...
✅ [REGISTER] Establishment ID: def456...
🔵 [REGISTER] Gerando token de login...
✅ [REGISTER] Token gerado com sucesso!
```

## 🚨 O Que Fazer se Ainda Não Funcionar

1. **Copie TODOS os logs do backend e do frontend**
2. **Tire screenshots dos erros no console**
3. **Verifique se:**
   - Backend está rodando na porta 3000
   - Frontend está rodando na porta 5173
   - Não há erros no terminal do backend ao iniciar
   - O DATABASE_URL está correto

## 📝 Checklist Rápido

- [ ] Backend está rodando?
- [ ] Frontend está rodando?
- [ ] Console do navegador está aberto (F12)?
- [ ] Tentou fazer o registro?
- [ ] Copiou os logs que apareceram?

---

## 🎯 Próximos Passos Após Identificar o Erro

Quando você tentar fazer o registro e olhar os logs, me envie:
1. Os logs do **console do navegador** (frontend)
2. Os logs do **terminal do backend**
3. Qualquer mensagem de erro que aparecer

Com essas informações, poderei identificar exatamente qual é o problema e corrigi-lo!

