# Segurança

- **Autenticação**: JWT simples (usuário admin).
- **Autorização**: guards por rota sensível (CRUDs e operações financeiras).
- **Proteções**: Helmet, CORS restrito por origin, rate limit básico.
- **Validação/Sanitização**: DTOs com `class-validator`; nunca confiar em input.
- **Segredos**: `.env` não versionado; usar Secrets no provedor/CI.
- **Erros/Logs**: tratar erros sem expor dados sensíveis; logs estruturados.
