# ✅ Correção: Email Travando o Registro

## 🐛 O Problema

Quando um usuário se registrava:
- ✅ O cadastro era salvo no banco de dados
- ✅ A solicitação aparecia para o admin
- ❌ **O botão ficava carregando infinitamente no frontend**
- ❌ Não redirecionava para a página de pendente/aguardando aprovação
- ❌ O email nunca era enviado

### Por que isso acontecia?

O código estava tentando enviar um email durante o registro, mas:
1. O SMTP não estava configurado (sem SMTP_USER e SMTP_PASS)
2. O `transporter.sendMail()` ficava **travado** tentando conectar indefinidamente
3. O backend nunca retornava a resposta para o frontend
4. O frontend ficava esperando eternamente

## ✅ A Solução Aplicada

### 1. **Timeouts no Transporter de Email**

**Arquivo**: `backend/src/modules/notification/notification.service.ts`

Adicionei timeouts para evitar conexões infinitas:

```typescript
this.transporter = nodemailer.createTransport({
  host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
  port: this.configService.get<number>('SMTP_PORT') || 587,
  secure: false,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  connectionTimeout: 5000,  // ✅ 5s timeout para conexão
  greetingTimeout: 5000,    // ✅ 5s timeout para greeting
  socketTimeout: 10000,     // ✅ 10s timeout para socket
});
```

### 2. **Timeout na Promessa de Envio**

Adicionei um timeout máximo de 15 segundos para o envio de email:

```typescript
try {
  // Timeout de 15 segundos
  const sendMailPromise = this.transporter.sendMail(mailOptions);
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Email timeout - levou mais de 15 segundos')), 15000)
  );
  
  // Usa o que responder primeiro (email enviado ou timeout)
  await Promise.race([sendMailPromise, timeoutPromise]);
  
  this.logger.log(`✅ Alerta de novo cadastro enviado com sucesso`);
} catch (error) {
  this.logger.error(`❌ Erro ao enviar alerta: ${error.message}`);
  // ✅ NÃO lança erro - apenas registra no log
}
```

### 3. **Envio Assíncrono Não-Bloqueante**

**Arquivo**: `backend/src/modules/auth/services/auth.service.ts`

O registro agora **não espera** o email ser enviado:

```typescript
// ANTES (bloqueante):
if (userRole === UserRole.PROPRIETARIO) {
  try {
    await this.notificationService.sendAdminNewSignupAlert(...); // ❌ Esperava aqui
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}
return savedUser;

// DEPOIS (não-bloqueante):
if (userRole === UserRole.PROPRIETARIO) {
  console.log('📧 Agendando envio de email para admin...');
  
  // ✅ Usa setImmediate - não aguarda
  setImmediate(async () => {
    try {
      await this.notificationService.sendAdminNewSignupAlert(...);
      console.log('✅ Email enviado!');
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error.message);
    }
  });
  
  console.log('✅ Email agendado (não bloqueante)');
}

console.log('✅ Retornando usuário criado...');
return savedUser; // ✅ Retorna imediatamente, sem esperar o email
```

## 🎯 Resultado

Agora o fluxo funciona assim:

1. ✅ Usuário preenche o nome do estabelecimento
2. ✅ Backend salva no banco de dados
3. ✅ Backend **agenda** o envio do email (mas não espera)
4. ✅ Backend **retorna imediatamente** para o frontend
5. ✅ Frontend recebe o token e redireciona
6. ✅ Usuário vê a tela de "Aguardando aprovação"
7. 📧 Email é enviado em background (ou falha silenciosamente se SMTP não configurado)

## 🧪 Como Testar

### Passo 1: Reiniciar o Backend

```bash
cd backend
npm run start:dev
```

### Passo 2: Fazer um Novo Registro

1. Acesse o sistema
2. Faça login com Google (use um email diferente do admin)
3. Preencha o nome do estabelecimento
4. Clique em "Criar conta"

### O Que Deve Acontecer Agora:

✅ **Imediatamente** (1-2 segundos):
- O botão para de carregar
- Você é redirecionado
- Vê a tela de "Aguardando aprovação"

📧 **Em background** (até 15 segundos depois):
- Se o SMTP estiver configurado: email é enviado
- Se não estiver: aparece no log do backend `❌ Erro ao enviar email` mas **não afeta o usuário**

## 📊 Logs Esperados

### No Backend (Terminal):

```
🔵 [REGISTER] Iniciando registro...
🔵 [REGISTER] Nome do estabelecimento: Meu Bar
🔵 [REGISTER] Google Profile: { email: 'usuario@gmail.com', name: 'Usuario' }
🔵 [REGISTER] Chamando registerUser...
✅ [REGISTER] Usuário registrado com sucesso!
✅ [REGISTER] User ID: abc123...
✅ [REGISTER] Establishment ID: def456...
📧 [REGISTER] Agendando envio de email para admin...
✅ [REGISTER] Email agendado para envio (não bloqueante)
✅ [REGISTER] Retornando usuário criado...
🔵 [REGISTER] Gerando token de login...
✅ [REGISTER] Token gerado com sucesso!

# Depois, em background:
📧 [REGISTER] Enviando email para admin...
⚠️  Email não enviado: SMTP não configurado  # Se SMTP não configurado
# OU
✅ [REGISTER] Email enviado para admin com sucesso!  # Se SMTP configurado
```

### No Frontend (Console do Navegador):

```
🟢 [FRONTEND] Iniciando registro...
🟢 [FRONTEND] Enviando requisição...
🟢 [FRONTEND] Resposta recebida: {status: 201, ok: true}
✅ [FRONTEND] Registro bem-sucedido!
✅ [FRONTEND] Token recebido: Sim
✅ [FRONTEND] Login concluído, redirecionando...
```

## 🔧 Configurar SMTP (Opcional)

Se você **quiser que os emails sejam enviados**, adicione no `.env` do backend:

```env
# Configurações de Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-do-gmail
SMTP_FROM=noreply@bartab.com
```

**Como gerar senha de app do Gmail:**
1. Acesse: https://myaccount.google.com/apppasswords
2. Crie uma nova senha de app
3. Use essa senha no `SMTP_PASS`

## ⚠️ Importante

- **O registro funciona mesmo sem SMTP configurado**
- O email é apenas uma notificação extra
- Se o SMTP não estiver configurado, o sistema apenas loga o aviso mas continua funcionando
- O admin pode ver as solicitações pendentes no painel administrativo

## 📝 Resumo da Correção

| Antes | Depois |
|-------|--------|
| ❌ Registro travava no envio de email | ✅ Registro completa imediatamente |
| ❌ Frontend ficava carregando infinitamente | ✅ Frontend recebe resposta em 1-2s |
| ❌ Não redirecionava | ✅ Redireciona para tela de pendente |
| ❌ Email tentava enviar e travava | ✅ Email é enviado em background com timeout |
| ❌ Sem feedback de erro | ✅ Erros são logados mas não afetam o usuário |

---

## 🎯 Status: RESOLVIDO ✅

O problema foi corrigido! Agora o registro funciona perfeitamente, independentemente da configuração de email.

