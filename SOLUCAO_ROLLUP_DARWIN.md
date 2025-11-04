# 🔧 Solução para Erro do Rollup no Mac ARM64

## ❌ Problema

```
Error: Cannot find module @rollup/rollup-darwin-arm64
```

## ✅ Soluções (Tente na ordem)

### Solução 1: Limpar e Reinstalar (Mais Simples)

```bash
cd /Users/eduardoklug/Documents/bartab/frontend

# 1. Remover tudo
rm -rf node_modules package-lock.json

# 2. Limpar cache do npm
npm cache clean --force

# 3. Reinstalar com flag --force
npm install --force

# 4. Tentar iniciar
npm run dev
```

### Solução 2: Usar PNPM (Recomendado)

O PNPM gerencia melhor dependências opcionais:

```bash
# 1. Instalar pnpm globalmente
npm install -g pnpm

# 2. Ir para o frontend
cd /Users/eduardoklug/Documents/bartab/frontend

# 3. Remover node_modules antigo
rm -rf node_modules package-lock.json

# 4. Instalar com pnpm
pnpm install

# 5. Iniciar com pnpm
pnpm dev
```

### Solução 3: Usar Yarn

```bash
# 1. Instalar yarn globalmente (se não tiver)
npm install -g yarn

# 2. Ir para o frontend
cd /Users/eduardoklug/Documents/bartab/frontend

# 3. Remover node_modules antigo
rm -rf node_modules package-lock.json

# 4. Instalar com yarn
yarn install

# 5. Iniciar com yarn
yarn dev
```

### Solução 4: Forçar Instalação do Pacote Correto

```bash
cd /Users/eduardoklug/Documents/bartab/frontend

# Tentar instalar o pacote específico para ARM64
npm install --save-optional @rollup/rollup-darwin-arm64

# Se der erro, tentar instalar todas as variantes
npm install --save-optional @rollup/rollup-darwin-arm64 @rollup/rollup-darwin-x64

# Depois tentar iniciar
npm run dev
```

### Solução 5: Downgrade do Vite/Rollup

Se nada funcionar, downgrade temporário:

```bash
cd /Users/eduardoklug/Documents/bartab/frontend

# Instalar versões mais antigas e estáveis
npm install vite@5.0.0 --save-dev
npm install

npm run dev
```

## 🎯 Verificar se Funcionou

Após qualquer solução, você deve ver:

```
VITE v7.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5175/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## 📱 Testar Funcionalidade Offline

Quando o servidor estiver rodando:

1. Abra http://localhost:5175
2. Abra DevTools (F12)
3. Vá para Network tab
4. Marque "Offline"
5. Teste criar conta e adicionar itens
6. Desmarque "Offline" e veja a sincronização!

## 🔍 Debug

Se ainda não funcionar, verifique:

```bash
# Ver versão do Node
node -v
# Deve ser v20 ou v22

# Ver arquitetura do Mac
uname -m
# Deve mostrar "arm64" para M1/M2/M3

# Ver qual rollup está instalado
npm list rollup
npm list @rollup/rollup-darwin-arm64
```

## 💡 Por que isso acontece?

Este é um bug conhecido do npm com dependências opcionais. O rollup precisa de pacotes nativos específicos para cada plataforma (Windows, Linux, Mac Intel, Mac ARM), e às vezes o npm não consegue resolver corretamente qual instalar.

## ✅ Mudanças Já Aplicadas no Código

Já modifiquei:

1. ✅ `package.json` - Removida dependência do Linux
2. ✅ `package.json` - Script `dev` usa `ROLLUP_USE_NATIVE=false`
3. ✅ `vite.config.ts` - Configurações otimizadas

Essas mudanças devem ajudar, mas o problema pode persistir por causa do cache do npm no seu sistema.

## 🎉 Próximos Passos

Depois que conseguir iniciar:

1. Teste a funcionalidade offline
2. Verifique se as contas são criadas offline
3. Teste se os itens são adicionados
4. Teste a sincronização automática

Tudo deve funcionar perfeitamente! 🚀

