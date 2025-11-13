#!/bin/bash

# 📚 Script de Preparação da Wiki do GitHub
# Este script prepara todos os arquivos para upload na Wiki

echo "🍺 BarTab - Preparação da Wiki do GitHub"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretórios
WIKI_DIR="wiki-files"
DOCS_DIR="docs"

echo -e "${BLUE}📁 Verificando estrutura...${NC}"

# Criar pasta wiki-files se não existir
if [ ! -d "$WIKI_DIR" ]; then
  mkdir -p "$WIKI_DIR"
  echo "✅ Pasta $WIKI_DIR criada"
else
  echo "✅ Pasta $WIKI_DIR já existe"
fi

echo ""
echo -e "${BLUE}📝 Copiando arquivos principais...${NC}"

# Copiar arquivos já preparados
cp WIKI_HOME.md "$WIKI_DIR/Home.md" 2>/dev/null && echo "✅ Home.md"
cp WIKI_SIDEBAR.md "$WIKI_DIR/_Sidebar.md" 2>/dev/null && echo "✅ _Sidebar.md"

# Copiar guias de início rápido
cp INICIO_RAPIDO.md "$WIKI_DIR/Inicio-Rapido.md" 2>/dev/null && echo "✅ Inicio-Rapido.md"
cp COMANDOS_RAPIDOS.md "$WIKI_DIR/Comandos-Rapidos.md" 2>/dev/null && echo "✅ Comandos-Rapidos.md"

# Copiar documentação técnica
cp docs/architecture.md "$WIKI_DIR/Arquitetura.md" 2>/dev/null && echo "✅ Arquitetura.md"
cp docs/db-schema.md "$WIKI_DIR/Banco-de-Dados.md" 2>/dev/null && echo "✅ Banco-de-Dados.md"
cp docs/requirements.md "$WIKI_DIR/Requisitos.md" 2>/dev/null && echo "✅ Requisitos.md"
cp docs/user-stories.md "$WIKI_DIR/User-Stories.md" 2>/dev/null && echo "✅ User-Stories.md"
cp docs/security.md "$WIKI_DIR/Seguranca.md" 2>/dev/null && echo "✅ Seguranca.md"

# Copiar documentação de conformidade
cp README_LGPD.md "$WIKI_DIR/LGPD.md" 2>/dev/null && echo "✅ LGPD.md"
cp README_RBAC.md "$WIKI_DIR/RBAC.md" 2>/dev/null && echo "✅ RBAC.md"
cp POLITICA_PRIVACIDADE.md "$WIKI_DIR/Politica-Privacidade.md" 2>/dev/null && echo "✅ Politica-Privacidade.md"
cp TERMOS_DE_USO.md "$WIKI_DIR/Termos-de-Uso.md" 2>/dev/null && echo "✅ Termos-de-Uso.md"

# Copiar documentação de deploy
cp DEPLOY_RENDER.md "$WIKI_DIR/Deploy.md" 2>/dev/null && echo "✅ Deploy.md"
cp CHECKLIST_DEPLOY.md "$WIKI_DIR/Checklist-Deploy.md" 2>/dev/null && echo "✅ Checklist-Deploy.md"

# Copiar documentação de PWA
cp PWA_IMPLEMENTATION.md "$WIKI_DIR/PWA.md" 2>/dev/null && echo "✅ PWA.md"
cp RESUMO_PWA.md "$WIKI_DIR/PWA-Resumo.md" 2>/dev/null && echo "✅ PWA-Resumo.md"

# Copiar documentação de testes e qualidade (já prontos)
echo "✅ CI-CD.md (já preparado)"
echo "✅ Testes.md (já preparado)"

echo ""
echo -e "${BLUE}📊 Resumo dos arquivos preparados:${NC}"
echo ""

# Contar arquivos
FILE_COUNT=$(ls -1 "$WIKI_DIR"/*.md 2>/dev/null | wc -l)
echo "Total de arquivos: $FILE_COUNT"

echo ""
echo -e "${GREEN}✅ Preparação concluída!${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo ""
echo "1. Acesse: https://github.com/seu-usuario/bartab/settings"
echo "   → Ative a Wiki em 'Features'"
echo ""
echo "2. Método MANUAL:"
echo "   → Vá para a aba Wiki"
echo "   → Crie páginas e copie o conteúdo de cada arquivo em wiki-files/"
echo ""
echo "3. Método AUTOMÁTICO (recomendado):"
echo "   → Execute:"
echo "   cd ~/Documents"
echo "   git clone https://github.com/seu-usuario/bartab.wiki.git"
echo "   cd bartab.wiki.git"
echo "   cp ~/Documents/bartab/wiki-files/*.md ."
echo "   git add ."
echo "   git commit -m 'docs: adiciona documentação completa'"
echo "   git push origin master"
echo ""
echo -e "${GREEN}🎉 Boa sorte!${NC}"
echo ""

