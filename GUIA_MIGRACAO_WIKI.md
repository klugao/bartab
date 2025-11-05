# 📚 Guia de Migração para Wiki do GitHub

## 🎯 Objetivo
Migrar a documentação existente do repositório para a Wiki do GitHub, atendendo aos requisitos dos professores.

## 📋 Passo a Passo

### **PASSO 1: Ativar a Wiki no GitHub** ⬅️ COMECE AQUI

1. Acesse seu repositório no GitHub: `https://github.com/seu-usuario/bartab`

2. Clique na aba **"Settings"** (Configurações) no menu superior

3. Role a página até a seção **"Features"** (Recursos)

4. Marque a caixa **"Wikis"** para ativar

5. Salve as alterações

6. Agora você verá uma nova aba **"Wiki"** no menu do repositório

---

### **PASSO 2: Clonar a Wiki (opcional, mas recomendado)**

A Wiki do GitHub é um repositório Git separado. Para facilitar a edição em massa:

```bash
# No terminal, fora da pasta do projeto
cd ~/Documents
git clone https://github.com/seu-usuario/bartab.wiki.git
cd bartab.wiki.git
```

**Nota:** Substitua `seu-usuario` pelo seu usuário do GitHub.

---

### **PASSO 3: Criar a Estrutura da Wiki**

Use o arquivo `ESTRUTURA_WIKI.md` (criado neste guia) como referência para organizar as páginas.

---

### **PASSO 4: Copiar Conteúdo**

Você pode fazer isso de duas formas:

#### **Opção A: Manual (via interface do GitHub)**
- Acesse a aba Wiki
- Clique em "New Page"
- Cole o conteúdo do arquivo correspondente
- Salve

#### **Opção B: Automatizada (via Git Clone)**
- Use o repositório clonado (Passo 2)
- Copie os arquivos .md conforme a estrutura definida
- Commit e push:
```bash
git add .
git commit -m "docs: adiciona documentação completa na Wiki"
git push origin master
```

---

### **PASSO 5: Criar Página Inicial (Home)**

A primeira página da Wiki deve ser o arquivo `Home.md`. Use o conteúdo preparado em `WIKI_HOME.md`.

---

### **PASSO 6: Criar Sidebar (Menu Lateral)**

Crie um arquivo `_Sidebar.md` na Wiki com o menu de navegação (veja `WIKI_SIDEBAR.md`).

---

### **PASSO 7: Organizar Links Internos**

A Wiki do GitHub usa sintaxe especial para links:
- `[[Nome-da-Pagina]]` - Link para outra página da Wiki
- `[[Texto do Link|Nome-da-Pagina]]` - Link com texto customizado

---

### **PASSO 8: Verificar e Testar**

1. Acesse a Wiki no navegador
2. Navegue pelas páginas
3. Teste todos os links
4. Verifique a formatação

---

## 📁 Arquivos Criados para Ajudar

Este guia criou os seguintes arquivos para facilitar sua migração:

- ✅ `ESTRUTURA_WIKI.md` - Estrutura organizada das páginas
- ✅ `WIKI_HOME.md` - Conteúdo para a página inicial
- ✅ `WIKI_SIDEBAR.md` - Menu lateral de navegação
- ✅ `wiki-files/` - Pasta com arquivos prontos para copiar

---

## 🎓 Dica Extra

Após configurar a Wiki, adicione um link no seu README.md principal:

```markdown
## 📚 Documentação Completa

Acesse nossa [**Wiki do Projeto**](https://github.com/seu-usuario/bartab/wiki) para documentação detalhada.
```

---

## ✅ Checklist de Verificação

- [ ] Wiki ativada no GitHub
- [ ] Página Home criada
- [ ] Sidebar (_Sidebar.md) configurado
- [ ] Documentação de arquitetura adicionada
- [ ] Guias de início rápido na Wiki
- [ ] Documentação de API disponível
- [ ] Guias de deploy e CI/CD
- [ ] Documentação de testes
- [ ] Links internos funcionando
- [ ] Formatação correta em todas as páginas

---

## 🚀 Resultado Esperado

Após concluir, você terá:
- ✅ Wiki do GitHub ativa e organizada
- ✅ Documentação acessível e colaborativa
- ✅ Conformidade com os requisitos dos professores
- ✅ Navegação fácil entre documentos

---

**Próximo Passo:** Execute o PASSO 1 acima e depois retorne para continuar! 🎯

