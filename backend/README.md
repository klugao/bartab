# Backend (NestJS)

## Scripts
- `yarn start:dev` – desenvolvimento
- `yarn build && yarn start` – produção
- `yarn test` – testes

## Env
Crie `.env` a partir de `.env.example`:
```
DATABASE_URL=postgres://user:pass@host:5432/pdv
JWT_SECRET=changeme
NODE_ENV=development
```

## Padrão de módulos
- `auth`, `customers`, `items`, `tabs`, `tab-items`, `payments`

## Qualidade
- DTOs com `class-validator`, filtros de exceção, logs.
