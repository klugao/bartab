# Decisões Técnicas (ADR resumido)

- **Linguagem/Stack**: TypeScript em **React (frontend)** e **NestJS (backend)** – ampla comunidade, produtividade e tipagem estática.
- **Banco**: **PostgreSQL** gerenciado – robusto, aderente a produção.
- **Arquitetura**: Client-Server em camadas; modelos C4 documentados.
- **Qualidade**: ESLint + Prettier; SOLID/DRY/KISS/YAGNI; TDD onde viável.
- **Infra**: CI/CD via GitHub Actions; deploy em provedores gerenciados.
- **Segurança**: JWT, Helmet, CORS, validação e sanitização de inputs.
- **Observabilidade**: logs estruturados e health-check.
- **Docs**: README, `/docs` e Wiki.
