# Testes Implementados no Sistema BarTab

Este documento descreve a implementação de testes unitários no sistema BarTab.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Backend - Testes](#backend---testes)
- [Frontend - Testes](#frontend---testes)
- [Como Executar os Testes](#como-executar-os-testes)
- [Cobertura de Testes](#cobertura-de-testes)

## 🎯 Visão Geral

O sistema BarTab agora possui testes unitários abrangentes tanto no backend quanto no frontend, cobrindo as principais funcionalidades do sistema.

### Tecnologias Utilizadas

**Backend:**
- Jest
- @nestjs/testing
- Supertest (para testes E2E)

**Frontend:**
- Vitest
- React Testing Library
- @testing-library/jest-dom
- @testing-library/user-event

## 🔧 Backend - Testes

### Serviços Testados

#### 1. AuthService (`auth.service.spec.ts`)
Testa a autenticação e autorização de usuários:

- ✅ Validação de usuário Google existente
- ✅ Registro de novo usuário proprietário
- ✅ Registro de administrador do sistema
- ✅ Geração de token JWT
- ✅ Busca de usuário por ID
- ✅ Tratamento de erros (usuário duplicado, não encontrado)

**Casos de Teste:** 10 cenários

#### 2. CustomersService (`customers.service.spec.ts`)
Testa o gerenciamento de clientes:

- ✅ Criação de cliente
- ✅ Listagem de clientes
- ✅ Busca de cliente por ID
- ✅ Atualização de cliente
- ✅ Remoção de cliente
- ✅ Atualização de saldo devedor
- ✅ Listagem de clientes com dívidas
- ✅ Pagamento de dívidas (parcial e completo)

**Casos de Teste:** 12 cenários

#### 3. ItemsService (`items.service.spec.ts`)
Testa o gerenciamento de itens do cardápio:

- ✅ Criação de item
- ✅ Listagem de itens (todos e ativos)
- ✅ Busca de item por ID
- ✅ Atualização de item
- ✅ Remoção de item
- ✅ Desativação de item
- ✅ Ordenação por vendas
- ✅ Tratamento de constraint de chave estrangeira

**Casos de Teste:** 11 cenários

#### 4. TabsService (`tabs.service.spec.ts`)
Testa o gerenciamento de contas/comandas:

- ✅ Abertura de conta (com e sem cliente)
- ✅ Listagem de contas abertas e fechadas
- ✅ Busca de conta por ID
- ✅ Adição de itens à conta
- ✅ Remoção de itens
- ✅ Cálculo de total
- ✅ Adição de pagamentos
- ✅ Fechamento de conta
- ✅ Exclusão de conta vazia
- ✅ Criação automática de dívida em pagamento LATER

**Casos de Teste:** 15 cenários

### Executar Testes do Backend

```bash
cd backend

# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:cov

# Debug de testes
npm run test:debug
```

## 🎨 Frontend - Testes

### Configuração
Foi configurado o Vitest com suporte a:
- Ambiente jsdom para testes de componentes React
- React Testing Library
- Matchers do jest-dom
- Cobertura de código com V8

### Utilitários Testados

#### 1. utils.test.ts
Testa a função `cn` (classnames):

- ✅ Combinação de classes Tailwind
- ✅ Classes condicionais
- ✅ Tratamento de valores falsy
- ✅ Mesclagem de classes conflitantes
- ✅ Arrays de classes

**Casos de Teste:** 6 cenários

#### 2. validations.test.ts
Testa os schemas de validação Zod:

- ✅ Validação de cliente (nome, email, telefone)
- ✅ Validação de item (nome, preço)
- ✅ Validação de adição de item à conta
- ✅ Validação de pagamento
- ✅ Validação de pagamento de dívida
- ✅ Validação de campos opcionais
- ✅ Validação de limites de valores

**Casos de Teste:** 25+ cenários

#### 3. formatters.test.ts
Testa funções de formatação:

- ✅ Formatação de moeda brasileira
- ✅ Formatação de datas (curta e completa)
- ✅ Tratamento de valores inválidos
- ✅ Arredondamento de valores
- ✅ Fuso horário de São Paulo

**Casos de Teste:** 15 cenários

### Componentes Testados

#### 1. ConfirmDeleteModal.test.tsx
Testa o modal de confirmação de exclusão:

- ✅ Renderização condicional (isOpen)
- ✅ Exibição de título e mensagem
- ✅ Chamada de callbacks (onClose, onConfirm)
- ✅ Estado de loading
- ✅ Desabilitação de botões
- ✅ Ícones e estilos

**Casos de Teste:** 9 cenários

#### 2. CardTab.test.tsx
Testa o componente de card de conta:

- ✅ Renderização de informações básicas
- ✅ Cálculo de total
- ✅ Exibição de cliente ou "Mesa sem cliente"
- ✅ Listagem de itens
- ✅ Botão de adicionar item (apenas contas abertas)
- ✅ Botão de excluir (apenas contas vazias)
- ✅ Estados de conta (aberta/fechada)
- ✅ Data de fechamento
- ✅ Navegação para detalhes
- ✅ Tratamento de valores inválidos

**Casos de Teste:** 16 cenários

### Executar Testes do Frontend

```bash
cd frontend

# Instalar dependências (primeira vez)
npm install

# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch

# Interface visual dos testes
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

## 📊 Cobertura de Testes

### Backend
- **Serviços principais:** 4/4 (100%)
- **Total de casos de teste:** ~48 cenários
- **Cobertura estimada:** >80% das funcionalidades críticas

### Frontend
- **Utilitários:** 3/3 (100%)
- **Componentes:** 2+ componentes principais
- **Total de casos de teste:** ~70+ cenários
- **Cobertura estimada:** >70% das funções utilitárias

## 🧪 Estrutura de Testes

### Backend
```
backend/src/
├── modules/
│   ├── auth/
│   │   └── services/
│   │       └── auth.service.spec.ts
│   ├── customers/
│   │   └── services/
│   │       └── customers.service.spec.ts
│   ├── items/
│   │   └── items.service.spec.ts
│   └── tabs/
│       └── tabs.service.spec.ts
```

### Frontend
```
frontend/src/
├── lib/
│   ├── utils.test.ts
│   └── validations.test.ts
├── utils/
│   └── formatters.test.ts
├── components/
│   ├── CardTab.test.tsx
│   └── ConfirmDeleteModal.test.tsx
├── test/
│   ├── setup.ts
│   └── test-utils.tsx
└── vitest.config.ts
```

## 🎯 Padrões de Teste

### Backend (Jest)
```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ServiceName, ...mocks],
    }).compile();
    
    service = module.get<ServiceName>(ServiceName);
  });
  
  it('deve fazer algo específico', async () => {
    // Arrange
    const input = { /* ... */ };
    
    // Act
    const result = await service.method(input);
    
    // Assert
    expect(result).toEqual(expected);
  });
});
```

### Frontend (Vitest + RTL)
```typescript
describe('ComponentName', () => {
  it('deve renderizar corretamente', () => {
    // Arrange
    render(<ComponentName {...props} />);
    
    // Assert
    expect(screen.getByText('texto')).toBeInTheDocument();
  });
  
  it('deve chamar callback ao clicar', async () => {
    // Arrange
    const onClick = vi.fn();
    render(<ComponentName onClick={onClick} />);
    
    // Act
    await userEvent.click(screen.getByRole('button'));
    
    // Assert
    expect(onClick).toHaveBeenCalled();
  });
});
```

## 🚀 Próximos Passos

### Backend
- [ ] Adicionar testes para ExpensesService
- [ ] Adicionar testes para AdminService
- [ ] Adicionar testes para NotificationService
- [ ] Implementar testes E2E completos
- [ ] Configurar CI/CD com testes automatizados

### Frontend
- [ ] Adicionar testes para páginas principais
- [ ] Testar hooks customizados
- [ ] Testar integração com API (mocks)
- [ ] Adicionar testes de acessibilidade
- [ ] Configurar testes de snapshot

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)

## 🤝 Contribuindo

Para adicionar novos testes:

1. Crie o arquivo de teste ao lado do arquivo fonte (`.spec.ts` ou `.test.ts`)
2. Siga os padrões estabelecidos
3. Execute os testes localmente
4. Garanta que a cobertura não diminua
5. Documente casos de teste complexos

---

**Última atualização:** Novembro 2025

