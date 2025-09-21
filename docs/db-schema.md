# Esquema de Banco (DER + definições)

## Tabelas
- **customers**(id PK, name, phone, email, balance_due numeric default 0, created_at timestamp)
- **items**(id PK, name, price numeric, active boolean default true)
- **tabs**(id PK, customer_id FK nullable, status enum OPEN|CLOSED, opened_at, closed_at)
- **tab_items**(id PK, tab_id FK, item_id FK, qty integer, unit_price numeric, total numeric)
- **payments**(id PK, tab_id FK, method enum CASH|DEBIT|CREDIT|PIX|LATER, amount numeric, paid_at timestamp, note text)

## Regras
- `tab_items.total = qty * unit_price`.
- Fechamento da conta: quando `sum(payments) >= sum(tab_items.total)` ou se pagamento `LATER` for lançado.
- `LATER` incrementa `customers.balance_due` pelo valor restante no fechamento.
