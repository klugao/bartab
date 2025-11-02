# 🔍 Como Obter a DATABASE_URL do Supabase

## 📍 Método 1: Connection Pooling (Recomendado)

### Passo a Passo:

1. **Acesse:** https://app.supabase.com
2. **Clique** no seu projeto `bartab`
3. **Menu lateral esquerdo:** Clique em ⚙️ **"Settings"** (ícone de engrenagem)
4. Na seção Settings, clique em **"Database"**
5. **Role a página para baixo** até encontrar a seção **"Connection string"**

### Você verá várias abas/opções:

```
Connection string
┌─────────────────────────────────────┐
│  URI    Session    Transaction      │
└─────────────────────────────────────┘
```

6. **Clique na aba "Transaction"** (não "URI" ou "Session")
7. Você verá algo como:

```
postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**Características da URL correta:**
- ✅ Contém `.pooler.supabase.com`
- ✅ Porta: **6543**
- ✅ Tem `[YOUR-PASSWORD]` que você precisa substituir

---

## 📍 Método 2: Conexão Direta (Alternativa - Funciona Igual!)

Se você não encontrar a Connection Pooling, use a conexão direta:

### Passo a Passo:

1. **Acesse:** https://app.supabase.com
2. **Clique** no seu projeto `bartab`
3. **Menu lateral:** ⚙️ **Settings** → **Database**
4. Na seção **"Connection string"**
5. **Clique na aba "URI"** (primeira aba)
6. Você verá:

```
postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
```

**Características da URL direta:**
- ✅ Contém `db.xxxxxxx.supabase.co`
- ✅ Porta: **5432**
- ✅ Tem `[YOUR-PASSWORD]` que você precisa substituir

**⚠️ Importante:** Ao usar esta URL, adicione o parâmetro SSL no final:

```
postgresql://postgres:[SUA-SENHA]@db.abcdefghijk.supabase.co:5432/postgres?sslmode=require
```

---

## 🔑 Onde Está Minha Senha?

A senha foi definida quando você criou o projeto. **Não tem como ver a senha antiga.**

### Se Não Lembra a Senha:

1. No Supabase: **Settings** → **Database**
2. Role até a seção **"Database password"**
3. Clique em **"Reset database password"**
4. **Digite uma nova senha** (e salve em algum lugar!)
5. Clique em **"Update password"**
6. Use essa nova senha na DATABASE_URL

---

## 📝 Montando sua DATABASE_URL

### Exemplo com Connection Pooling (porta 6543):
```bash
# ANTES (com placeholder):
postgresql://postgres.xyz:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# DEPOIS (com sua senha - exemplo: minhasenha123):
postgresql://postgres.xyz:minhasenha123@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

### Exemplo com Conexão Direta (porta 5432):
```bash
# ANTES (com placeholder):
postgresql://postgres:[YOUR-PASSWORD]@db.xyz.supabase.co:5432/postgres

# DEPOIS (com sua senha e SSL - exemplo: minhasenha123):
postgresql://postgres:minhasenha123@db.xyz.supabase.co:5432/postgres?sslmode=require
```

---

## ✅ Testando a URL Localmente (Opcional)

Antes de colocar no Render, teste localmente:

```bash
cd backend

# Adicione temporariamente ao .env ou exporte:
export DATABASE_URL="postgresql://postgres:suasenha@db.xyz.supabase.co:5432/postgres?sslmode=require"

# Teste:
npm run start:dev
```

Se conectar sem erros, a URL está correta! ✅

---

## 🚀 Colocando no Render

### Opção A: Via Dashboard (Mais Fácil)

1. Acesse: https://dashboard.render.com
2. Clique em **bartab-backend**
3. Menu lateral: **Environment**
4. Encontre `DATABASE_URL` (ou adicione se não existir)
5. Cole sua URL completa (com a senha já substituída)
6. Clique em **"Save Changes"**
7. Aguarde o redeploy automático

### Opção B: Via Shell do Render

Se já estiver no Shell:
```bash
# Verificar se existe:
echo $DATABASE_URL

# Se não mostrar nada, precisa adicionar via Dashboard
```

---

## 🔍 Verificando se Funcionou

### No Render:

Após o deploy, vá em **Logs** e procure por:

```
✅ BOM (conectou):
[TypeOrmModule] TypeOrmModule dependencies initialized
Nest application successfully started

❌ RUIM (não conectou):
ECONNREFUSED
Unable to connect to the database
```

### No Supabase:

1. **Table Editor** (menu lateral)
2. Depois do seed, você deve ver tabelas:
   - users
   - establishments
   - customers
   - items
   - tabs
   - payments

---

## 🆘 Ainda Não Conseguiu?

Me envie o seguinte (SEM A SENHA!):

1. **Formato da URL que você encontrou:**
   ```
   postgresql://postgres:XXXXX@db.?????.supabase.co:????/postgres
   ```
   (substitua a senha por XXXXX)

2. **Qual porta aparece?** 5432 ou 6543?

3. **Onde você encontrou?** Settings → Database → Connection string → (qual aba?)

4. **Mensagem de erro nos logs do Render** (se houver)

---

## 📌 Dica Rápida

**Use a conexão direta (porta 5432) com SSL:**

É mais simples e funciona perfeitamente! Só não esqueça de adicionar `?sslmode=require` no final.

Exemplo:
```
postgresql://postgres:suasenha@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

Substitua:
- `suasenha` → sua senha real
- `xxxxx` → o ID único do seu projeto

---

**✅ A configuração SSL no código já está pronta, então qualquer uma das URLs vai funcionar!**


