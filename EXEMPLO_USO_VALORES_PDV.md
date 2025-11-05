# Exemplo de Uso - Entrada de Valores tipo PDV

## Demonstração Visual do Comportamento

### Cenário: Usuário quer digitar R$ 7,50

**Passo a passo:**

```
Estado Inicial:
┌─────────────────────────┐
│ R$ 0,00                 │
└─────────────────────────┘

Usuário digita: 7
┌─────────────────────────┐
│ R$ 0,07                 │  ← 7 centavos
└─────────────────────────┘

Usuário digita: 5
┌─────────────────────────┐
│ R$ 0,75                 │  ← 75 centavos
└─────────────────────────┘

Usuário digita: 0
┌─────────────────────────┐
│ R$ 7,50                 │  ← 7 reais e 50 centavos ✓
└─────────────────────────┘
```

### Exemplo 2: Valor maior

```
Digitar: 1, 2, 3, 4, 5, 0

R$ 0,01  → Digita 1
R$ 0,12  → Digita 2
R$ 1,23  → Digita 3
R$ 12,34 → Digita 4
R$ 123,45 → Digita 5
R$ 1.234,50 → Digita 0 ✓
```

### Exemplo 3: Usar Backspace

```
Estado: R$ 7,50

Pressiona Backspace
R$ 0,75  ← Remove o último dígito (0)

Pressiona Backspace
R$ 0,07  ← Remove o último dígito (5)

Pressiona Backspace
R$ 0,00  ← Remove o último dígito (7)
```

### Exemplo 4: Limpar tudo

```
Estado: R$ 123,45

Pressiona Delete ou Escape
R$ 0,00  ← Campo limpo
```

## Onde o comportamento foi aplicado

### 1. Cadastro de Produtos (Items.tsx)
- **Campo**: Preço
- **Localização**: Menu lateral → Produtos → Novo Produto
- **Uso**: Ao cadastrar ou editar um produto

### 2. Pagamento de Conta (PaymentModal.tsx)
- **Campo**: Valor do Pagamento
- **Localização**: Ao fechar uma conta
- **Uso**: Define quanto o cliente está pagando
- **Extra**: Atualiza automaticamente com o total da conta

### 3. Registro de Despesa (AddExpenseModal.tsx)
- **Campo**: Valor (R$)
- **Localização**: Dashboard → Adicionar Despesa
- **Uso**: Registrar despesas do estabelecimento

### 4. Pagamento de Dívida (PayDebtModal.tsx)
- **Campo**: Valor do Pagamento
- **Localização**: Clientes → Cliente com dívida → Pagar
- **Uso**: Registrar pagamento de dívida do cliente
- **Extra**: Botão "Total" para preencher valor completo automaticamente

## Comparação: Antes vs Depois

### ❌ Comportamento ANTERIOR
```
Usuário digita: 7.5
Campo mostra: 7.5
Precisa: adicionar zero manualmente → 7.50
```

### ✅ Comportamento NOVO
```
Usuário digita: 7, 5, 0
Campo mostra: 0,07 → 0,75 → 7,50
Resultado: formatação automática e intuitiva!
```

## Vantagens em Dispositivos Móveis

No celular ou tablet:
- Abre teclado numérico automaticamente (`inputMode="numeric"`)
- Entrada mais rápida e com menos erros
- Não precisa trocar para teclado de símbolos
- Não precisa digitar vírgula ou ponto

## Dicas de Uso

1. **Para digitar R$ 10,00**: Digite `1`, `0`, `0`, `0`
2. **Para digitar R$ 0,50**: Digite `5`, `0`
3. **Para digitar R$ 100,00**: Digite `1`, `0`, `0`, `0`, `0`
4. **Para corrigir erro**: Use Backspace para apagar dígito por dígito
5. **Para recomeçar**: Pressione Delete ou Escape

## Testando a Funcionalidade

### Teste 1: Cadastro de Produto
1. Abra o menu lateral
2. Clique em "Produtos"
3. Clique em "Novo Produto"
4. No campo "Preço", digite: 7, 5, 0
5. Você deve ver: R$ 7,50

### Teste 2: Pagamento
1. Crie uma nova conta
2. Adicione alguns produtos
3. Clique em "Fechar Conta"
4. No campo "Valor do Pagamento", experimente digitar valores
5. Use Backspace para testar a remoção de dígitos

### Teste 3: Backspace
1. Em qualquer campo de valor
2. Digite alguns números: 1, 2, 3
3. Pressione Backspace várias vezes
4. Observe como os dígitos são removidos um por um

## Perguntas Frequentes

**Q: E se eu quiser digitar R$ 7,00?**
A: Digite `7`, `0`, `0`

**Q: Como digito centavos exatos como R$ 0,25?**
A: Digite `2`, `5`

**Q: E se eu errar?**
A: Use Backspace para apagar dígito por dígito, ou Delete/Escape para limpar tudo

**Q: Funciona com copiar e colar?**
A: Sim, mas apenas os números serão aceitos. Se colar "R$ 123,45", o sistema vai pegar apenas "12345"

**Q: Qual o valor máximo?**
A: R$ 99.999.999,99 (10 dígitos)

## Código de Exemplo

Se você quiser usar em outros lugares:

```typescript
import { useCurrencyInput } from '../hooks/use-currency-input';

function MeuFormulario() {
  const valorInput = useCurrencyInput(0);

  const handleSalvar = () => {
    console.log('Valor em reais:', valorInput.numericValue);
    // Envia para API: { valor: valorInput.numericValue }
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

