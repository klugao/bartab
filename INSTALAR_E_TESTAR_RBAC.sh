#!/bin/bash

# ========================================
# Script de Instalação do Sistema RBAC
# BarTab - Sistema de Controle de Acesso
# ========================================

echo "🚀 ========================================"
echo "   Instalação do Sistema RBAC - BarTab"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para printar com cor
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -d "backend" ]; then
    print_error "Erro: Execute este script na raiz do projeto (onde está a pasta backend/)"
    exit 1
fi

# Passo 1: Instalar Dependências
echo "📦 Passo 1: Instalando dependências..."
cd backend

if npm install nodemailer @types/nodemailer --save; then
    print_success "Dependências instaladas com sucesso!"
else
    print_error "Erro ao instalar dependências"
    exit 1
fi

echo ""

# Passo 2: Verificar arquivo .env
echo "🔧 Passo 2: Verificando configuração..."

if [ ! -f ".env" ]; then
    print_warning "Arquivo .env não encontrado!"
    echo "   Criando a partir do env.example..."
    cp env.example .env
    print_success "Arquivo .env criado!"
    print_warning "IMPORTANTE: Edite o arquivo .env e configure:"
    echo "   - SMTP_USER (seu e-mail do Gmail)"
    echo "   - SMTP_PASS (senha de app do Gmail)"
    echo ""
    echo "   Como obter senha de app:"
    echo "   1. Acesse: https://myaccount.google.com/apppasswords"
    echo "   2. Crie uma senha para 'E-mail'"
    echo "   3. Copie e cole no SMTP_PASS"
    echo ""
    read -p "Pressione Enter depois de configurar o .env..."
fi

# Verificar se SMTP está configurado
if grep -q "SMTP_USER=seu-email@gmail.com" .env 2>/dev/null; then
    print_warning "SMTP ainda não configurado!"
    echo "   Edite o arquivo backend/.env antes de continuar"
    exit 1
fi

print_success "Arquivo .env configurado!"
echo ""

# Passo 3: Verificar banco de dados
echo "🗄️  Passo 3: Verificando banco de dados..."

if psql -U pdv -d pdv_dev -c "\q" 2>/dev/null; then
    print_success "Banco de dados acessível!"
else
    print_warning "Não foi possível conectar ao banco de dados"
    echo "   Certifique-se que o PostgreSQL está rodando:"
    echo "   docker-compose up -d"
fi

echo ""

# Passo 4: Compilar o projeto
echo "🔨 Passo 4: Compilando o projeto..."

if npm run build; then
    print_success "Projeto compilado com sucesso!"
else
    print_error "Erro ao compilar o projeto"
    exit 1
fi

echo ""

# Passo 5: Testar configuração de e-mail
echo "📧 Passo 5: Testando configuração de e-mail..."
echo ""

read -p "Deseja testar o envio de e-mail agora? (s/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "Enviando e-mail de teste..."
    if npx ts-node test-email.ts; then
        print_success "E-mail de teste enviado!"
        echo "   Verifique a caixa de entrada de eduardo.klug7@gmail.com"
    else
        print_error "Erro ao enviar e-mail de teste"
        echo "   Verifique as configurações SMTP no arquivo .env"
    fi
else
    print_warning "Teste de e-mail pulado. Execute manualmente:"
    echo "   cd backend && npx ts-node test-email.ts"
fi

echo ""
echo "=========================================="
echo "🎉 Instalação Concluída!"
echo "=========================================="
echo ""
echo "📝 Próximos Passos:"
echo ""
echo "1️⃣  Iniciar o servidor:"
echo "   cd backend && npm run start:dev"
echo ""
echo "2️⃣  Testar o sistema:"
echo "   - Faça login como admin: eduardo.klug7@gmail.com"
echo "   - Faça login como proprietário: qualquer outro e-mail"
echo ""
echo "3️⃣  Acessar endpoints de admin:"
echo "   curl -X GET http://localhost:3000/admin/statistics \\"
echo "     -H \"Authorization: Bearer SEU_TOKEN\""
echo ""
echo "📚 Documentação:"
echo "   - Completa: backend/RBAC_E_NOTIFICACOES.md"
echo "   - Quick Start: RBAC_QUICK_START.md"
echo "   - Comandos: COMANDOS_RAPIDOS_RBAC.md"
echo "   - Checklist: CHECKLIST_RBAC.md"
echo ""
echo "🆘 Suporte:"
echo "   Se encontrar problemas, consulte:"
echo "   - backend/INSTALL_RBAC.md (Troubleshooting)"
echo "   - COMANDOS_RAPIDOS_RBAC.md"
echo ""
echo "✨ Sistema RBAC instalado com sucesso!"
echo ""

