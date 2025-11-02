# 🧪 Guia de Testes - Sistema BarTab

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Executando os Testes](#executando-os-testes)
3. [Estrutura dos Testes](#estrutura-dos-testes)
4. [Escrevendo Novos Testes](#escrevendo-novos-testes)
5. [Boas Práticas](#boas-práticas)

## 🎯 Visão Geral

O sistema BarTab possui uma suíte completa de testes unitários cobrindo tanto o backend (NestJS) quanto o frontend (React). 

### 📊 Estatísticas Atuais

- **Total de Testes:** 126
- **Backend (Jest):** 51 testes
- **Frontend (Vitest):** 75 testes
- **Taxa de Sucesso:** 100%
- **Tempo de Execução:** ~3.5s

## 🚀 Executando os Testes

### Forma Mais Rápida (Recomendada)

Execute todos os testes do sistema de uma vez:

```bash
./run-tests.sh
```

Ou execute apenas uma parte:

```bash
./run-tests.sh backend   # Apenas backend
./run-tests.sh frontend  # Apenas frontend
```

### Backend (NestJS + Jest)

```bash
cd backend

# Executar todos os testes
npm test

# Modo watch (re-executa ao salvar)
npm run test:watch

# Com relatório de cobertura
npm run test:cov

# Debug mode
npm run test:debug

# Executar arquivo específico
npm test -- auth.service.spec.ts
```

### Frontend (React + Vitest)

```bash
cd frontend

# Executar todos os testes
npm test

# Modo watch
npm test -- --watch

# Interface visual (recomendado)
npm run test:ui

# Com relatório de cobertura
npm run test:coverage

# Executar arquivo específico
npm test -- CardTab.test.tsx
```

## 📁 Estrutura dos Testes

### Backend

```
backend/src/
├── app.controller.spec.ts
└── modules/
    ├── auth/
    │   └── services/
    │       └── auth.service.spec.ts
    ├── customers/
    │   └── services/
    │       └── customers.service.spec.ts
    ├── items/
    │   └── items.service.spec.ts
    └── tabs/
        └── tabs.service.spec.ts
```

**Convenção:** Arquivos de teste usam `.spec.ts` e ficam ao lado do código fonte.

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
└── test/
    ├── setup.ts           # Configuração global
    └── test-utils.tsx     # Utilitários de teste
```

**Convenção:** Arquivos de teste usam `.test.ts` ou `.test.tsx`.

## ✍️ Escrevendo Novos Testes

### Backend (Jest)

#### Estrutura Básica

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceName } from './service-name.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityName } from './entities/entity-name.entity';

describe('ServiceName', () => {
  let service: ServiceName;
  let repository: any;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceName,
        {
          provide: getRepositoryToken(EntityName),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
    repository = module.get(getRepositoryToken(EntityName));
    
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('deve fazer algo específico', async () => {
      // Arrange (Preparar)
      const input = { /* dados de entrada */ };
      const expected = { /* resultado esperado */ };
      mockRepository.findOne.mockResolvedValue(expected);

      // Act (Executar)
      const result = await service.methodName(input);

      // Assert (Verificar)
      expect(result).toEqual(expected);
      expect(mockRepository.findOne).toHaveBeenCalledWith(input);
    });
  });
});
```

#### Testando Exceções

```typescript
it('deve lançar NotFoundException quando item não existe', async () => {
  mockRepository.findOne.mockResolvedValue(null);
  
  await expect(service.findOne('id-invalido'))
    .rejects
    .toThrow(NotFoundException);
});
```

### Frontend (Vitest + RTL)

#### Testando Funções Utilitárias

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-function';

describe('myFunction', () => {
  it('deve retornar o resultado esperado', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

#### Testando Componentes React

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('deve renderizar corretamente', () => {
    render(<MyComponent title="Hello" />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
  
  it('deve chamar callback ao clicar', async () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Testando com Contexto

```typescript
import { render } from '../test/test-utils'; // Custom render com providers

describe('ComponentWithContext', () => {
  it('deve acessar contexto', () => {
    render(
      <MyComponent />,
      { authValue: { user: mockUser } }
    );
    
    // testes...
  });
});
```

## 📋 Boas Práticas

### 1. Nomenclatura

✅ **BOM:**
```typescript
it('deve criar um novo cliente com sucesso', () => {})
it('deve lançar erro quando email é inválido', () => {})
```

❌ **RUIM:**
```typescript
it('test 1', () => {})
it('works', () => {})
```

### 2. Padrão AAA (Arrange, Act, Assert)

```typescript
it('deve calcular total corretamente', () => {
  // Arrange - Preparar dados
  const items = [
    { price: 10, qty: 2 },
    { price: 15, qty: 1 },
  ];
  
  // Act - Executar ação
  const total = calculateTotal(items);
  
  // Assert - Verificar resultado
  expect(total).toBe(35);
});
```

### 3. Testes Independentes

```typescript
// ✅ BOM - Cada teste é independente
describe('UserService', () => {
  let service: UserService;
  
  beforeEach(() => {
    service = new UserService();
  });
  
  it('teste 1', () => {
    // usa 'service' limpo
  });
  
  it('teste 2', () => {
    // usa 'service' limpo novamente
  });
});
```

### 4. Mockar Dependências Externas

```typescript
// ✅ BOM - Mock de API externa
vi.mock('../services/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'mock' })
}));
```

### 5. Testar Casos de Erro

```typescript
describe('validation', () => {
  it('deve aceitar email válido', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
  
  it('deve rejeitar email inválido', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
  
  it('deve rejeitar email vazio', () => {
    expect(validateEmail('')).toBe(false);
  });
});
```

### 6. Usar Matchers Apropriados

```typescript
// ✅ BOM - Matchers específicos
expect(array).toHaveLength(3);
expect(element).toBeInTheDocument();
expect(fn).toHaveBeenCalledWith(expectedArgs);

// ❌ EVITAR - Matchers genéricos
expect(array.length).toBe(3);
expect(element !== null).toBe(true);
```

## 🔍 Queries do React Testing Library

### Por Ordem de Prioridade

1. **Queries Acessíveis** (Preferir sempre)
   ```typescript
   screen.getByRole('button', { name: /submit/i })
   screen.getByLabelText('Email')
   screen.getByPlaceholderText('Digite seu nome')
   ```

2. **Queries Semânticas**
   ```typescript
   screen.getByAltText('Logo')
   screen.getByTitle('Fechar')
   ```

3. **Queries por Conteúdo**
   ```typescript
   screen.getByText('Hello World')
   screen.getByDisplayValue('John')
   ```

4. **Test IDs** (Último recurso)
   ```typescript
   screen.getByTestId('custom-element')
   ```

### Variações de Queries

- `getBy*` - Erro se não encontrar ou múltiplos
- `queryBy*` - Retorna null se não encontrar
- `findBy*` - Async, espera elemento aparecer
- `getAllBy*` - Retorna array de elementos

## 🐛 Debug de Testes

### Backend (Jest)

```bash
# Modo debug
npm run test:debug

# Logs detalhados
npm test -- --verbose
```

### Frontend (Vitest)

```typescript
import { screen } from '@testing-library/react';

// Ver estrutura HTML atual
screen.debug();

// Ver elemento específico
screen.debug(screen.getByRole('button'));
```

## 📊 Relatórios de Cobertura

### Backend

```bash
cd backend
npm run test:cov

# Abrir relatório HTML
open coverage/lcov-report/index.html
```

### Frontend

```bash
cd frontend
npm run test:coverage

# Abrir relatório HTML
open coverage/index.html
```

## 🆘 Troubleshooting

### Problema: Testes falhando com timeout

**Solução Backend:**
```typescript
it('teste longo', async () => {
  // código
}, 10000); // timeout de 10s
```

**Solução Frontend:**
```typescript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, { timeout: 5000 });
```

### Problema: Mocks não estão funcionando

```typescript
// Limpar mocks entre testes
beforeEach(() => {
  jest.clearAllMocks(); // Backend
  vi.clearAllMocks();   // Frontend
});
```

### Problema: Testes passam isolados mas falham juntos

```typescript
// Limpar estado entre testes
afterEach(() => {
  cleanup(); // React Testing Library
});
```

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://testingjavascript.com/)

## 🤝 Contribuindo

Ao adicionar novos recursos:

1. ✅ Escreva testes para novas funcionalidades
2. ✅ Garanta que todos os testes passem
3. ✅ Mantenha cobertura >80%
4. ✅ Siga as convenções estabelecidas
5. ✅ Documente casos complexos

---

**Última atualização:** Novembro 2025  
**Mantenedor:** Sistema BarTab Team

