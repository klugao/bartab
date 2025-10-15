# Funcionalidade de Controle de Dívidas

## Visão Geral
A funcionalidade de controle de dívidas permite gerenciar clientes que possuem contas pendentes, seja por pagamento "fiado" (pagar depois) ou por pagamento parcial.

## Funcionalidades Implementadas

### Backend

#### Endpoints Criados

1. **GET /api/customers/debts/list**
   - Lista todos os clientes com dívidas (balance_due < 0)
   - Retorna apenas contas fechadas que ainda têm saldo devedor
   - Inclui detalhes de itens e pagamentos de cada conta

2. **POST /api/customers/:id/pay-debt**
   - Registra um pagamento de dívida para um cliente
   - Suporta pagamento parcial ou total
   - Body: `{ amount: string, method: string, note?: string }`

#### Lógica de Negócio

- **Identificação de Dívidas**: Clientes com `balance_due < 0` são considerados devedores
- **Cálculo de Saldo**: Para cada conta fechada, calcula Total - Pago = Saldo Devedor
- **Pagamento**: Ao receber pagamento, atualiza o `balance_due` do cliente
- **Remoção da Lista**: Quando `balance_due >= 0`, o cliente sai automaticamente da lista de dívidas

### Frontend

#### Tela de Dívidas (`/debts`)

**Características:**
- Lista expansível de clientes com dívidas
- Exibe dívida total de cada cliente
- Mostra detalhes das contas com saldo devedor ao expandir
- Para cada conta, exibe:
  - Data de fechamento
  - Itens consumidos com quantidades e valores
  - Pagamentos já realizados
  - Total da conta, valor pago e saldo restante

**Ações Disponíveis:**
- Registrar pagamento (parcial ou total)
- Visualizar histórico de consumo e pagamentos

#### Modal de Pagamento (`PayDebtModal`)

**Funcionalidades:**
- Exibe dívida total do cliente
- Permite inserir valor do pagamento
- Botão "Total" para pagar o valor completo
- Alerta de pagamento parcial quando valor < dívida total
- Seleção do método de pagamento:
  - Dinheiro (CASH)
  - Débito (DEBIT)
  - Crédito (CREDIT)
  - PIX
- Campo opcional para observações
- Resumo do pagamento antes de confirmar

## Fluxo de Uso

1. **Acesso**: Clicar em "Dívidas" no menu de navegação
2. **Visualização**: Ver lista de clientes com dívidas ordenados por nome
3. **Detalhes**: Clicar no nome do cliente para expandir e ver contas pendentes
4. **Pagamento**: Clicar em "Registrar Pagamento"
5. **Escolha**: Selecionar valor (parcial ou total) e método de pagamento
6. **Confirmação**: Revisar resumo e confirmar
7. **Atualização**: Lista é atualizada automaticamente

## Integração com Sistema Existente

### Como as Dívidas São Criadas

1. **Pagamento "Fiado" (LATER)**:
   - Cliente fecha conta e escolhe "Pagar Depois"
   - O valor total é adicionado ao `balance_due` como negativo
   - Conta é fechada

2. **Pagamento Parcial**:
   - Cliente paga parte da conta
   - Se for com método LATER, o restante vai para `balance_due`
   - Se for pagamento normal parcial, a conta fica com saldo devedor

### Como as Dívidas São Quitadas

1. Cliente aparece na tela de Dívidas
2. Gerente registra pagamento
3. `balance_due` é atualizado (valor negativo + pagamento)
4. Se `balance_due >= 0`, cliente sai da lista automaticamente

## Validações

- Valor do pagamento deve ser maior que zero
- Valor do pagamento não pode exceder a dívida total
- Método de pagamento é obrigatório
- Cliente deve existir e ter dívidas

## Melhorias Futuras

- [ ] Histórico de pagamentos de dívidas
- [ ] Notificações/alertas para clientes com dívidas
- [ ] Relatório de dívidas por período
- [ ] Exportação de lista de devedores
- [ ] Sistema de lembretes/cobrança
- [ ] Juros sobre dívidas em atraso
- [ ] Parcelamento de dívidas

## Segurança

- Todos os endpoints exigem autenticação (quando JWT estiver implementado)
- Validação de valores numéricos no backend
- Proteção contra valores negativos ou inválidos
- Logs de todas as operações de pagamento

## Tecnologias Utilizadas

### Backend
- NestJS
- TypeORM
- PostgreSQL

### Frontend
- React
- TypeScript
- TailwindCSS
- Heroicons
- React Router

## Estrutura de Arquivos

```
backend/
  src/modules/customers/
    services/customers.service.ts (métodos de dívidas)
    controllers/customers.controller.ts (endpoints de dívidas)

frontend/
  src/
    pages/Debts.tsx (tela principal)
    components/PayDebtModal.tsx (modal de pagamento)
    services/api.ts (chamadas à API)
```

