# ⚡ Comandos Rápidos - Sistema RBAC

## 🚀 Instalação Inicial

```bash
# 1. Instalar dependências
cd backend
npm install nodemailer @types/nodemailer

# 2. Configurar variáveis de ambiente
cp env.example .env
# Edite o .env com suas credenciais SMTP

# 3. Reiniciar o servidor
npm run start:dev
```

## 🧪 Testar Configuração de E-mail

```bash
# Teste básico (envia para eduardo.klug7@gmail.com)
cd backend
npx ts-node test-email.ts

# Teste com seu e-mail específico
npx ts-node test-email.ts seu-email@gmail.com
```

## 🗄️ Comandos do Banco de Dados

```bash
# Conectar ao banco
psql -d pdv_dev -U pdv

# Ver estrutura das tabelas
\d users
\d establishments

# Ver todos os usuários com suas roles
SELECT id, email, role FROM users;

# Ver todos os estabelecimentos com status
SELECT name, "statusAprovacao", email FROM establishments;

# Ver estabelecimentos pendentes
SELECT e.name, e.email, u.name as proprietario, e."statusAprovacao" 
FROM establishments e 
JOIN users u ON u.establishment_id = e.id 
WHERE e."statusAprovacao" = 'Pendente';

# Forçar aprovação de um estabelecimento (se necessário)
UPDATE establishments SET "statusAprovacao" = 'Aprovado' WHERE id = 'UUID_AQUI';

# Tornar um usuário admin manualmente (se necessário)
UPDATE users SET role = 'AdministradorSistema' WHERE email = 'eduardo.klug7@gmail.com';

# Limpar banco e recomeçar (CUIDADO!)
DROP DATABASE pdv_dev;
CREATE DATABASE pdv_dev;
\q
# Reinicie o servidor para recriar tabelas
```

## 🔐 Comandos da API (com curl)

### Obter Token JWT

```bash
# 1. Faça login pelo navegador em http://localhost:5173
# 2. Abra DevTools → Application → Local Storage
# 3. Copie o valor de 'token' ou 'access_token'
export TOKEN="seu-token-aqui"
```

### Endpoints de Admin

```bash
# Ver estatísticas
curl -X GET http://localhost:3000/admin/statistics \
  -H "Authorization: Bearer $TOKEN"

# Listar estabelecimentos pendentes
curl -X GET http://localhost:3000/admin/establishments/pending \
  -H "Authorization: Bearer $TOKEN"

# Listar todos os estabelecimentos
curl -X GET http://localhost:3000/admin/establishments \
  -H "Authorization: Bearer $TOKEN"

# Listar apenas aprovados
curl -X GET "http://localhost:3000/admin/establishments?status=Aprovado" \
  -H "Authorization: Bearer $TOKEN"

# Aprovar estabelecimento
curl -X POST http://localhost:3000/admin/approve/ESTABLISHMENT_ID \
  -H "Authorization: Bearer $TOKEN"

# Rejeitar estabelecimento
curl -X POST http://localhost:3000/admin/reject/ESTABLISHMENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"motivo": "Documentação incompleta"}'
```

### Verificar Token JWT

```bash
# Decodificar JWT (online)
# Acesse: https://jwt.io
# Cole seu token

# Decodificar JWT (via jq - se tiver instalado)
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq
```

## 📧 Configurar Gmail SMTP

```bash
# 1. Acesse
open https://myaccount.google.com/security

# 2. Ative "Verificação em duas etapas"
# 3. Vá em "Senhas de app"
# 4. Crie senha para "E-mail" / "Outro: BarTab"
# 5. Copie a senha gerada

# 6. Adicione ao .env
echo "SMTP_USER=seu-email@gmail.com" >> .env
echo "SMTP_PASS=senha-de-app-aqui" >> .env
```

## 🔍 Debug e Logs

```bash
# Ver logs do backend em tempo real
cd backend
tail -f backend.log

# Limpar logs
> backend.log

# Ver apenas logs de e-mail
tail -f backend.log | grep -i "email\|notification"

# Ver apenas erros
tail -f backend.log | grep -i "error"

# Ver logs do NestJS no console
npm run start:dev
```

## 🧹 Limpeza e Reset

```bash
# Limpar build
rm -rf backend/dist/

# Reinstalar dependências
rm -rf backend/node_modules/
cd backend && npm install

# Reset completo do banco (CUIDADO!)
psql -U pdv -c "DROP DATABASE pdv_dev;"
psql -U pdv -c "CREATE DATABASE pdv_dev;"
# Reinicie o servidor

# Forçar rebuild do TypeORM
rm -rf backend/dist/
cd backend
npm run build
npm run start:dev
```

## 📊 Queries Úteis

```sql
-- Ver usuários com seus estabelecimentos
SELECT 
  u.id, 
  u.email, 
  u.role, 
  e.name as estabelecimento, 
  e."statusAprovacao"
FROM users u
JOIN establishments e ON u.establishment_id = e.id;

-- Contar por role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Contar por status
SELECT "statusAprovacao", COUNT(*) FROM establishments GROUP BY "statusAprovacao";

-- Ver último cadastro
SELECT u.email, e.name, e.created_at 
FROM users u
JOIN establishments e ON u.establishment_id = e.id
ORDER BY e.created_at DESC
LIMIT 5;

-- Ver estabelecimentos criados hoje
SELECT e.name, u.email, e.created_at
FROM establishments e
JOIN users u ON u.establishment_id = e.id
WHERE DATE(e.created_at) = CURRENT_DATE;
```

## 🎯 Cenários de Teste Rápido

### Teste 1: Login como Admin
```bash
# 1. Abra em modo anônimo: http://localhost:5173
# 2. Faça login com: eduardo.klug7@gmail.com
# 3. Verifique que consegue acessar: http://localhost:5173/admin (se existir)
```

### Teste 2: Novo Proprietário
```bash
# 1. Abra em modo anônimo
# 2. Faça login com outra conta Google
# 3. Crie estabelecimento "Bar Teste"
# 4. Verifique inbox de eduardo.klug7@gmail.com
# ✅ Deve ter e-mail de alerta
```

### Teste 3: Aprovar Estabelecimento
```bash
# 1. Como admin, execute:
curl -X GET http://localhost:3000/admin/establishments/pending \
  -H "Authorization: Bearer $TOKEN" | jq

# 2. Copie o ID do estabelecimento

# 3. Aprove:
curl -X POST http://localhost:3000/admin/approve/ID_AQUI \
  -H "Authorization: Bearer $TOKEN"

# 4. Verifique e-mail do proprietário
# ✅ Deve ter e-mail de aprovação
```

### Teste 4: Guard de Role
```bash
# Como proprietário (deve FALHAR):
curl -X GET http://localhost:3000/admin/statistics \
  -H "Authorization: Bearer $TOKEN_PROPRIETARIO"
# ✅ Deve retornar 403 Forbidden

# Como admin (deve FUNCIONAR):
curl -X GET http://localhost:3000/admin/statistics \
  -H "Authorization: Bearer $TOKEN_ADMIN"
# ✅ Deve retornar estatísticas
```

## 🔧 Troubleshooting Rápido

### Problema: "Cannot find module 'nodemailer'"
```bash
cd backend
npm install nodemailer @types/nodemailer
npm run start:dev
```

### Problema: Erro ao enviar e-mail
```bash
# Teste a configuração
cd backend
npx ts-node test-email.ts

# Verifique as variáveis
cat .env | grep SMTP
```

### Problema: Column 'role' does not exist
```bash
# Recrie o banco
psql -U pdv -c "DROP DATABASE pdv_dev; CREATE DATABASE pdv_dev;"
cd backend && npm run start:dev
```

### Problema: Guard não funciona (sempre 403)
```bash
# 1. Verifique o token
echo $TOKEN | cut -d'.' -f2 | base64 -d 2>/dev/null | jq

# 2. Verifique se contém 'role'
# 3. Se não, faça logout e login novamente
```

### Problema: Estabelecimento aprovado mas não aparece
```bash
# Força atualização no banco
psql -d pdv_dev -U pdv -c "UPDATE establishments SET \"statusAprovacao\" = 'Aprovado' WHERE name = 'Nome do Bar';"

# Faça logout e login novamente no frontend
```

## 📝 Variáveis de Ambiente Essenciais

```env
# Mínimo necessário para funcionar
DATABASE_URL=postgresql://pdv:pdv@localhost:5432/pdv_dev
JWT_SECRET=seu-secret-super-seguro
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Para notificações funcionarem
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@bartab.com
FRONTEND_URL=http://localhost:5173
```

## 🎨 Atalhos do VSCode

```json
// Adicione em .vscode/settings.json
{
  "rest-client.environmentVariables": {
    "local": {
      "baseUrl": "http://localhost:3000",
      "token": "seu-token-aqui"
    }
  }
}
```

Crie arquivo `backend/api-test.http`:

```http
### Estatísticas
GET {{baseUrl}}/admin/statistics
Authorization: Bearer {{token}}

### Listar Pendentes
GET {{baseUrl}}/admin/establishments/pending
Authorization: Bearer {{token}}

### Aprovar
POST {{baseUrl}}/admin/approve/ESTABLISHMENT_ID
Authorization: Bearer {{token}}
```

## 📚 Links Úteis

- **JWT Decoder**: https://jwt.io
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **NestJS Guards**: https://docs.nestjs.com/guards
- **Nodemailer**: https://nodemailer.com/

## ⚠️ Lembretes Importantes

1. ⚠️ **eduardo.klug7@gmail.com** é o único admin (hard-coded)
2. ⚠️ **Sempre use JwtAuthGuard antes de RolesGuard**
3. ⚠️ **Token JWT expira em 7 dias**
4. ⚠️ **synchronize: true no TypeORM (apenas dev!)**
5. ⚠️ **Faça logout/login após aprovar para ver mudanças**

---

**Sistema:** BarTab RBAC v1.0  
**Referência Rápida** - Mantenha este arquivo acessível!

