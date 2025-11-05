# Implementação de Entrada de Valores Monetários tipo PDV

## Objetivo

Implementar comportamento de entrada de valores monetários similar a sistemas de PDV (Ponto de Venda), onde os valores são digitados em centavos e formatados automaticamente.

## Comportamento

Quando o usuário digita números, eles são interpretados como centavos e formatados automaticamente:

- Digita `7` → mostra `0,07`
- Digita `5` → mostra `0,75`
- Digita `0` → mostra `7,50`

## Implementação

### 1. Hook Personalizado: `useCurrencyInput`

Criado em: `frontend/src/hooks/use-currency-input.ts`

**Características:**
- Armazena valores em centavos internamente
- Formata automaticamente para exibição (R$ X,XX)
- Aceita apenas dígitos numéricos
- Suporta backspace, delete e escape
- Limita entrada a 10 dígitos (até R$ 99.999.999,99)
- Formata valores com separador de milhares

**API do Hook:**

```typescript
const {
  displayValue,      // Valor formatado para exibição (string)
  numericValue,      // Valor numérico em reais (number)
  handleChange,      // Handler para onChange do input
  handleKeyDown,     // Handler para onKeyDown do input
  setValue,          // Define um valor específico
  reset,            // Reseta para zero
  isEmpty           // Verifica se está vazio
} = useCurrencyInput(initialValue);
```

### 2. Componentes Atualizados

Os seguintes componentes foram atualizados para usar o hook:

#### `Items.tsx`
- Campo de preço do produto
- Validação de preço vazio antes de salvar

#### `PaymentModal.tsx`
- Campo de valor do pagamento
- Atualiza automaticamente quando o total muda
- Suporta todos os métodos de pagamento

#### `AddExpenseModal.tsx`
- Campo de valor da despesa
- Validação de valor vazio

#### `PayDebtModal.tsx`
- Campo de valor do pagamento de dívida
- Botão "Total" para preencher valor completo
- Cálculo de pagamento parcial em tempo real

### 3. Características dos Inputs

Todos os campos de valores monetários agora têm:

```tsx
<div className="relative">
  <span className="absolute left-3 top-2.5 text-gray-600">R$</span>
  <input
    type="text"
    inputMode="numeric"  // Teclado numérico em dispositivos móveis
    value={amountInput.displayValue}
    onChange={amountInput.handleChange}
    onKeyDown={amountInput.handleKeyDown}
    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md..."
    placeholder="0,00"
  />
</div>
```

## Testes

Criado arquivo de testes em: `frontend/src/hooks/use-currency-input.test.ts`

**Casos de teste:**
- Inicialização com valor zero
- Inicialização com valor fornecido
- Formatação tipo PDV (7, 5, 0 = 7,50)
- Aceitar apenas dígitos
- Limitar a 10 dígitos
- Resetar valor
- Definir valor específico
- Formatar valores com milhares
- Lidar com backspace
- Limpar com Delete/Escape

## Benefícios

1. **Experiência do Usuário Melhorada**
   - Entrada intuitiva de valores
   - Menos erros de digitação
   - Formatação automática

2. **Consistência**
   - Mesmo comportamento em todos os campos de valor
   - Código reutilizável

3. **Validação**
   - Aceita apenas números
   - Previne valores inválidos
   - Limite máximo de valor

4. **Acessibilidade**
   - `inputMode="numeric"` para teclado numérico em mobile
   - Suporte a teclas de atalho (Delete, Escape)

## Como Usar em Novos Componentes

```typescript
import { useCurrencyInput } from '../hooks/use-currency-input';

function MeuComponente() {
  const valorInput = useCurrencyInput(0); // valor inicial

  const handleSubmit = () => {
    const valorEmReais = valorInput.numericValue;
    // usar valorEmReais na API
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-2.5 text-gray-600">R$</span>
      <input
        type="text"
        inputMode="numeric"
        value={valorInput.displayValue}
        onChange={valorInput.handleChange}
        onKeyDown={valorInput.handleKeyDown}
        placeholder="0,00"
        className="w-full pl-10 px-3 py-2 border rounded-md"
      />
    </div>
  );
}
```

## Exemplos de Uso

### Exemplo 1: Campo simples
```typescript
const precoInput = useCurrencyInput(0);
// Usuário digita: 1, 2, 3, 4, 5
// Display: 0,01 → 0,12 → 1,23 → 12,34 → 123,45
```

### Exemplo 2: Com valor inicial
```typescript
const precoInput = useCurrencyInput(29.90);
// Display inicial: 29,90
// Usuário pode continuar digitando ou usar backspace
```

### Exemplo 3: Resetar após sucesso
```typescript
const handleSave = async () => {
  await api.save({ preco: precoInput.numericValue });
  precoInput.reset(); // Limpa o campo
};
```

## Notas Técnicas

- O hook usa `useState` internamente para gerenciar o estado
- A formatação usa `toLocaleString('pt-BR')` para separadores de milhares
- O valor é armazenado em centavos como string para evitar problemas de arredondamento
- A conversão para número só ocorre quando necessário (exibição ou submissão)

## Manutenção

Para modificar o comportamento:

1. **Mudar o limite de dígitos**: Edite a linha `const limited = onlyDigits.slice(0, 10);` em `useCurrencyInput`
2. **Mudar o formato de exibição**: Edite a função `formatDisplay` em `useCurrencyInput`
3. **Adicionar validações**: Use o valor `isEmpty` ou `numericValue` antes de submeter

## Status

✅ Implementação concluída
✅ Testes criados
✅ Aplicado em todos os componentes de valores monetários
✅ Documentação criada

