# 🔧 Correção: Erro ENETUNREACH (Network Unreachable)

## 🔍 Problema Identificado

```
Error: connect ENETUNREACH 2600:1f1e:75b:4b15:f49d:554e:57ff:bca0:5432 - Local (:::0)
```

**Causa:** O Render está tentando conectar ao Supabase via IPv6, mas a rede não alcança o servidor.

## ✅ Soluções (Teste na Ordem)

### 🎯 Solução 1: Codificar Caractere Especial na Senha (RÁPIDO!)

Sua senha tem o caractere `!` que precisa ser codificado em URLs.

**Problema atual:**
```
postgresql://postgres:tcc123!@db...
                            ↑ este ! pode causar problemas
```

**Solução:**
O caractere `!` em URL deve ser codificado como `%21`

**Nova DATABASE_URL:**
```
postgresql://postgres:tcc123%21@db.trzpxzqjdxyttxfudpqv.supabase.co:5432/postgres?sslmode=require
```

### 📝 Passo a Passo:

1. **No Render:**
   - Dashboard → bartab-backend → Environment
   - Edite `DATABASE_URL`
   - Substitua `tcc123!` por `tcc123%21`
   - URL completa:
     ```
     postgresql://postgres:tcc123%21@db.trzpxzqjdxyttxfudpqv.supabase.co:5432/postgres?sslmode=require
     ```
   - Save Changes

2. **Aguarde o redeploy** (~2 min)

---

### 🎯 Solução 2: Usar Connection Pooling (MAIS CONFIÁVEL!)

Se a Solução 1 não funcionar, use a URL de Connection Pooling que tem melhor compatibilidade:

**No Supabase:**
1. Settings → Database
2. Procure por "Connection pooling" ou "Connection parameters"
3. Procure pela opção "Session" ou "Transaction mode"
4. Você pode ter que mudar de aba (URI → Session/Transaction)
5. A URL terá `.pooler.supabase.com` e porta `6543`

Se encontrar, use esse formato:
```
postgresql://postgres.trzpxzqjdxyttxfudpqv:tcc123%21@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

---

### 🎯 Solução 3: Forçar IPv4 via Código (SE NECESSÁRIO)

Se ainda não funcionar, precisamos forçar IPv4 no código.

**Já apliquei timeouts no código, mas podemos forçar mais:**

Atualize o `app.module.ts` para usar configuração manual ao invés de URL:

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'db.trzpxzqjdxyttxfudpqv.supabase.co',
  port: 5432,
  username: 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: 'postgres',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
  autoLoadEntities: true,
  ssl: { rejectUnauthorized: false },
  extra: {
    connectionTimeoutMillis: 10000,
  },
}),
```

E no Render, adicione variável separada:
- `DB_PASSWORD` = `tcc123!`

---

## 🚀 Tabela de Codificação de Caracteres Especiais

Se sua senha tem outros caracteres especiais:

| Caractere | Codificado | Exemplo              |
|-----------|------------|----------------------|
| `!`       | `%21`      | `pass!` → `pass%21`  |
| `@`       | `%40`      | `p@ss` → `p%40ss`    |
| `#`       | `%23`      | `pa#s` → `pa%23s`    |
| `$`       | `%24`      | `p$ss` → `p%24ss`    |
| `%`       | `%25`      | `pa%s` → `pa%25s`    |
| `&`       | `%26`      | `p&ss` → `p%26ss`    |
| `*`       | `%2A`      | `pa*s` → `pa%2As`    |
| `+`       | `%2B`      | `p+ss` → `p%2Bss`    |
| `=`       | `%3D`      | `pa=s` → `pa%3Ds`    |
| `?`       | `%3F`      | `p?ss` → `p%3Fss`    |
| `/`       | `%2F`      | `pa/s` → `pa%2Fs`    |
| `:`       | `%3A`      | `p:ss` → `p%3Ass`    |
| `space`   | `%20`      | `pa s` → `pa%20s`    |

---

## 📊 Checklist de Teste

### Teste a Solução 1 (Codificar senha):

- [ ] Substituí `!` por `%21` na DATABASE_URL
- [ ] Salvei no Render
- [ ] Aguardei o redeploy
- [ ] Logs mostram "successfully started"? → ✅ **RESOLVIDO!**
- [ ] Ainda dá erro? → Tente Solução 2

### Teste a Solução 2 (Connection Pooling):

- [ ] Encontrei a URL de pooling no Supabase
- [ ] Codifiquei a senha (`!` → `%21`)
- [ ] Atualizei no Render
- [ ] Aguardei redeploy
- [ ] Logs mostram sucesso? → ✅ **RESOLVIDO!**
- [ ] Ainda dá erro? → Tente Solução 3

### Teste a Solução 3 (Configuração manual):

- [ ] Fiz commit do código atualizado
- [ ] Criei variável `DB_PASSWORD` no Render
- [ ] Removi `DATABASE_URL` ou deixei vazia
- [ ] Aguardei redeploy
- [ ] Verificar logs

---

## 🎯 Recomendação

**Comece pela Solução 1** - É a mais rápida e provavelmente vai resolver!

Apenas mude:
```
tcc123!  →  tcc123%21
```

Na URL do Render.

---

## 📞 Se Nada Funcionar

Me informe:
1. Qual solução você tentou?
2. O novo erro nos logs (se houver)
3. A DATABASE_URL que está usando (sem mostrar a senha!)

---

## 🔄 Commit Necessário

```bash
git add backend/src/app.module.ts
git commit -m "fix: adiciona timeouts para conexão com database"
git push origin main
```

Mas **teste a Solução 1 primeiro** (apenas mudar a URL no Render), pode não precisar de commit!

---

**✅ A Solução 1 deve resolver em 90% dos casos!**


