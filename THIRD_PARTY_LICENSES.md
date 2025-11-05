# 📚 Licenças de Terceiros - BarTab

Este documento lista as principais dependências de código aberto utilizadas no projeto BarTab e suas respectivas licenças.

## Backend (NestJS)

| Pacote | Versão | Licença | Link |
|--------|--------|---------|------|
| **@nestjs/common** | ^11.0.1 | MIT | https://github.com/nestjs/nest |
| **@nestjs/core** | ^11.0.1 | MIT | https://github.com/nestjs/nest |
| **@nestjs/jwt** | ^11.0.0 | MIT | https://github.com/nestjs/jwt |
| **@nestjs/passport** | ^11.0.5 | MIT | https://github.com/nestjs/passport |
| **@nestjs/typeorm** | ^11.0.0 | MIT | https://github.com/nestjs/typeorm |
| **TypeORM** | ^0.3.25 | MIT | https://github.com/typeorm/typeorm |
| **Express** | - | MIT | https://github.com/expressjs/express |
| **Passport** | ^0.7.0 | MIT | https://github.com/jaredhanson/passport |
| **passport-google-oauth20** | ^2.0.0 | MIT | https://github.com/jaredhanson/passport-google-oauth2 |
| **passport-jwt** | ^4.0.1 | MIT | https://github.com/mikenicholson/passport-jwt |
| **bcryptjs** | ^3.0.2 | MIT | https://github.com/dcodeIO/bcrypt.js |
| **helmet** | ^8.1.0 | MIT | https://github.com/helmetjs/helmet |
| **class-validator** | ^0.14.2 | MIT | https://github.com/typestack/class-validator |
| **class-transformer** | ^0.5.1 | MIT | https://github.com/typestack/class-transformer |
| **pg** (PostgreSQL) | ^8.16.3 | MIT | https://github.com/brianc/node-postgres |
| **nodemailer** | ^7.0.10 | MIT | https://github.com/nodemailer/nodemailer |
| **TypeScript** | ^5.7.3 | Apache-2.0 | https://github.com/microsoft/TypeScript |
| **Jest** | ^30.0.0 | MIT | https://github.com/facebook/jest |

## Frontend (React)

| Pacote | Versão | Licença | Link |
|--------|--------|---------|------|
| **React** | ^18.3.1 | MIT | https://github.com/facebook/react |
| **React DOM** | ^18.3.1 | MIT | https://github.com/facebook/react |
| **React Router** | ^7.8.0 | MIT | https://github.com/remix-run/react-router |
| **Vite** | ^7.1.2 | MIT | https://github.com/vitejs/vite |
| **Tailwind CSS** | ^3.4.14 | MIT | https://github.com/tailwindlabs/tailwindcss |
| **Axios** | ^1.11.0 | MIT | https://github.com/axios/axios |
| **React Hook Form** | ^7.63.0 | MIT | https://github.com/react-hook-form/react-hook-form |
| **Zod** | ^4.1.11 | MIT | https://github.com/colinhacks/zod |
| **Radix UI** | Vários | MIT | https://github.com/radix-ui/primitives |
| **Headless UI** | ^2.2.7 | MIT | https://github.com/tailwindlabs/headlessui |
| **Heroicons** | ^2.2.0 | MIT | https://github.com/tailwindlabs/heroicons |
| **Lucide React** | ^0.544.0 | ISC | https://github.com/lucide-icons/lucide |
| **localForage** | ^1.10.0 | Apache-2.0 | https://github.com/localForage/localForage |
| **Vite PWA Plugin** | ^1.1.0 | MIT | https://github.com/vite-pwa/vite-plugin-pwa |
| **Vitest** | ^1.0.4 | MIT | https://github.com/vitest-dev/vitest |
| **TypeScript** | ^5.8.3 | Apache-2.0 | https://github.com/microsoft/TypeScript |

## Infraestrutura e Ferramentas

| Tecnologia | Licença | Link |
|------------|---------|------|
| **PostgreSQL** | PostgreSQL License | https://www.postgresql.org/ |
| **Docker** | Apache-2.0 | https://www.docker.com/ |
| **Node.js** | MIT | https://nodejs.org/ |

## Resumo de Licenças

### MIT License
A maioria das dependências utiliza a **Licença MIT**, que é uma licença permissiva que permite:
- ✅ Uso comercial
- ✅ Modificação
- ✅ Distribuição
- ✅ Uso privado

**Requisitos:**
- Incluir o aviso de copyright e licença em cópias do software

### Apache 2.0 License
Algumas dependências utilizam **Apache 2.0**, que é similar ao MIT, mas com:
- ✅ Concessão expressa de patentes
- ✅ Proteção contra uso de marcas registradas

### ISC License
A licença **ISC** (Lucide React) é funcionalmente equivalente ao MIT.

### PostgreSQL License
Licença permissiva similar ao MIT/BSD.

## Conformidade

✅ Todas as dependências listadas possuem **licenças open-source permissivas**  
✅ Não há conflito entre as licenças das dependências  
✅ O uso comercial é permitido por todas as licenças  
✅ O projeto BarTab está em conformidade com todas as licenças de terceiros

## Atribuições Especiais

Agradecimentos aos mantenedores e contribuidores de todos os projetos open-source listados acima, que tornam possível o desenvolvimento do BarTab.

## Responsabilidade

O projeto BarTab **não modifica** o código das bibliotecas de terceiros. Utilizamos essas bibliotecas conforme suas licenças originais.

## Atualizações

Este documento é atualizado sempre que uma nova dependência significativa é adicionada ao projeto.

**Última atualização:** 05 de novembro de 2025

---

## Como Verificar Licenças

Para verificar as licenças de todas as dependências:

### Backend
```bash
cd backend
npx license-checker --summary
```

### Frontend
```bash
cd frontend
npx license-checker --summary
```

---

✅ **Conformidade verificada com requisitos de licenciamento de software de terceiros.**

