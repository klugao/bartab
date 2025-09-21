# User Stories (com critérios de aceite)

## US-01: Como atendente, quero abrir uma conta/mesa, para iniciar o consumo.
**Critérios de aceite:**
- Informar cliente (opcional) e número/identificação da mesa.
- Estado inicial da conta: **OPEN**.
- A conta aparece na home entre as **contas abertas**.

## US-02: Como atendente, quero adicionar/remover itens na conta, para registrar consumos.
**Critérios de aceite:**
- Informar item, quantidade e preço unitário (default do catálogo).
- Atualizar total da conta imediatamente.
- Remoção reflete no total.

## US-03: Como atendente, quero visualizar o detalhe da conta, para conferir itens e total.
**Critérios de aceite:**
- Listar itens com quantidade, unitário e total parcial.
- Mostrar subtotal e total geral.

## US-04: Como atendente, quero registrar pagamento, para encerrar a conta.
**Critérios de aceite:**
- Métodos: **cash, debit, credit, pix, later**.
- Permitir pagamentos parciais (múltiplos lançamentos).
- Exibir valor restante após cada pagamento.

## US-05: Como atendente, quero usar **pagar depois**, para deixar o saldo no nome do cliente.
**Critérios de aceite:**
- Registrar pagamento `later` e **atualizar balance_due do cliente**.
- Marcar conta como **CLOSED**.
- Histórico registra a operação.

## US-06: Como gerente, quero manter catálogo de itens, para padronizar preços.
**Critérios de aceite:**
- CRUD de itens com flag `active`.
- Preço unitário utilizado como padrão nas contas.

## US-07: Como gerente, quero gerenciar clientes, para controlar fiados.
**Critérios de aceite:**
- CRUD de clientes com `balance_due` acumulado.
- (Opcional) Listagem de clientes com saldo > 0.

## US-08: (Opcional) Como gerente, quero ver um resumo por período, para acompanhar vendas.
**Critérios de aceite:**
- Endpoint/relatório com total de vendas e fiados (por data).
