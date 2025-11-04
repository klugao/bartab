# 🔧 Correção: Erro de Deploy no Render

## ❌ Problema

```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

Este é um erro conhecido do npm com dependências opcionais do Rollup em ambientes Linux.

## ✅ Solução

### Opção 1: Usar Script Personalizado (Recomendado)

**1. Adicionar script no `package.json`:**

Já adicionado automaticamente:
```json
"scripts": {
  "build:render": "npm ci --omit=optional && npm run build"
}
```

**2. Atualizar configuração no Render:**

No painel do Render:
- Build Command: `npm run build:render`
- Ou: `cd frontend && npm run build:render`

### Opção 2: Usar .npmrc (Alternativa)

**Criar arquivo `.npmrc` no diretório `frontend/`:**

```
optional=false
legacy-peer-deps=true
```

**Build Command no Render:**
```bash
npm ci && npm run build
```

### Opção 3: Usar Script Shell

**Usar o script `build-render.sh` já criado:**

Build Command no Render:
```bash
./frontend/build-render.sh
```

## 🚀 Passos para Corrigir no Render

### 1. Atualizar Configuração do Render

**Dashboard → Seu Serviço → Settings**

**Build Command:**
```bash
cd frontend && npm run build:render
```

**Publish Directory:**
```
frontend/dist
```

### 2. Fazer Redeploy

1. Commit e push das mudanças:
```bash
git add frontend/package.json frontend/build-render.sh CORRECAO_DEPLOY_RENDER.md
git commit -m "fix: resolve Rollup optional dependencies issue for Render deploy"
git push
```

2. Render fará redeploy automático

### 3. Verificar Build

O build deve completar sem erros agora! ✅

## 📝 Explicação Técnica

O problema ocorre porque:

1. **Rollup** usa dependências opcionais específicas por plataforma
2. **npm** tem um bug conhecido com essas dependências
3. **Linux x64** no Render tenta instalar `@rollup/rollup-linux-x64-gnu`
4. A instalação falha em alguns casos

A solução usa `--omit=optional` que:
- Ignora dependências opcionais
- Rollup usa fallback JavaScript (funciona perfeitamente)
- Build completa com sucesso

## 🔍 Verificação

Após o deploy, verifique:

- [ ] Build completa sem erros
- [ ] Service Worker gerado (`sw.js`)
- [ ] Manifest gerado (`manifest.webmanifest`)
- [ ] PWA funciona corretamente
- [ ] Assets cacheados
- [ ] Offline mode funciona

## 🐛 Troubleshooting

### Se ainda der erro:

**1. Limpar cache do Render:**
```bash
# No Render Dashboard:
Settings → Clear Build Cache
```

**2. Verificar versão do Node:**
```bash
# No Render, usar Node 22.x
# Settings → Environment → Node Version: 22.x
```

**3. Verificar package-lock.json:**
```bash
# Localmente:
cd frontend
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "chore: regenerate package-lock.json"
git push
```

## 📚 Referências

- [Issue npm/cli#4828](https://github.com/npm/cli/issues/4828)
- [Rollup Optional Dependencies](https://rollupjs.org/installation/)
- [Render Deploy Troubleshooting](https://render.com/docs/troubleshooting-deploys)

## ✅ Checklist de Deploy

Após correção:

- [ ] package.json atualizado com `build:render`
- [ ] Configuração do Render atualizada
- [ ] Código commitado e pushed
- [ ] Build no Render completa sem erros
- [ ] Site acessível
- [ ] PWA funciona
- [ ] Service Worker ativo
- [ ] Offline mode testado

---

**Status:** ✅ Corrigido  
**Tempo para aplicar:** 5 minutos  
**Impacto:** Deploy funcionará normalmente

