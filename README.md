# 🍺 PDV Bartab - Sistema de Contas/Mesas

Sistema completo de PDV para gerenciar **contas/mesas**, itens consumidos e pagamentos (dinheiro, débito, crédito, pix e **pagar depois** com saldo devedor).

## 🚀 **Status do Projeto**

✅ **Backend**: 100% implementado (NestJS + TypeORM + PostgreSQL)  
✅ **Frontend**: 100% implementado (React + TypeScript + Tailwind)  
✅ **Banco de Dados**: Estrutura completa com entidades  
✅ **API**: Endpoints CRUD para todas as funcionalidades  
✅ **Interface**: Páginas principais e componentes  

## 🎯 **Funcionalidades Implementadas**

- **CRUD de Clientes** e **Itens**
- **Abrir/fechar contas** (mesas), adicionar/remover itens
- **Cálculo automático** de totais
- **Pagamentos**: dinheiro, débito, crédito, pix, **pagar depois**
- **Saldo devedor** automático para clientes
- **Interface responsiva** com Tailwind CSS
- **Validações** e tratamento de erros

## 🛠️ **Stack Tecnológica**

- **Backend**: NestJS + TypeScript + TypeORM + PostgreSQL
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Banco**: PostgreSQL com Docker
- **Validação**: class-validator + class-transformer
- **Segurança**: Helmet + CORS configurável

## 🏗️ **Arquitetura**

```
Cliente (React) ⇄ API (NestJS) ⇄ PostgreSQL
```

- **Módulos**: Customers, Items, Tabs, Payments
- **Entidades**: Relacionamentos completos com TypeORM
- **DTOs**: Validação e transformação de dados
- **Services**: Lógica de negócio centralizada

## ▶️ **Como Executar**

### **1. Pré-requisitos**
- Node.js 20+
- Yarn
- Docker (para PostgreSQL)

### **2. Banco de Dados**
```bash
# Iniciar PostgreSQL
docker-compose up -d db

# Verificar se está rodando
docker-compose ps
```

### **3. Backend**
```bash
cd backend

# Instalar dependências
yarn

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações

# Executar seed (dados iniciais)
yarn seed

# Rodar em desenvolvimento
yarn start:dev
```

### **4. Frontend**
```bash
cd frontend

# Instalar dependências
yarn

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações

# Rodar em desenvolvimento
yarn dev
```

## 🌐 **URLs de Acesso**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Adminer (DB)**: http://localhost:8080

## 📊 **Estrutura do Banco**

### **Tabelas Principais**
- `customers` - Clientes com saldo devedor
- `items` - Itens do cardápio
- `tabs` - Contas/mesas abertas
- `tab_items` - Itens em cada conta
- `payments` - Pagamentos realizados

### **Regras de Negócio**
- **Total**: Soma automática de `tab_items.total`
- **Fechamento**: Quando pagamentos ≥ total ou pagamento LATER
- **LATER**: Incrementa `customers.balance_due`

## 🔧 **Endpoints da API**

### **Clientes**
- `GET /api/customers` - Listar todos
- `POST /api/customers` - Criar cliente
- `GET /api/customers/:id` - Buscar por ID
- `PATCH /api/customers/:id` - Atualizar
- `DELETE /api/customers/:id` - Remover

### **Itens**
- `GET /api/items` - Listar todos
- `GET /api/items/active` - Listar ativos
- `POST /api/items` - Criar item
- `PATCH /api/items/:id` - Atualizar
- `DELETE /api/items/:id` - Remover

### **Contas/Mesas**
- `POST /api/tabs` - Abrir conta
- `GET /api/tabs` - Listar abertas
- `GET /api/tabs/:id` - Detalhes da conta
- `POST /api/tabs/:id/items` - Adicionar item
- `DELETE /api/tabs/:id/items/:tabItemId` - Remover item
- `POST /api/tabs/:id/payments` - Adicionar pagamento
- `PATCH /api/tabs/:id/close` - Fechar conta

## 🎨 **Interface do Usuário**

### **Páginas Principais**
- **Home**: Cards de contas abertas + botão nova conta
- **Detalhe da Conta**: Itens, total, pagamentos
- **Clientes**: CRUD completo
- **Itens**: CRUD do cardápio

### **Componentes**
- **CardTab**: Exibe informações da conta
- **NewTabModal**: Modal para abrir nova conta
- **Layout**: Navegação e estrutura base

## 🧪 **Testes**

```bash
# Backend
cd backend
yarn test

# Frontend
cd frontend
yarn test
```

## 🚀 **Deploy**

### **Backend (Render/Railway)**
- Build: `yarn build`
- Start: `yarn start:prod`
- Variáveis: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`

### **Frontend (Vercel/Netlify)**
- Build: `yarn build`
- Variáveis: `VITE_API_BASE_URL`

## 📚 **Documentação Adicional**

- **Arquitetura**: `docs/architecture.md`
- **Requisitos**: `docs/requirements.md`
- **User Stories**: `docs/user-stories.md`
- **Segurança**: `docs/security.md`

## ✅ **Próximos Passos**

1. **Implementar autenticação JWT**
2. **Adicionar testes unitários**
3. **Configurar CI/CD**
4. **Implementar relatórios**
5. **Deploy em produção**

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 **Licença**

MIT License - veja o arquivo LICENSE para detalhes.

---

**🎉 Projeto pronto para uso!** Execute os comandos acima e comece a usar o sistema.
