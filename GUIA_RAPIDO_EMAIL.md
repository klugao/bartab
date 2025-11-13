# 🚀 Guia Rápido: Diagnóstico de Email

## ⚡ Solução Rápida (1 minuto)

Se você não está recebendo emails em **produção** (Render), siga estes passos:

### 1️⃣ Verifique os Logs do Render

```
1. Acesse: https://dashboard.render.com
2. Clique em "bartab-backend"
3. Vá em "Logs" (menu lateral)
4. Procure por estas mensagens:
```

**Se você vir:**

```
❌ CONFIGURAÇÃO DE EMAIL INCOMPLETA!
⚠️  EMAILS NÃO SERÃO ENVIADOS até que isso seja corrigido!
```

**Então as variáveis de ambiente não estão configuradas!** 👇

---

### 2️⃣ Configure as Variáveis no Render

```
1. Dashboard Render > bartab-backend > Environment
2. Adicione/Atualize estas variáveis:
```

| Variável | Valor | Como Obter |
|----------|-------|------------|
| `SMTP_HOST` | `smtp.gmail.com` | Já está configurado |
| `SMTP_PORT` | `587` | Já está configurado |
| `SMTP_USER` | `seu-email@gmail.com` | Seu email Gmail |
| `SMTP_PASS` | `abcd efgh ijkl mnop` | Gere uma Senha de App ⬇️ |
| `SMTP_FROM` | `noreply@bartab.com` | Já está configurado |

---

### 3️⃣ Como Gerar Senha de App do Gmail

**Importante:** Você PRECISA de uma "Senha de App", NÃO sua senha normal do Gmail!

```
1. Acesse: https://myaccount.google.com/apppasswords
2. Você será solicitado a fazer login
3. Se der erro, PRIMEIRO ative a "Verificação em 2 etapas":
   https://myaccount.google.com/signinoptions/two-step-verification
4. Depois volte e acesse: https://myaccount.google.com/apppasswords
5. Selecione:
   - App: "E-mail"
   - Dispositivo: "Outro" → digite "BarTab Render"
6. Clique em "Gerar"
7. COPIE a senha de 16 dígitos (sem espaços)
8. Cole em SMTP_PASS no Render
```

---

### 4️⃣ Salve e Aguarde o Redeploy

```
1. Clique em "Save Changes" no Render
2. O Render vai fazer redeploy automaticamente (leva ~2-5 minutos)
3. Acompanhe os logs
4. Quando terminar, procure por:
```

```
✅ Configuração de email carregada com sucesso
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: seu-email@gmail.com
```

**Se você vir isso, está tudo certo! 🎉**

---

### 5️⃣ Teste o Envio

```
1. Faça logout do sistema
2. Faça login com um email diferente (não eduardo.klug7@gmail.com)
3. Complete o cadastro de um novo estabelecimento
4. Verifique os logs do Render:
```

Você deve ver:

```
📤 Enviando alerta de novo cadastro para eduardo.klug7@gmail.com...
   Estabelecimento: Nome do Bar
   Proprietário: email@teste.com
✅ Alerta de novo cadastro enviado com sucesso para eduardo.klug7@gmail.com
```

---

## 🔍 Diagnóstico Avançado (Local)

Se você quiser testar localmente:

### Opção 1: Script de Diagnóstico

```bash
cd backend
npx ts-node diagnose-email.ts
```

Este script vai:
- ✅ Verificar se todas as variáveis estão configuradas
- ✅ Testar conexão SMTP
- ✅ Enviar um email de teste
- ✅ Mostrar erros detalhados se houver problemas

### Opção 2: Script de Teste Simples

```bash
cd backend
npx ts-node test-email.ts seu-email@gmail.com
```

---

## 🚨 Problemas Comuns

### ❌ "Invalid login"

**Causa:** Senha de App incorreta ou não gerada

**Solução:**
1. Gere uma nova Senha de App (siga o passo 3️⃣)
2. Certifique-se que a "Verificação em 2 etapas" está ativa
3. Copie a senha SEM espaços
4. Atualize SMTP_PASS no Render

---

### ❌ "ECONNREFUSED" ou "ETIMEDOUT"

**Causa:** Não consegue conectar ao servidor SMTP

**Solução:**
1. Verifique se SMTP_HOST está correto: `smtp.gmail.com`
2. Verifique se SMTP_PORT está correto: `587`
3. Tente usar porta 465 (menos comum)

---

### ❌ Email não chega na caixa de entrada

**Causa:** Pode estar indo para SPAM

**Solução:**
1. Verifique a pasta de SPAM
2. Procure por emails de `noreply@bartab.com`
3. Marque como "Não é spam"
4. Adicione `noreply@bartab.com` aos seus contatos

---

### ⚠️ "SMTP não configurado" nos logs

**Causa:** Variáveis SMTP_USER ou SMTP_PASS vazias/undefined

**Solução:**
1. Verifique no Dashboard do Render se as variáveis estão salvas
2. Os valores não devem estar vazios
3. Após salvar, aguarde o redeploy
4. Verifique os logs novamente

---

## 📋 Checklist de Verificação

Use esta lista para garantir que tudo está configurado:

- [ ] Verificação em 2 etapas ativada no Gmail
- [ ] Senha de App gerada
- [ ] SMTP_USER configurado no Render
- [ ] SMTP_PASS configurado no Render (senha de 16 dígitos)
- [ ] Redeploy concluído
- [ ] Logs mostram "✅ Configuração de email carregada com sucesso"
- [ ] Teste de envio realizado
- [ ] Email recebido (verifique SPAM também)

---

## 🆘 Ainda não funciona?

Se depois de seguir todos os passos ainda não funcionar:

1. **Verifique os logs do Render novamente**
   - Procure por mensagens de erro específicas
   - Copie o erro completo

2. **Considere usar SendGrid** (alternativa mais confiável)
   - 100 emails/dia grátis
   - Mais confiável que Gmail para produção
   - Veja detalhes em: `DIAGNOSTICO_EMAIL_PRODUCAO.md` (seção 4)

3. **Entre em contato com mais detalhes:**
   - Copie os logs de erro do Render
   - Informe se as variáveis estão configuradas
   - Informe se a senha de app foi gerada corretamente

---

## 📚 Documentação Completa

Para informações mais detalhadas, consulte:

- **Diagnóstico completo:** `DIAGNOSTICO_EMAIL_PRODUCAO.md`
- **Implementação RBAC:** `backend/RBAC_E_NOTIFICACOES.md`
- **Instalação:** `backend/INSTALL_RBAC.md`

---

## 💡 Dica Final

**O erro mais comum é não configurar as variáveis no Render!**

Lembre-se: as variáveis SMTP_USER e SMTP_PASS estão marcadas como `sync: false` no `render.yaml`, o que significa que você DEVE configurá-las manualmente no dashboard do Render. Elas não são copiadas automaticamente!

✅ **Verificou? Configure agora!** → https://dashboard.render.com

