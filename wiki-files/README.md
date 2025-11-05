# 📁 Arquivos Preparados para a Wiki

Esta pasta contém os arquivos principais que devem ser copiados para a Wiki do GitHub.

## 📝 Como Usar

### Método 1: Manual (Interface do GitHub)
1. Acesse: `https://github.com/seu-usuario/bartab/wiki`
2. Para cada arquivo desta pasta:
   - Clique em "New Page"
   - Cole o conteúdo
   - Salve

### Método 2: Automático (Git Clone)
1. Clone a Wiki:
```bash
cd ~/Documents
git clone https://github.com/seu-usuario/bartab.wiki.git
cd bartab.wiki.git
```

2. Copie os arquivos:
```bash
cp ~/Documents/bartab/wiki-files/*.md .
```

3. Faça commit e push:
```bash
git add .
git commit -m "docs: adiciona documentação completa"
git push origin master
```

## 📋 Lista de Arquivos

- `Home.md` - Página inicial (OBRIGATÓRIO)
- `_Sidebar.md` - Menu lateral (OBRIGATÓRIO)
- `Inicio-Rapido.md` - Guia de início rápido
- `CI-CD.md` - Documentação do pipeline
- `Testes.md` - Documentação de testes
- E outros...

## ✅ Ordem Recomendada de Upload

1. **Home.md** (sempre primeiro!)
2. **_Sidebar.md** (menu de navegação)
3. **Inicio-Rapido.md**
4. **Arquitetura.md**
5. **Testes.md**
6. **CI-CD.md**
7. Demais páginas conforme necessidade

---

**Importante:** Renomeie os arquivos conforme necessário para URLs amigáveis na Wiki.

