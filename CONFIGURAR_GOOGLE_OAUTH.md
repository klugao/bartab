# 🔐 Configurar Google OAuth - Guia Completo

## ⏱️ Tempo: ~10 minutos

---

## 📋 Pré-requisitos

Tenha em mãos as URLs de produção:

```
Frontend: https://bartab-frontend-[seu-id].onrender.com
Backend: https://bartab-backend-n6nm.onrender.com
```

---

## 🚀 Passo a Passo

### **1️⃣ Acessar Google Cloud Console**

1. Acesse: https://console.cloud.google.com
2. Faça login com sua conta Google

---

### **2️⃣ Criar Projeto (se não tiver)**

1. No topo da página, clique no seletor de projetos
2. Clique em **"NEW PROJECT"**
3. **Project name:** `BarTab`
4. Clique em **"CREATE"**
5. Aguarde a criação (~10 segundos)
6. Selecione o projeto criado

---

### **3️⃣ Habilitar Google+ API**

1. Menu lateral (☰) → **APIs & Services** → **Library**
2. Na busca, digite: `Google+ API`
3. Clique em **"Google+ API"**
4. Clique em **"ENABLE"**
5. Aguarde ativar

---

### **4️⃣ Configurar OAuth Consent Screen**

1. Menu lateral (☰) → **APIs & Services** → **OAuth consent screen**
2. Selecione **"External"**
3. Clique em **"CREATE"**

**Tela 1 - App information:**
- **App name:** `BarTab`
- **User support email:** [seu email]
- **App logo:** (opcional)
- **Application home page:** sua URL do frontend
- **Developer contact information:** [seu email]
- Clique em **"SAVE AND CONTINUE"**

**Tela 2 - Scopes:**
- Clique em **"ADD OR REMOVE SCOPES"**
- Selecione:
  - `userinfo.email`
  - `userinfo.profile`
  - `openid`
- Clique em **"UPDATE"**
- Clique em **"SAVE AND CONTINUE"**

**Tela 3 - Test users:**
- Clique em **"+ ADD USERS"**
- Adicione seu email (que vai usar para testar)
- Clique em **"ADD"**
- Clique em **"SAVE AND CONTINUE"**

**Tela 4 - Summary:**
- Clique em **"BACK TO DASHBOARD"**

---

### **5️⃣ Criar Credenciais OAuth**

1. Menu lateral (☰) → **APIs & Services** → **Credentials**
2. Clique em **"+ CREATE CREDENTIALS"**
3. Selecione **"OAuth client ID"**

**Configure:**

- **Application type:** `Web application`
- **Name:** `BarTab Production`

**Authorized JavaScript origins:**

Clique em **"+ ADD URI"** e adicione:

```
https://bartab-frontend-[seu-id].onrender.com
```

Clique em **"+ ADD URI"** novamente e adicione:

```
https://bartab-backend-n6nm.onrender.com
```

**Authorized redirect URIs:**

Clique em **"+ ADD URI"** e adicione:

```
https://bartab-backend-n6nm.onrender.com/api/auth/google/callback
```

⚠️ **Importante:** Substitua `[seu-id]` pela URL real do seu frontend!

4. Clique em **"CREATE"**

---

### **6️⃣ Copiar Credenciais**

Após criar, aparecerá um modal com:

- **Your Client ID:** 
  ```
  123456789-abc123def456.apps.googleusercontent.com
  ```
  **📋 COPIE E SALVE!**

- **Your Client Secret:**
  ```
  GOCSPX-abc123def456ghi789
  ```
  **📋 COPIE E SALVE!**

---

### **7️⃣ Configurar no Render (Backend)**

1. Acesse: https://dashboard.render.com
2. Vá no serviço **bartab-backend**
3. Menu lateral: **Environment**
4. Adicione/edite as seguintes variáveis:

**GOOGLE_CLIENT_ID**
```
[Cole o Client ID aqui]
```

**GOOGLE_CLIENT_SECRET**
```
[Cole o Client Secret aqui]
```

**GOOGLE_CALLBACK_URL**
```
https://bartab-backend-n6nm.onrender.com/api/auth/google/callback
```

**FRONTEND_URL** (se não tiver)
```
https://bartab-frontend-[seu-id].onrender.com
```

**CORS_ORIGIN** (se não tiver)
```
https://bartab-frontend-[seu-id].onrender.com
```

5. Clique em **"Save Changes"**
6. Aguarde redeploy do backend (~5 minutos)

---

### **8️⃣ Aguardar Deploy do Frontend**

O frontend também vai fazer redeploy automático (~3 minutos)

---

## ✅ Testar

1. Abra: `https://bartab-frontend-[seu-id].onrender.com`
2. Clique em **"Entrar com Google"**
3. Deve redirecionar para o Google
4. Escolha sua conta Google
5. Autorize o app
6. Deve voltar para o BarTab já logado! 🎉

---

## ⚠️ Se Der Erro "redirect_uri_mismatch"

Isso significa que a URI de redirecionamento não está configurada corretamente.

**Solução:**

1. Copie a URL EXATA do erro que aparece
2. Volte no Google Cloud Console
3. **Credentials** → edite o OAuth Client ID
4. Adicione a URL exata na seção **"Authorized redirect URIs"**
5. Salve
6. Aguarde ~1 minuto e tente novamente

---

## 🔧 Troubleshooting

### ❌ "Error 400: redirect_uri_mismatch"

**Causa:** URI de callback não está na lista autorizada

**Solução:**
- Verifique se adicionou: `https://bartab-backend-n6nm.onrender.com/api/auth/google/callback`
- Sem espaços, sem barra no final
- Aguarde 1 minuto após salvar

### ❌ "This app isn't verified"

**Normal!** É porque o app está em modo "Testing".

**Solução:**
- Clique em **"Advanced"**
- Clique em **"Go to BarTab (unsafe)"** (é seguro, é seu app!)
- OU adicione seu email nos **Test users**

### ❌ "Access blocked: This app's request is invalid"

**Causa:** Faltou habilitar Google+ API

**Solução:**
- Volte no passo 3 e habilite a API
- Aguarde 1-2 minutos

### ❌ Redireciona mas não faz login

**Verificar:**
1. Backend → Environment → `FRONTEND_URL` está correto?
2. Backend → Logs → tem algum erro?
3. As variáveis `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão configuradas?

---

## 📊 Checklist Final

- [ ] Projeto criado no Google Cloud
- [ ] Google+ API habilitada
- [ ] OAuth Consent Screen configurado
- [ ] Test users adicionados
- [ ] OAuth Client ID criado
- [ ] Client ID e Secret copiados
- [ ] Variáveis configuradas no Render
- [ ] Backend redployado (Status: Live)
- [ ] Frontend redeployado (Status: Live)
- [ ] Consegui fazer login com Google ✅

---

## 🎉 Pronto!

Seu Google OAuth está configurado! Agora você e qualquer usuário adicionado nos **Test users** podem fazer login.

---

## 🔐 Publicar o App (Opcional)

Por padrão, o app fica em modo "Testing" (máximo 100 usuários).

Para liberar para todo mundo:

1. Google Cloud Console
2. **OAuth consent screen**
3. Clique em **"PUBLISH APP"**
4. Clique em **"CONFIRM"**
5. Google vai revisar (pode levar alguns dias)

**Mas para uso pessoal/testes, modo Testing é suficiente!**

---

## 📝 Informações Importantes

**URLs Autorizadas (para referência):**

```
JavaScript Origins:
- https://bartab-frontend-[seu-id].onrender.com
- https://bartab-backend-n6nm.onrender.com

Redirect URIs:
- https://bartab-backend-n6nm.onrender.com/api/auth/google/callback
```

**Variáveis no Render:**
```
GOOGLE_CLIENT_ID=[seu client id]
GOOGLE_CLIENT_SECRET=[seu client secret]
GOOGLE_CALLBACK_URL=https://bartab-backend-n6nm.onrender.com/api/auth/google/callback
FRONTEND_URL=https://bartab-frontend-[seu-id].onrender.com
CORS_ORIGIN=https://bartab-frontend-[seu-id].onrender.com
```

---

**✅ Configuração completa! Bom uso do BarTab!** 🚀

