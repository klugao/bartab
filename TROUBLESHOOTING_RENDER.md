# 🔧 Troubleshooting - Render Deploy

## Problema: 404 Not Found em Todas as Rotas

### Sintomas
```bash
curl https://bartab-backend.onrender.com/api/health
# {"reason":"Not Found","error":true}
```

### Causas Possíveis

#### 1. **Deploy Não Foi Executado**

**Como verificar:**
1. Acesse: https://dashboard.render.com
2. Selecione seu serviço `bartab-backend`
3. Vá em "Events" ou "Logs"
4. Verifique se há um deploy recente com suas mudanças

**Solução:**
```bash
# Opção A: Via Dashboard
# 1. Dashboard → Seu Serviço → "Manual Deploy" → "Deploy latest commit"

# Opção B: Via Git (force deploy)
git commit --allow-empty -m "chore: trigger Render deploy"
git push origin main
```

#### 2. **Build ou Start Falhando**

**Como verificar:**
1. Dashboard → Seu Serviço → "Logs"
2. Procure por erros em vermelho
3. Verifique a seção "Build" e "Deploy"

**Erros comuns:**

##### A) Falta de Memória
```
npm ERR! code ELIFECYCLE
npm ERR! errno 137
```

**Solução:** Upgrade para plano pago ou otimizar build

##### B) Dependências Faltando
```
Error: Cannot find module '@nestjs/core'
```

**Solução:**
```bash
cd backend
npm install
git add package-lock.json
git commit -m "fix: atualiza dependências"
git push
```

##### C) TypeScript Build Error
```
error TS2304: Cannot find name 'xxx'
```

**Solução:** Corrigir erros de tipo localmente primeiro:
```bash
cd backend
npm run build
```

#### 3. **Comando de Start Incorreto**

**Como verificar:**

Verifique em `render.yaml` ou no Dashboard → Settings → Start Command

**Deve ser:**
```bash
npm run start:prod
# OU
node dist/main.js
```

**NÃO deve ser:**
```bash
npm run start:dev  # ❌ Não funciona em produção!
```

#### 4. **Porta Incorreta**

O Render define a porta via variável `PORT`. Verifique em `main.ts`:

```typescript
// ✅ CORRETO
const port = process.env.PORT || 3000;
await app.listen(port);

// ❌ ERRADO
await app.listen(3000); // Ignora PORT do Render!
```

**Solução:** Atualizar `main.ts`:

<function_calls>
<invoke name="read_file">
<parameter name="target_file">/Users/eduardoklug/Documents/bartab/backend/src/main.ts
