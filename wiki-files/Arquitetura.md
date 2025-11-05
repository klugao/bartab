# Arquitetura (C4 + visão técnica)

## Visão de Contexto (C4-1)
- Usuário (atendente/gerente) acessa **Web App (React)**.
- Web App consome **API REST (NestJS)**.
- API persiste dados em **PostgreSQL gerenciado**.

## Visão de Contêiner (C4-2)
- **Frontend (React + TS)**: SPA com rotas (home, detalhe, CRUDs).
- **Backend (NestJS)**: Controllers → Services → Repository/ORM.
- **DB (PostgreSQL)**: Tabelas de clientes, itens, contas, itens da conta e pagamentos.

## Visão de Componentes (C4-3) – Backend
- Módulo **Auth** (JWT, guard).
- Módulo **Customers**.
- Módulo **Items**.
- Módulo **Tabs** (contas).
- Módulo **TabItems** (itens da conta).
- Módulo **Payments**.

## Endpoints (mínimo)
- `POST /auth/login`
- `GET/POST/PUT/DELETE /customers`
- `GET/POST/PUT/DELETE /items`
- `POST /tabs` (abre)
- `GET /tabs?status=OPEN` (lista abertas)
- `GET /tabs/:id` (detalhe)
- `POST /tabs/:id/items` (adiciona item) / `DELETE /tabs/:id/items/:itemId`
- `POST /tabs/:id/payments` (cash|debit|credit|pix|later)
- `PATCH /tabs/:id/close`

## Regras principais
- Total da conta = soma de `tab_items.total`.
- Fechar conta quando `sum(payments.amount) >= total` ou quando método `later` for registrado (fiado).
- `later` atualiza `customers.balance_due` (+valor restante).

## Segurança
- **JWT** (login admin simples).
- **Helmet, CORS, rate limit**.
- **DTOs + class-validator** para inputs.

## Observabilidade
- Logs estruturados.
- `/health` para health check por provedor.

## Deploy
- Frontend: Vercel/Netlify.
- Backend: Render/Railway (Docker opcional).
- CI/CD: GitHub Actions.
