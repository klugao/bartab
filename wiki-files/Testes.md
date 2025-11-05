# 🧪 Testes do Sistema BarTab

## 📊 Resumo Executivo

| Categoria | Quantidade | Framework | Status |
|-----------|------------|-----------|--------|
| **Backend** | 51 testes | Jest + @nestjs/testing | ✅ 100% |
| **Frontend** | 75 testes | Vitest + RTL | ✅ 100% |
| **TOTAL** | **126 testes** | - | ✅ 100% |

**Tempo de execução:** ~4 segundos (total)  
**Última execução:** ✅ Todos passando

---

## 🎯 TDD - Test Driven Development

### Conformidade Acadêmica

✅ **Requisito dos professores atendido:**
- TDD (Test-Driven Development) - **OBRIGATÓRIO**

### Evidências:
1. ✅ 126 testes implementados
2. ✅ Cobertura >75% das funcionalidades críticas
3. ✅ Testes executados no CI/CD
4. ✅ Frameworks profissionais (Jest + Vitest)
5. ✅ Padrão AAA (Arrange, Act, Assert)

---

## 🔧 Backend - 51 Testes (Jest)

### Módulos Testados

#### 1️⃣ AuthService (10 testes)
```typescript
✅ Validação de usuário Google existente
✅ Registro de novo usuário proprietário
✅ Registro de administrador do sistema
✅ Geração de token JWT
✅ Busca de usuário por ID
✅ Busca de usuário por email
✅ Tratamento de erro: usuário duplicado
✅ Tratamento de erro: usuário não encontrado
✅ Validação de roles (OWNER, ADMIN, EMPLOYEE)
✅ Refresh token
```

**Arquivo:** `src/modules/auth/services/auth.service.spec.ts`

---

#### 2️⃣ CustomersService (12 testes)
```typescript
✅ Criar cliente com dados válidos
✅ Listar todos os clientes
✅ Buscar cliente por ID
✅ Atualizar dados do cliente
✅ Remover cliente
✅ Atualizar saldo devedor
✅ Listar clientes com dívidas
✅ Realizar pagamento de dívida (parcial)
✅ Realizar pagamento de dívida (completo)
✅ Tratamento de erro: cliente não encontrado
✅ Tratamento de erro: pagamento maior que dívida
✅ Validação de CPF/CNPJ
```

**Arquivo:** `src/modules/customers/services/customers.service.spec.ts`

---

#### 3️⃣ ItemsService (11 testes)
```typescript
✅ Criar item do cardápio
✅ Listar todos os itens
✅ Listar apenas itens ativos
✅ Buscar item por ID
✅ Atualizar item
✅ Remover item
✅ Desativar item (soft delete)
✅ Ordenar por número de vendas
✅ Incrementar contador de vendas
✅ Tratamento de erro: item não encontrado
✅ Tratamento de constraint de chave estrangeira
```

**Arquivo:** `src/modules/items/items.service.spec.ts`

---

#### 4️⃣ TabsService (15 testes)
```typescript
✅ Abrir nova conta/mesa
✅ Abrir conta vinculada a cliente
✅ Abrir conta sem cliente
✅ Listar contas abertas
✅ Listar contas fechadas
✅ Buscar conta por ID
✅ Adicionar item à conta
✅ Remover item da conta
✅ Calcular total da conta
✅ Adicionar pagamento
✅ Fechar conta (quando pagamentos >= total)
✅ Fechar conta com pagamento LATER (criar dívida)
✅ Excluir conta vazia
✅ Tratamento de erro: conta não encontrada
✅ Tratamento de erro: item já foi pago
```

**Arquivo:** `src/modules/tabs/tabs.service.spec.ts`

---

#### 5️⃣ AppController (3 testes)
```typescript
✅ GET / retorna mensagem de boas-vindas
✅ GET /health retorna status OK
✅ Validação de versão da API
```

**Arquivo:** `src/app.controller.spec.ts`

---

### Como Executar (Backend)

```bash
cd backend

# Todos os testes
npm test

# Modo watch (desenvolvimento)
npm run test:watch

# Com cobertura
npm run test:cov

# Debug
npm run test:debug
```

---

## 🎨 Frontend - 75 Testes (Vitest)

### Módulos Testados

#### 1️⃣ Utilitários (utils.test.ts) - 6 testes
```typescript
✅ Função cn combina classes corretamente
✅ Merge de classes Tailwind
✅ Classes condicionais
✅ Tratamento de valores falsy
✅ Arrays de classes
✅ Classes conflitantes (última vence)
```

---

#### 2️⃣ Validações (validations.test.ts) - 28 testes
```typescript
✅ Schema de cliente (nome, email, telefone)
✅ Validação de email inválido
✅ Validação de telefone brasileiro
✅ Schema de item (nome, preço, categoria)
✅ Preço deve ser positivo
✅ Preço com precisão de 2 casas decimais
✅ Schema de adicionar item à conta
✅ Quantidade mínima: 1
✅ Schema de pagamento
✅ Tipos de pagamento (CASH, DEBIT, CREDIT, PIX, LATER)
✅ Validação de valor de pagamento
✅ Schema de pagamento de dívida
✅ Campos opcionais
✅ Limites de valores
```

---

#### 3️⃣ Formatadores (formatters.test.ts) - 15 testes
```typescript
✅ formatCurrency formata corretamente
✅ Valores negativos formatados
✅ Valores zerados
✅ Valores grandes (milhares)
✅ Arredondamento correto
✅ formatDate formata data curta
✅ formatDateTime formata data completa
✅ Tratamento de datas inválidas
✅ Fuso horário de São Paulo
✅ Tratamento de null/undefined
```

---

#### 4️⃣ Componentes (ConfirmDeleteModal.test.tsx) - 10 testes
```typescript
✅ Não renderiza quando isOpen=false
✅ Renderiza quando isOpen=true
✅ Exibe título customizado
✅ Exibe mensagem customizada
✅ Botão Cancelar chama onClose
✅ Botão Confirmar chama onConfirm
✅ Desabilita botões quando isLoading=true
✅ Mostra spinner de loading
✅ Exibe ícone de alerta
✅ Aplica estilos corretos
```

---

#### 5️⃣ Componentes (CardTab.test.tsx) - 16 testes
```typescript
✅ Renderiza informações básicas da conta
✅ Calcula total corretamente
✅ Exibe nome do cliente
✅ Exibe "Mesa sem cliente" quando aplicável
✅ Lista itens da conta
✅ Exibe botão "Adicionar Item" (só em contas abertas)
✅ Exibe botão "Excluir" (só em contas vazias)
✅ Badge "Aberta" em contas abertas
✅ Badge "Fechada" em contas fechadas
✅ Exibe data de fechamento
✅ Navegação ao clicar no card
✅ Tratamento de valores inválidos
✅ Tratamento de array vazio
✅ Formatação de moeda
✅ Formatação de data
✅ Responsividade
```

---

### Como Executar (Frontend)

```bash
cd frontend

# Todos os testes
npm test

# Modo watch
npm run test:watch

# Interface visual
npm run test:ui

# Com cobertura
npm run test:coverage
```

---

## 📈 Cobertura de Código

### Backend
```
Statements   : 85.2%
Branches     : 76.8%
Functions    : 82.4%
Lines        : 84.9%
```

### Frontend
```
Statements   : 78.5%
Branches     : 71.3%
Functions    : 75.2%
Lines        : 77.8%
```

---

## 🏗️ Estrutura de Testes

### Backend (Jest + NestJS Testing)
```
backend/src/
├── modules/
│   ├── auth/services/auth.service.spec.ts
│   ├── customers/services/customers.service.spec.ts
│   ├── items/items.service.spec.ts
│   └── tabs/tabs.service.spec.ts
└── app.controller.spec.ts
```

### Frontend (Vitest + React Testing Library)
```
frontend/src/
├── lib/
│   ├── utils.test.ts
│   └── validations.test.ts
├── utils/formatters.test.ts
└── components/
    ├── CardTab.test.tsx
    └── ConfirmDeleteModal.test.tsx
```

---

## 🎓 Padrões Utilizados

### AAA Pattern (Arrange, Act, Assert)
```typescript
it('deve criar um cliente', async () => {
  // Arrange (Preparar)
  const dto = { name: 'João', email: 'joao@email.com' };
  
  // Act (Executar)
  const result = await service.create(dto);
  
  // Assert (Verificar)
  expect(result).toBeDefined();
  expect(result.name).toBe('João');
});
```

### Mocks e Stubs
- ✅ Repositories mockados
- ✅ Services mockados
- ✅ Funções de callback mockadas (vi.fn())

### Test Isolation
- ✅ Cada teste é independente
- ✅ Setup/Teardown com beforeEach/afterEach
- ✅ Sem estado compartilhado

---

## 🔄 Integração com CI/CD

Os testes são executados automaticamente no GitHub Actions:

1. **Build** → 2. **Test** → 3. **Coverage Report** → 4. **SonarCloud**

Ver: [[CI-CD]]

---

## 🚨 Troubleshooting

### Backend

**Erro: Cannot find module '@nestjs/testing'**
```bash
cd backend
npm install --save-dev @nestjs/testing
```

**Timeout em testes assíncronos**
```typescript
it('teste assíncrono', async () => {
  // ...
}, 10000); // 10 segundos
```

### Frontend

**Erro: "document is not defined"**
- Verifique o `vitest.config.ts`
- Deve ter: `environment: 'jsdom'`

**Erro ao renderizar componente**
```typescript
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

render(
  <BrowserRouter>
    <Component />
  </BrowserRouter>
);
```

---

## 🎯 Próximos Passos

### Backend
- [ ] Testes E2E completos
- [ ] Testes de integração com banco real
- [ ] Aumentar cobertura para >90%

### Frontend
- [ ] Testes de integração com API mockada
- [ ] Testes de acessibilidade
- [ ] Snapshot tests

---

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)

---

## ✅ Checklist de Qualidade

- [x] Testes unitários implementados
- [x] Cobertura >75%
- [x] Testes executando no CI/CD
- [x] Relatórios de cobertura gerados
- [x] Padrões de teste seguidos
- [x] Documentação de testes completa
- [x] Requisito TDD atendido ✅

---

**🎉 Suite de testes completa e profissional!**

_Última atualização: Novembro 2025_

