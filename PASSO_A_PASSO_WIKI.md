# 📝 Passo a Passo Visual - Configurar Wiki do GitHub

## 🎯 Tempo Estimado: 10-15 minutos

---

## ✅ PASSO 1: Ativar a Wiki no GitHub

### 1.1. Acesse o Repositório
- Vá para: `https://github.com/seu-usuario/bartab`
- Faça login se necessário

### 1.2. Entre nas Configurações
- Clique na aba **"⚙️ Settings"** (menu superior direito)

### 1.3. Habilite a Wiki
- Role a página até encontrar a seção **"Features"**
- Encontre a opção **"Wikis"**
- ✅ Marque a caixa de seleção
- A configuração é salva automaticamente

### 1.4. Verifique
- Volte para a página principal do repositório
- Você deve ver uma nova aba **"📖 Wiki"** no menu
- Clique nela

---

## ✅ PASSO 2: Criar a Primeira Página (Home)

### 2.1. Acesse a Wiki
- Clique na aba **"Wiki"**
- Você verá uma mensagem: *"Welcome to the bartab wiki!"*

### 2.2. Criar Home
- Clique em **"Create the first page"**
- O editor já abre com o nome **"Home"** (perfeito!)

### 2.3. Cole o Conteúdo
- Abra o arquivo: `/Users/eduardoklug/Documents/bartab/wiki-files/Home.md`
- **Copie TODO o conteúdo**
- **Cole** no editor da Wiki do GitHub

### 2.4. Ajuste os Links
- Substitua `seu-usuario` pelo seu usuário do GitHub
- Exemplo: `https://github.com/eduardoklug/bartab`

### 2.5. Salve
- Role até o final da página
- Campo "Edit message": `docs: cria página inicial da Wiki`
- Clique em **"Save Page"**

✅ **Primeira página criada!**

---

## ✅ PASSO 3: Criar o Menu Lateral (Sidebar)

### 3.1. Criar Nova Página
- Na Wiki, clique em **"New Page"**

### 3.2. Nome da Página
- No campo "Page name", digite: `_Sidebar`
- ⚠️ **IMPORTANTE:** O underline `_` é obrigatório!

### 3.3. Cole o Conteúdo
- Abra: `/Users/eduardoklug/Documents/bartab/wiki-files/_Sidebar.md`
- Copie TODO o conteúdo
- Cole no editor

### 3.4. Ajuste os Links
- Substitua `seu-usuario` pelo seu usuário do GitHub

### 3.5. Salve
- Edit message: `docs: adiciona menu lateral de navegação`
- Clique em **"Save Page"**

✅ **Menu lateral criado! Agora aparece em todas as páginas.**

---

## ✅ PASSO 4: Adicionar Páginas Principais

### 4.1. Página: Inicio-Rapido

**Criar página:**
- Clique em **"New Page"**
- Nome: `Inicio-Rapido`
- Conteúdo: Copie de `INICIO_RAPIDO.md`
- Salve

### 4.2. Página: CI-CD

**Criar página:**
- Clique em **"New Page"**
- Nome: `CI-CD`
- Conteúdo: Já está pronto em `wiki-files/CI-CD.md`
- Salve

### 4.3. Página: Testes

**Criar página:**
- Clique em **"New Page"**
- Nome: `Testes`
- Conteúdo: Já está pronto em `wiki-files/Testes.md`
- Salve

### 4.4. Página: Arquitetura

**Criar página:**
- Clique em **"New Page"**
- Nome: `Arquitetura`
- Conteúdo: Copie de `docs/architecture.md`
- Salve

---

## ✅ PASSO 5: Páginas Adicionais (Opcional)

### Prioridade ALTA (recomendado criar):
- [ ] **Deploy** (copiar de `DEPLOY_RENDER.md`)
- [ ] **Seguranca** (copiar de `docs/security.md`)
- [ ] **RBAC** (copiar de `README_RBAC.md`)
- [ ] **LGPD** (copiar de `README_LGPD.md`)

### Prioridade MÉDIA:
- [ ] **Banco-de-Dados** (copiar de `docs/db-schema.md`)
- [ ] **Requisitos** (copiar de `docs/requirements.md`)
- [ ] **PWA** (copiar de `PWA_IMPLEMENTATION.md`)

### Prioridade BAIXA:
- [ ] **Troubleshooting** (compilar os CORRECAO_*.md)
- [ ] **User-Stories** (copiar de `docs/user-stories.md`)

---

## ✅ PASSO 6: Atualizar README do Repositório

### 6.1. Adicione Link para a Wiki
Abra o arquivo `README.md` do repositório e adicione:

```markdown
## 📚 Documentação Completa

✨ **Acesse nossa [Wiki do Projeto](https://github.com/seu-usuario/bartab/wiki)** para documentação detalhada sobre:
- Arquitetura e Design
- Guias de Início Rápido
- CI/CD e Deploy
- Testes (TDD)
- Segurança e Conformidade
- E muito mais!
```

### 6.2. Commit e Push
```bash
git add README.md
git commit -m "docs: adiciona link para a Wiki"
git push origin main
```

---

## ✅ PASSO 7: Verificação Final

### Checklist:
- [ ] Wiki está visível na aba do repositório
- [ ] Página Home está acessível
- [ ] Menu lateral (_Sidebar) aparece em todas as páginas
- [ ] Links internos funcionam (ex: clicar em [[CI-CD]])
- [ ] Páginas principais criadas (mínimo 5)
- [ ] README.md tem link para a Wiki
- [ ] Sem erros de formatação

---

## 🎉 Pronto!

### Compartilhe sua Wiki:
```
https://github.com/seu-usuario/bartab/wiki
```

### Apresente aos Professores:
✅ **Documentação em Wiki junto com repositório** - ATENDIDO!  
✅ **CI/CD via GitHub Actions** - ATENDIDO!  
✅ **TDD com 126 testes** - ATENDIDO!

---

## 💡 Dicas Extras

### Sintaxe de Links na Wiki:
```markdown
[[Nome-da-Pagina]]                    # Link simples
[[Texto customizado|Nome-da-Pagina]]  # Link com texto
```

### Adicionar Imagens:
1. Faça upload da imagem no repositório (ex: em `/docs/images/`)
2. Na Wiki, use:
```markdown
![Alt text](https://raw.githubusercontent.com/seu-usuario/bartab/main/docs/images/diagram.png)
```

### Editar Páginas Existentes:
- Abra a página na Wiki
- Clique em **"Edit"** (canto superior direito)
- Faça as alterações
- Salve

---

## 🚨 Problemas Comuns

### "Wiki não aparece nas abas"
- Verifique se está habilitada em Settings > Features > Wikis

### "Links internos não funcionam"
- Use a sintaxe correta: `[[Nome-da-Pagina]]`
- Nomes de página são case-sensitive

### "Imagens não carregam"
- Use URLs absolutas (raw.githubusercontent.com)
- Verifique se a imagem está no repositório

---

## 📞 Precisa de Ajuda?

- 📖 [GitHub Wiki Documentation](https://docs.github.com/en/communities/documenting-your-project-with-wikis)
- 💬 Pergunte aos professores ou colegas

---

**Boa sorte com sua apresentação! 🎓**

