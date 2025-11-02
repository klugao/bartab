# 🚀 Instalação do Sistema RBAC e Notificações

## Passo 1: Instalar Dependências

Execute no diretório `backend/`:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## Passo 2: Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp env.example .env
```

2. Edite o arquivo `.env` e configure:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@bartab.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Como gerar senha de app do Gmail:

1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Vá em "Senhas de app"
4. Selecione "E-mail" e "Outro (Nome personalizado)"
5. Digite "BarTab Backend"
6. Copie a senha gerada (16 caracteres)
7. Cole em `SMTP_PASS` no arquivo `.env`

## Passo 3: Reiniciar o Backend

```bash
# Parar o servidor (se estiver rodando)
# Pressione Ctrl+C

# Limpar o build anterior
rm -rf dist/

# Reconstruir
npm run build

# Iniciar em modo desenvolvimento
npm run start:dev
```

## Passo 4: Verificar a Instalação

### 4.1. Verificar se as tabelas foram atualizadas

O TypeORM deve atualizar automaticamente as tabelas com as novas colunas:
- `users.role`
- `establishments.statusAprovacao`

Verifique no PostgreSQL:

```bash
psql -d pdv_dev -U pdv
```

```sql
-- Ver estrutura da tabela users
\d users

-- Ver estrutura da tabela establishments
\d establishments

-- Ver usuários existentes
SELECT id, email, role FROM users;

-- Ver estabelecimentos existentes
SELECT id, name, "statusAprovacao" FROM establishments;
```

### 4.2. Testar endpoints de admin

```bash
# 1. Faça login como admin (eduardo.klug7@gmail.com)
# 2. Copie o token JWT
# 3. Teste o endpoint de estatísticas

curl -X GET http://localhost:3000/admin/statistics \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Resposta esperada:
```json
{
  "total": 1,
  "pendentes": 0,
  "aprovados": 1,
  "rejeitados": 0
}
```

## Passo 5: Testar Notificações por E-mail

### 5.1. Criar script de teste

Crie o arquivo `backend/test-email.ts`:

```typescript
import { NotificationService } from './src/modules/notification/notification.service';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

const configService = new ConfigService();
const notificationService = new NotificationService(configService);

async function test() {
  console.log('🧪 Testando envio de e-mail...');
  
  try {
    await notificationService.sendAdminNewSignupAlert(
      'Bar de Teste',
      'teste@example.com'
    );
    console.log('✅ E-mail enviado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
  }
}

test();
```

### 5.2. Executar teste

```bash
npx ts-node test-email.ts
```

## Passo 6: Testar Fluxo Completo

### Cenário 1: Novo Proprietário se Cadastra

1. Abra o frontend em modo anônimo/privado
2. Faça login com uma conta Google diferente de `eduardo.klug7@gmail.com`
3. Forneça um nome de estabelecimento (ex: "Restaurante Teste")
4. **Verificações:**
   - ✅ Login foi bem-sucedido
   - ✅ Estabelecimento criado com status "Pendente"
   - ✅ E-mail enviado para eduardo.klug7@gmail.com
   - ✅ Token JWT contém `"role": "Proprietario"`

### Cenário 2: Admin Aprova Estabelecimento

1. Faça login como admin (eduardo.klug7@gmail.com)
2. Liste estabelecimentos pendentes:
```bash
curl -X GET http://localhost:3000/admin/establishments/pending \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

3. Aprove um estabelecimento:
```bash
curl -X POST http://localhost:3000/admin/approve/ID_DO_ESTABELECIMENTO \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

4. **Verificações:**
   - ✅ Status do estabelecimento mudou para "Aprovado"
   - ✅ E-mail de aprovação enviado para o proprietário
   - ✅ Proprietário pode fazer login e usar o sistema

### Cenário 3: Admin Rejeita Estabelecimento

```bash
curl -X POST http://localhost:3000/admin/reject/ID_DO_ESTABELECIMENTO \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"motivo": "Documentação incompleta"}'
```

**Verificações:**
- ✅ Status mudou para "Rejeitado"
- ✅ E-mail de rejeição enviado

## Troubleshooting

### ❌ Erro: "Cannot find module 'nodemailer'"

**Solução:**
```bash
npm install nodemailer @types/nodemailer
```

### ❌ Erro ao enviar e-mail: "Invalid login"

**Possíveis causas:**
1. SMTP_USER ou SMTP_PASS incorretos
2. Não usou senha de app (se Gmail)
3. Verificação em duas etapas não ativada

**Solução:**
1. Verifique as credenciais no `.env`
2. Gere uma nova senha de app
3. Teste com o script `test-email.ts`

### ❌ Erro: "Column 'role' does not exist"

**Solução:**
```bash
# Parar o servidor
# Deletar e recriar o banco (CUIDADO: perde dados!)
psql -U pdv -c "DROP DATABASE pdv_dev;"
psql -U pdv -c "CREATE DATABASE pdv_dev;"

# Reiniciar o servidor (TypeORM recriará as tabelas)
npm run start:dev
```

### ❌ Guards não funcionam (sempre retorna 403)

**Checklist:**
1. ✅ JWT válido?
2. ✅ Token inclui campo `role`? (decodifique em jwt.io)
3. ✅ Ordem dos guards correta? (`JwtAuthGuard` antes de `RolesGuard`)
4. ✅ Decorator `@Roles()` aplicado?

### ❌ Estabelecimento aprovado mas proprietário ainda vê "Pendente"

**Solução:**
- Faça logout e login novamente
- O status está no token JWT, que só atualiza no login

## Próximos Passos

Após a instalação bem-sucedida:

1. 📖 Leia a documentação completa: `RBAC_E_NOTIFICACOES.md`
2. 🎨 Implemente tela de admin no frontend
3. 🧪 Adicione testes automatizados
4. 🔐 Configure SSL/TLS para e-mails em produção
5. 📊 Crie dashboard de estatísticas

## Suporte

Se encontrar problemas:
1. Verifique os logs: `tail -f backend.log`
2. Verifique o console do NestJS
3. Revise a documentação em `RBAC_E_NOTIFICACOES.md`

---

**Data:** 02/11/2025
**Sistema:** BarTab RBAC v1.0

