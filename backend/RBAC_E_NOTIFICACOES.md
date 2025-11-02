# Sistema RBAC e Notificações - BarTab

## 📋 Visão Geral

Este documento descreve a implementação completa do sistema de **RBAC (Role-Based Access Control)** e **Notificações por E-mail** no BarTab.

## 🎯 Funcionalidades Implementadas

### 1. Sistema de Roles (Papéis)

Dois tipos de usuários:

- **`Proprietario`**: Dono de um estabelecimento, pode gerenciar apenas seu próprio estabelecimento
- **`AdministradorSistema`**: Administrador geral do sistema, pode aprovar/rejeitar estabelecimentos e acessar todos os dados

### 2. Fluxo de Aprovação de Estabelecimentos

1. Um novo usuário faz login com Google OAuth
2. O sistema verifica o e-mail:
   - Se for `eduardo.klug7@gmail.com` → role `AdministradorSistema` (aprovado automaticamente)
   - Caso contrário → role `Proprietario` (status `Pendente`)
3. Se for Proprietário, um e-mail é enviado para o administrador
4. O administrador aprova ou rejeita através da API
5. O proprietário recebe e-mail de aprovação/rejeição

### 3. Sistema de Notificações por E-mail

Três tipos de e-mails automatizados:

#### 🚨 Alerta de Novo Cadastro (para Admin)
- **Quando**: Novo proprietário se cadastra
- **Para**: eduardo.klug7@gmail.com
- **Conteúdo**: Nome do estabelecimento e e-mail do proprietário

#### ✅ E-mail de Aprovação (para Proprietário)
- **Quando**: Administrador aprova estabelecimento
- **Para**: E-mail do proprietário
- **Conteúdo**: Confirmação de aprovação e link para acessar o sistema

#### ❌ E-mail de Rejeição (para Proprietário)
- **Quando**: Administrador rejeita estabelecimento
- **Para**: E-mail do proprietário
- **Conteúdo**: Notificação de rejeição com motivo (opcional)

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
# JWT
JWT_SECRET=seu-secret-super-seguro-aqui

# Configurações de E-mail (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@bartab.com

# URL do Frontend (para links nos e-mails)
FRONTEND_URL=http://localhost:5173
```

### 2. Configurar Gmail para SMTP

Se usar Gmail:

1. Acesse: https://myaccount.google.com/security
2. Ative a verificação em duas etapas
3. Vá em "Senhas de app"
4. Crie uma senha de app para "E-mail"
5. Use essa senha no `SMTP_PASS`

### 3. Instalar Dependência

```bash
cd backend
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## 📚 Estrutura de Arquivos

```
backend/src/
├── common/
│   ├── enums/
│   │   ├── user-role.enum.ts          # Enum de roles
│   │   ├── approval-status.enum.ts    # Enum de status de aprovação
│   │   └── index.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts          # Guard de autenticação JWT (existente)
│   │   ├── roles.guard.ts             # Guard de verificação de roles
│   │   ├── establishment-access.guard.ts  # Guard de acesso a estabelecimento
│   │   └── index.ts
│   └── decorators/
│       ├── roles.decorator.ts         # Decorator @Roles()
│       └── index.ts
├── modules/
│   ├── auth/
│   │   ├── entities/
│   │   │   ├── user.entity.ts         # ✏️ Modificado (+ campo role)
│   │   │   └── establishment.entity.ts # ✏️ Modificado (+ campo statusAprovacao)
│   │   ├── services/
│   │   │   └── auth.service.ts        # ✏️ Modificado (lógica de role e notificações)
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts        # ✏️ Modificado (+ role no payload)
│   │   └── auth.module.ts             # ✏️ Modificado (+ NotificationModule)
│   ├── admin/
│   │   ├── admin.controller.ts        # ✨ Novo
│   │   ├── admin.service.ts           # ✨ Novo
│   │   └── admin.module.ts            # ✨ Novo
│   └── notification/
│       ├── notification.service.ts    # ✨ Novo
│       └── notification.module.ts     # ✨ Novo
└── app.module.ts                      # ✏️ Modificado (+ AdminModule)
```

## 🔐 Uso dos Guards

### 1. RolesGuard - Proteger rotas por role

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMINISTRADOR_SISTEMA)  // Apenas admins
export class AdminController {
  @Get('dashboard')
  getDashboard() {
    return { message: 'Dashboard do Admin' };
  }
}
```

### 2. EstablishmentAccessGuard - Proteger acesso a estabelecimentos

```typescript
import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EstablishmentAccessGuard } from '../../common/guards/establishment-access.guard';

@Controller('establishments')
@UseGuards(JwtAuthGuard, EstablishmentAccessGuard)
export class EstablishmentsController {
  @Get(':establishmentId/data')
  getData(@Param('establishmentId') id: string) {
    // Proprietário só acessa seu estabelecimento
    // Admin acessa qualquer estabelecimento
    return { data: 'dados do estabelecimento' };
  }
}
```

## 🛣️ Rotas da API

### Rotas de Administração

Todas protegidas por `@Roles(UserRole.ADMINISTRADOR_SISTEMA)`

#### 1. Listar Estabelecimentos Pendentes
```http
GET /admin/establishments/pending
Authorization: Bearer <token>
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "name": "Bar do João",
    "email": "bar@example.com",
    "statusAprovacao": "Pendente",
    "created_at": "2025-11-02T10:00:00Z",
    "proprietario": {
      "name": "João Silva",
      "email": "joao@example.com"
    }
  }
]
```

#### 2. Listar Todos os Estabelecimentos
```http
GET /admin/establishments?status=Aprovado
Authorization: Bearer <token>
```

**Query Params:**
- `status` (opcional): `Pendente`, `Aprovado`, ou `Rejeitado`

#### 3. Aprovar Estabelecimento
```http
POST /admin/approve/:idEstabelecimento
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "message": "Estabelecimento aprovado com sucesso",
  "establishment": {
    "id": "uuid",
    "name": "Bar do João",
    "statusAprovacao": "Aprovado"
  }
}
```

**⚡ Ação Automática:** Envia e-mail de aprovação para o proprietário

#### 4. Rejeitar Estabelecimento
```http
POST /admin/reject/:idEstabelecimento
Authorization: Bearer <token>
Content-Type: application/json

{
  "motivo": "Documentação incompleta"
}
```

**⚡ Ação Automática:** Envia e-mail de rejeição para o proprietário

#### 5. Obter Estatísticas
```http
GET /admin/statistics
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "total": 50,
  "pendentes": 5,
  "aprovados": 42,
  "rejeitados": 3
}
```

## 🧪 Como Testar

### 1. Testar Login como Administrador

1. Faça logout (se estiver logado)
2. Faça login com a conta Google: **eduardo.klug7@gmail.com**
3. Verifique que o token JWT contém: `"role": "AdministradorSistema"`
4. Tente acessar as rotas de admin

### 2. Testar Login como Proprietário

1. Faça login com qualquer outra conta Google
2. Forneça um nome de estabelecimento
3. **Resultado esperado:**
   - Status do estabelecimento: `Pendente`
   - Role do usuário: `Proprietario`
   - E-mail enviado para eduardo.klug7@gmail.com

### 3. Testar Aprovação

1. Faça login como admin
2. Chame `GET /admin/establishments/pending`
3. Pegue o ID de um estabelecimento pendente
4. Chame `POST /admin/approve/{id}`
5. **Resultado esperado:**
   - Status muda para `Aprovado`
   - E-mail enviado para o proprietário

### 4. Testar Guards

```bash
# Como Proprietário - deve FALHAR
curl -X GET http://localhost:3000/admin/establishments \
  -H "Authorization: Bearer <token-proprietario>"

# Como Admin - deve FUNCIONAR
curl -X GET http://localhost:3000/admin/establishments \
  -H "Authorization: Bearer <token-admin>"
```

## 📧 Payload do JWT

Após o login, o token JWT contém:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "establishmentId": "establishment-uuid",
  "role": "Proprietario",  // ou "AdministradorSistema"
  "iat": 1699000000,
  "exp": 1699604800
}
```

## 🎨 Exemplo de Resposta de Login

```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "joao@example.com",
    "name": "João Silva",
    "picture": "https://...",
    "role": "Proprietario",
    "establishment": {
      "id": "uuid",
      "name": "Bar do João",
      "statusAprovacao": "Pendente"
    }
  }
}
```

## ⚠️ Pontos Importantes

1. **E-mail do Admin é Hard-coded**: O e-mail `eduardo.klug7@gmail.com` é definido no código como administrador único
2. **Sincronização do Banco**: Com `synchronize: true`, as alterações nas entities são aplicadas automaticamente
3. **Fallback de Notificações**: Se o envio de e-mail falhar, não bloqueia o fluxo (exceto no e-mail de aprovação)
4. **Guards em Ordem**: Sempre use `JwtAuthGuard` antes de `RolesGuard`
5. **TypeORM Relations**: As queries incluem `relations: ['establishment']` para carregar dados relacionados

## 🚀 Próximos Passos (Sugestões)

1. **Frontend**: Criar tela de admin para gerenciar aprovações
2. **Dashboard**: Mostrar estatísticas visuais no painel admin
3. **Múltiplos Admins**: Criar tabela de configuração para definir múltiplos admins
4. **Logs de Auditoria**: Registrar todas as ações de aprovação/rejeição
5. **Templates de E-mail**: Usar templates mais sofisticados (Handlebars, Pug, etc)
6. **Notificações In-App**: Além de e-mail, mostrar notificações dentro do sistema

## 📝 Comandos Úteis

```bash
# Instalar dependências
npm install nodemailer @types/nodemailer

# Build
npm run build

# Desenvolvimento
npm run start:dev

# Ver logs
tail -f backend.log

# Consultar usuários no banco
psql -d pdv_dev -U pdv -c "SELECT email, role FROM users;"

# Consultar estabelecimentos no banco
psql -d pdv_dev -U pdv -c "SELECT name, \"statusAprovacao\" FROM establishments;"
```

## 🐛 Troubleshooting

### E-mails não estão sendo enviados

1. Verifique as credenciais SMTP no `.env`
2. Verifique os logs: `tail -f backend.log`
3. Se usar Gmail, confirme que a senha de app está correta
4. Teste o transporter manualmente

### Guard retorna 403

1. Verifique se o usuário está autenticado (JWT válido)
2. Verifique se a role está no token: decodifique o JWT em jwt.io
3. Confirme que o decorator `@Roles()` está aplicado corretamente
4. Verifique a ordem dos guards: `JwtAuthGuard` deve vir antes

### Estabelecimento não aparece como aprovado

1. Verifique o status no banco de dados
2. Confirme que a query incluiu `relations: ['establishment']`
3. Faça logout e login novamente para atualizar o token

---

**Desenvolvido para o BarTab** 🍺
**Data de Implementação:** 02/11/2025

