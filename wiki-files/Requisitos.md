# Requisitos Funcionais (RF) e Não Funcionais (RNF)

## RF – Funcionais
- **RF-01**: CRUD de Clientes (criar, listar, atualizar, desativar).
- **RF-02**: CRUD de Itens (criar, listar, atualizar, desativar).
- **RF-03**: Abrir conta/mesa vinculada (opcionalmente) a um cliente.
- **RF-04**: Adicionar/remover itens na conta, com quantidade e preço unitário.
- **RF-05**: Calcular totais da conta (subtotal, descontos/serviço se houver, total).
- **RF-06**: Registrar **pagamento**: dinheiro, débito, crédito, pix, **pagar depois**.
- **RF-07**: Ao usar **pagar depois**, atualizar **saldo devedor do cliente**.
- **RF-08**: Fechar conta quando saldo quitado ou quando marcado para fiado.
- **RF-09**: Listar **contas abertas** (home com cards) e **detalhar conta**.
- **RF-10**: (Opcional) Relatório simples de vendas e fiados por período.

## RNF – Não Funcionais
- **RNF-01**: Disponibilidade mínima para o Demo Day.
- **RNF-02**: Aplicar padrões de código (ESLint/Prettier) e boas práticas (SOLID/DRY/KISS).
- **RNF-03**: Segurança básica: validação, sanitização, JWT, CORS, Helmet.
- **RNF-04**: Observabilidade básica: logs estruturados e endpoint de health-check.
- **RNF-05**: Documentação mínima no repo (README e /docs) e Wiki.
- **RNF-06**: CI/CD configurado (build, testes e deploy automático na `main`).

## Casos de Uso / User Stories
Ver `docs/user-stories.md`.
