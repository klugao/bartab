# 🔍 Como Verificar os Logs do Render

## Passo a Passo

1. **Acesse:** https://dashboard.render.com
2. **Clique em:** `bartab-backend`
3. **Clique em:** `Logs` (menu lateral esquerdo)
4. **Procure por:**

### ✅ Se estiver OK:
```
✅ Configuração de email carregada com sucesso
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: eduardo.klug7@gmail.com
```

### ❌ Se tiver problema:
Procure por mensagens como:

```
❌ CONFIGURAÇÃO DE EMAIL INCOMPLETA!
```

ou

```
❌ Erro ao enviar alerta de novo cadastro: [mensagem de erro]
```

ou

```
⚠️  Email não enviado: SMTP não configurado
```

---

## 🧪 Testar Agora

Para forçar um envio de email e ver o erro:

1. **Faça logout** do sistema
2. **Faça login com um email DIFERENTE** (não eduardo.klug7@gmail.com)
3. **Complete o cadastro** de um novo estabelecimento
4. **IMEDIATAMENTE vá nos Logs do Render** e veja o que aparece

---

## 📋 O que procurar nos logs:

### Cenário 1: Senha de App Inválida
```
❌ Erro ao enviar: Invalid login: 535 5.7.8 Username and Password not accepted
```
**Solução:** Gerar nova senha de app no Gmail

### Cenário 2: Conexão Recusada
```
❌ Erro ao enviar: connect ECONNREFUSED
```
**Solução:** Verificar SMTP_HOST e SMTP_PORT

### Cenário 3: Timeout
```
❌ Erro ao enviar: connect ETIMEDOUT
```
**Solução:** Render pode estar bloqueando a porta 587

### Cenário 4: Email sendo enviado mas não chega
```
✅ Alerta de novo cadastro enviado com sucesso
```
**Solução:** Verificar pasta de SPAM

---

## 🚨 COPIE E COLE

Por favor, **copie e cole aqui** as mensagens de log que aparecem quando você tenta fazer um novo cadastro.

Especialmente procure por linhas que contenham:
- `NotificationService`
- `SMTP`
- `email`
- `Erro`
- `❌`
- `⚠️`

