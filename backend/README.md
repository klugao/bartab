# Backend (NestJS)

## Scripts
- `npm run start:dev` – desenvolvimento
- `npm run build && npm start` – produção
- `npm test` – testes

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
