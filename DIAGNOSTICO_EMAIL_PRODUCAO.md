# 🔍 Diagnóstico: Emails não sendo recebidos em Produção

## ❌ Problema Reportado
Os emails de solicitação/aprovação não estão sendo recebidos no ambiente de produção.

---

## 🎯 Possíveis Causas e Soluções

### 1. ⚠️ CAUSA MAIS PROVÁVEL: Variáveis de Ambiente não configuradas no Render

No arquivo `render.yaml`, as variáveis `SMTP_USER` e `SMTP_PASS` estão marcadas como `sync: false`, o que significa que **precisam ser configuradas manualmente** no dashboard do Render.

#### ✅ Solução:

1. **Acesse o Dashboard do Render:**
   - Vá para: https://dashboard.render.com
   - Clique no seu serviço `bartab-backend`

2. **Configure as Variáveis de Ambiente:**
   - Vá em "Environment" (menu lateral)
   - Adicione/Verifique as seguintes variáveis:

   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=seu-email@gmail.com
   SMTP_PASS=sua-senha-de-app-de-16-digitos
   SMTP_FROM=noreply@bartab.com
   ```

3. **Como gerar a Senha de App do Gmail:**
   - Acesse: https://myaccount.google.com/security
   - Ative "Verificação em duas etapas" (obrigatório)
   - Vá em "Senhas de app"
   - Selecione "E-mail" e "Outro (Nome personalizado)"
   - Digite "BarTab Render"
   - Copie a senha de 16 caracteres (sem espaços)
   - Cole em `SMTP_PASS`

4. **Salve e Redeploy:**
   - Clique em "Save Changes"
   - O Render vai fazer redeploy automaticamente

---

### 2. 🔒 Conta Gmail bloqueando envio de emails

O Gmail pode estar bloqueando o envio por motivos de segurança.

#### ✅ Verificações:

1. **Verifique se recebeu email de alerta do Google:**
   - Verifique sua caixa de entrada do Gmail
   - Procure por: "Tentativa de login bloqueada" ou "Login suspeito"

2. **Permita acesso ao app:**
   - Se recebeu o email, clique em "Sim, fui eu"
   - Ou acesse: https://myaccount.google.com/notifications

3. **Verifique a atividade da conta:**
   - Acesse: https://myaccount.google.com/device-activity
   - Veja se há tentativas de login bloqueadas

---

### 3. 📝 Erros silenciados no código

O código atual captura erros mas não os relata adequadamente. Os erros são apenas logados com `console.error` ou `this.logger.error`, mas podem não aparecer nos logs do Render.

#### ✅ Como verificar os logs:

1. **Acesse os Logs do Render:**
   - Dashboard > `bartab-backend` > "Logs" (menu lateral)
   - Procure por mensagens de erro contendo:
     - `"Erro ao enviar"`
     - `"SMTP"`
     - `"nodemailer"`
     - `"Error"`

2. **Filtre por erros específicos:**
   ```
   ❌ [APPROVE] Erro ao enviar e-mail
   ❌ Erro ao enviar alerta de novo cadastro
   ❌ Erro ao enviar e-mail de aprovação
   ```

---

### 4. 🚫 IP do Render bloqueado pelo Gmail

Alguns IPs de servidores cloud podem estar em listas negras do Gmail.

#### ✅ Alternativas:

**Opção A: Use SendGrid (Recomendado para produção)**

SendGrid oferece 100 emails/dia grátis e é mais confiável:

1. **Crie uma conta SendGrid:**
   - Acesse: https://sendgrid.com
   - Crie uma conta gratuita

2. **Gere uma API Key:**
   - Dashboard > Settings > API Keys
   - Crie uma nova API Key
   - Copie a chave (ela só será mostrada uma vez)

3. **Instale o pacote SendGrid:**
   ```bash
   cd backend
   npm install @sendgrid/mail
   ```

4. **Atualize as variáveis no Render:**
   ```
   SENDGRID_API_KEY=sua-api-key-aqui
   EMAIL_PROVIDER=sendgrid
   ```

**Opção B: Use outro provedor SMTP**

Alternativas ao Gmail:
- **SendGrid** - 100 emails/dia grátis
- **Mailgun** - 5.000 emails/mês grátis (primeiros 3 meses)
- **Amazon SES** - 62.000 emails/mês grátis (se hospedar na AWS)
- **Brevo (ex-Sendinblue)** - 300 emails/dia grátis

---

### 5. 🔍 Transporter do Nodemailer mal configurado

Se `SMTP_USER` ou `SMTP_PASS` estiverem vazios/undefined, o transporter não vai autenticar.

#### ✅ Adicionar validação:

Vou criar um script de diagnóstico para você verificar.

---

### 6. 📧 Email indo para SPAM

Os emails podem estar sendo enviados mas caindo na pasta de SPAM.

#### ✅ Verificações:

1. **Verifique a pasta de SPAM:**
   - Gmail > Spam
   - Procure por emails de `noreply@bartab.com`

2. **Marque como "Não é spam":**
   - Se encontrar, clique em "Não é spam"
   - Isso vai ensinar o Gmail a aceitar esses emails

3. **Configure SPF/DKIM (se usar domínio próprio):**
   - Necessário apenas se `SMTP_FROM` usar seu domínio real
   - Requer acesso ao DNS do domínio

---

## 🛠️ Script de Diagnóstico

Vou criar um script para testar o envio de emails e diagnosticar problemas.

---

## 📋 Checklist de Diagnóstico

Execute nesta ordem:

- [ ] **1. Verificar variáveis de ambiente no Render**
  - Acesse Dashboard > bartab-backend > Environment
  - Confirme que `SMTP_USER` e `SMTP_PASS` estão configurados
  - Valores não devem estar vazios

- [ ] **2. Verificar logs de erro no Render**
  - Dashboard > bartab-backend > Logs
  - Procure por erros de SMTP/email
  - Anote qualquer mensagem de erro

- [ ] **3. Testar envio de email manualmente**
  - Use o script de diagnóstico (próximo passo)

- [ ] **4. Verificar senha de app do Gmail**
  - Acesse: https://myaccount.google.com/apppasswords
  - Gere uma nova senha se necessário
  - Atualize `SMTP_PASS` no Render

- [ ] **5. Verificar pasta de SPAM**
  - Verifique spam em eduardo.klug7@gmail.com
  - Verifique spam no email do proprietário

- [ ] **6. Considerar alternativa ao Gmail**
  - Se tudo acima falhar, use SendGrid

---

## 🚀 Próximos Passos

1. **Execute o checklist acima**
2. **Use o script de diagnóstico que vou criar**
3. **Verifique os logs do Render**
4. **Me informe o resultado para ajudar mais**

---

## 💡 Dica: Como testar rapidamente

1. **Faça um novo cadastro de teste:**
   - Faça logout
   - Faça login com um novo email (não eduardo.klug7@gmail.com)
   - Complete o cadastro

2. **Verifique os logs imediatamente:**
   - Dashboard Render > Logs
   - Você deve ver:
     ```
     📤 [AUTH] Enviando alerta para admin
     ✅ Alerta de novo cadastro enviado para eduardo.klug7@gmail.com
     ```

3. **Se não ver essas mensagens:**
   - O email não está sendo enviado
   - Verifique as variáveis de ambiente

