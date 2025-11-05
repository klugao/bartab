# ✅ Comandos Corretos para Configurar a Wiki

## 🔧 Correção do Erro

O problema foi no nome da pasta. Use estes comandos:

```bash
# 1. Entre na pasta correta (SEM o .git no final)
cd ~/Documents/bartab.wiki

# 2. Copie os arquivos preparados
cp ~/Documents/bartab/wiki-files/*.md .

# 3. Adicione ao Git
git add .

# 4. Faça o commit
git commit -m "docs: adiciona documentação completa"

# 5. Envie para o GitHub
git push origin master
```

## 🎯 Execute linha por linha:

```bash
cd ~/Documents/bartab.wiki
```
```bash
cp ~/Documents/bartab/wiki-files/*.md .
```
```bash
git add .
```
```bash
git commit -m "docs: adiciona documentação completa"
```
```bash
git push origin master
```

## ✅ Pronto!

Acesse sua Wiki em:
`https://github.com/klugao/bartab/wiki`

