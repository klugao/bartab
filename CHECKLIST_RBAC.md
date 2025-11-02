# ✅ Checklist de Implementação - Sistema RBAC

## 📋 Verificação Pós-Implementação

### Etapa 1: Dependências ⚙️

- [ ] `nodemailer` instalado
- [ ] `@types/nodemailer` instalado (devDependencies)
- [ ] `package.json` atualizado com as novas dependências
- [ ] `node_modules` reinstalado se necessário

**Comando de verificação:**
```bash
cd backend
npm list nodemailer @types/nodemailer
```

### Etapa 2: Variáveis de Ambiente 🔧

- [ ] Arquivo `.env` existe
- [ ] `SMTP_HOST` configurado
- [ ] `SMTP_PORT` configurado
- [ ] `SMTP_USER` configurado
- [ ] `SMTP_PASS` configurado (senha de app do Gmail)
- [ ] `SMTP_FROM` configurado
- [ ] `FRONTEND_URL` configurado
- [ ] `JWT_SECRET` configurado
- [ ] `GOOGLE_CLIENT_ID` configurado
- [ ] `GOOGLE_CLIENT_SECRET` configurado

**Comando de verificação:**
```bash
cd backend
cat .env | grep -E "SMTP_|FRONTEND_URL|JWT_SECRET|GOOGLE_"
```

### Etapa 3: Banco de Dados 🗄️

- [ ] Banco de dados PostgreSQL rodando
- [ ] Conexão com banco funcionando
- [ ] Tabela `users` tem coluna `role`
- [ ] Tabela `establishments` tem coluna `statusAprovacao`
- [ ] TypeORM aplicou as migrations automaticamente

**Comando de verificação:**
```bash
psql -d pdv_dev -U pdv -c "\d users" | grep role
psql -d pdv_dev -U pdv -c "\d establishments" | grep statusAprovacao
```

### Etapa 4: Arquivos Criados ✨

**Enums:**
- [ ] `backend/src/common/enums/user-role.enum.ts`
- [ ] `backend/src/common/enums/approval-status.enum.ts`
- [ ] `backend/src/common/enums/index.ts`

**Guards:**
- [ ] `backend/src/common/guards/roles.guard.ts`
- [ ] `backend/src/common/guards/establishment-access.guard.ts`
- [ ] `backend/src/common/guards/index.ts`

**Decorators:**
- [ ] `backend/src/common/decorators/roles.decorator.ts`
- [ ] `backend/src/common/decorators/index.ts`

**Módulo de Notificação:**
- [ ] `backend/src/modules/notification/notification.service.ts`
- [ ] `backend/src/modules/notification/notification.module.ts`

**Módulo de Admin:**
- [ ] `backend/src/modules/admin/admin.controller.ts`
- [ ] `backend/src/modules/admin/admin.service.ts`
- [ ] `backend/src/modules/admin/admin.module.ts`

**Documentação:**
- [ ] `backend/RBAC_E_NOTIFICACOES.md`
- [ ] `backend/INSTALL_RBAC.md`
- [ ] `backend/test-email.ts`
- [ ] `RESUMO_IMPLEMENTACAO_RBAC.md` (raiz)
- [ ] `COMANDOS_RAPIDOS_RBAC.md` (raiz)
- [ ] `CHECKLIST_RBAC.md` (raiz - este arquivo)

### Etapa 5: Arquivos Modificados ✏️

- [ ] `backend/src/modules/auth/entities/user.entity.ts` (+ campo role)
- [ ] `backend/src/modules/auth/entities/establishment.entity.ts` (+ campo statusAprovacao)
- [ ] `backend/src/modules/auth/services/auth.service.ts` (+ lógica RBAC)
- [ ] `backend/src/modules/auth/strategies/jwt.strategy.ts` (+ role no payload)
- [ ] `backend/src/modules/auth/auth.module.ts` (+ NotificationModule)
- [ ] `backend/src/app.module.ts` (+ AdminModule e NotificationModule)
- [ ] `backend/env.example` (+ configurações SMTP)

### Etapa 6: Build e Compilação 🔨

- [ ] Projeto compila sem erros
- [ ] Sem erros de linter
- [ ] Sem warnings críticos
- [ ] TypeScript types corretos

**Comando de verificação:**
```bash
cd backend
npm run build
```

### Etapa 7: Servidor Rodando 🚀

- [ ] Backend inicia sem erros
- [ ] Porta 3000 acessível
- [ ] TypeORM conecta ao banco
- [ ] Logs não mostram erros críticos

**Comando de verificação:**
```bash
cd backend
npm run start:dev
# Verifique os logs no console
```

### Etapa 8: Testes de E-mail 📧

- [ ] Script `test-email.ts` executa sem erros
- [ ] E-mail de teste é recebido por eduardo.klug7@gmail.com
- [ ] E-mails não caem na caixa de spam
- [ ] Templates HTML renderizam corretamente

**Comando de verificação:**
```bash
cd backend
npx ts-node test-email.ts
# Verifique inbox de eduardo.klug7@gmail.com
```

### Etapa 9: Testes Funcionais - Login 👤

**Teste 9.1: Login como Admin**
- [ ] Login com eduardo.klug7@gmail.com funciona
- [ ] Usuário criado com role `AdministradorSistema`
- [ ] Estabelecimento criado com status `Aprovado`
- [ ] Token JWT contém `"role": "AdministradorSistema"`
- [ ] Nenhum e-mail de alerta enviado (admin não gera alerta)

**Teste 9.2: Login como Proprietário**
- [ ] Login com outra conta Google funciona
- [ ] Usuário criado com role `Proprietario`
- [ ] Estabelecimento criado com status `Pendente`
- [ ] Token JWT contém `"role": "Proprietario"`
- [ ] E-mail de alerta enviado para eduardo.klug7@gmail.com

**Comando de verificação:**
```bash
# Decodifique o token em: https://jwt.io
# Ou via console do navegador:
JSON.parse(atob(localStorage.getItem('token').split('.')[1]))
```

### Etapa 10: Testes de Endpoints Admin 🛡️

**Teste 10.1: Estatísticas**
- [ ] `GET /admin/statistics` funciona para admin
- [ ] Retorna `403 Forbidden` para proprietário
- [ ] Retorna dados corretos (total, pendentes, aprovados, rejeitados)

**Teste 10.2: Listar Estabelecimentos**
- [ ] `GET /admin/establishments/pending` funciona para admin
- [ ] Retorna lista de estabelecimentos pendentes
- [ ] Retorna dados do proprietário junto

**Teste 10.3: Aprovar Estabelecimento**
- [ ] `POST /admin/approve/:id` funciona para admin
- [ ] Status muda para `Aprovado` no banco
- [ ] E-mail de aprovação enviado ao proprietário
- [ ] Proprietário recebe e-mail com template correto

**Teste 10.4: Rejeitar Estabelecimento**
- [ ] `POST /admin/reject/:id` funciona para admin
- [ ] Status muda para `Rejeitado` no banco
- [ ] E-mail de rejeição enviado ao proprietário
- [ ] Motivo da rejeição incluído no e-mail (se fornecido)

**Comandos de verificação:**
```bash
# Substitua $TOKEN pelo token do admin
curl -X GET http://localhost:3000/admin/statistics \
  -H "Authorization: Bearer $TOKEN"

curl -X GET http://localhost:3000/admin/establishments/pending \
  -H "Authorization: Bearer $TOKEN"
```

### Etapa 11: Testes de Guards 🔐

**Teste 11.1: RolesGuard**
- [ ] Proprietário não acessa rotas de admin (403)
- [ ] Admin acessa rotas de admin (200)
- [ ] Usuário não autenticado não acessa rotas protegidas (401)

**Teste 11.2: EstablishmentAccessGuard**
- [ ] Proprietário acessa apenas seu estabelecimento
- [ ] Admin acessa qualquer estabelecimento
- [ ] Erro 403 para acesso não autorizado

**Comando de verificação:**
```bash
# Com token de proprietário (deve FALHAR)
curl -X GET http://localhost:3000/admin/statistics \
  -H "Authorization: Bearer $TOKEN_PROPRIETARIO"
# Esperado: 403 Forbidden
```

### Etapa 12: Testes de Notificações 📬

**Teste 12.1: Alerta de Novo Cadastro**
- [ ] E-mail enviado para eduardo.klug7@gmail.com
- [ ] Assunto contém "🚨 Novo Estabelecimento Pendente"
- [ ] Corpo contém nome do estabelecimento
- [ ] Corpo contém e-mail do proprietário
- [ ] Link para painel administrativo funciona

**Teste 12.2: E-mail de Aprovação**
- [ ] E-mail enviado para proprietário
- [ ] Assunto contém "✅ Seu BarTab foi Aprovado!"
- [ ] Corpo contém nome do estabelecimento
- [ ] Link para acessar sistema funciona
- [ ] Lista de funcionalidades presente

**Teste 12.3: E-mail de Rejeição**
- [ ] E-mail enviado para proprietário
- [ ] Assunto apropriado
- [ ] Motivo da rejeição incluído (se fornecido)
- [ ] Tom respeitoso e profissional

### Etapa 13: Verificação de Dados no Banco 💾

```sql
-- Execute no psql e verifique

-- ✅ Verificar se admin existe
SELECT email, role FROM users WHERE email = 'eduardo.klug7@gmail.com';
-- Esperado: role = 'AdministradorSistema'

-- ✅ Verificar estabelecimentos pendentes
SELECT name, "statusAprovacao" FROM establishments WHERE "statusAprovacao" = 'Pendente';

-- ✅ Verificar estabelecimentos aprovados
SELECT name, "statusAprovacao" FROM establishments WHERE "statusAprovacao" = 'Aprovado';

-- ✅ Verificar integridade das relações
SELECT u.email, u.role, e.name, e."statusAprovacao" 
FROM users u 
JOIN establishments e ON u.establishment_id = e.id;
```

### Etapa 14: Testes de Integração Frontend (Opcional) 🎨

- [ ] Tela de login funciona
- [ ] Após login, role do usuário é exibida corretamente
- [ ] Admin vê menu/rotas administrativas
- [ ] Proprietário vê apenas suas funcionalidades
- [ ] Proprietário com estabelecimento pendente vê mensagem apropriada
- [ ] Após aprovação, proprietário acessa sistema normalmente

### Etapa 15: Segurança e Boas Práticas 🔒

- [ ] E-mail do admin (eduardo.klug7@gmail.com) está hard-coded no código
- [ ] Senhas SMTP não estão commitadas no repositório
- [ ] `.env` está no `.gitignore`
- [ ] JWT_SECRET é forte e único
- [ ] CORS configurado adequadamente
- [ ] Rate limiting considerado (para produção)
- [ ] Logs não expõem informações sensíveis

### Etapa 16: Documentação 📚

- [ ] README principal menciona o sistema RBAC
- [ ] Documentação técnica completa (`RBAC_E_NOTIFICACOES.md`)
- [ ] Guia de instalação disponível (`INSTALL_RBAC.md`)
- [ ] Comandos rápidos documentados (`COMANDOS_RAPIDOS_RBAC.md`)
- [ ] Este checklist preenchido

### Etapa 17: Performance e Otimização ⚡

- [ ] Queries do TypeORM incluem apenas relations necessárias
- [ ] Índices apropriados no banco (email, googleId são unique)
- [ ] Envio de e-mail não bloqueia requisições críticas
- [ ] Logs de erro não sobrecarregam console
- [ ] Build de produção otimizado

### Etapa 18: Testes de Erro e Edge Cases 🐛

**Teste 18.1: E-mail Inválido**
- [ ] Sistema não quebra se SMTP falhar
- [ ] Erro logado mas não impede cadastro
- [ ] Usuário pode se cadastrar mesmo se e-mail não for enviado

**Teste 18.2: Token Expirado**
- [ ] Token expirado retorna 401
- [ ] Mensagem de erro clara
- [ ] Frontend redireciona para login

**Teste 18.3: Estabelecimento Não Encontrado**
- [ ] Aprovar ID inexistente retorna 404
- [ ] Mensagem de erro apropriada

**Teste 18.4: Dupla Aprovação**
- [ ] Aprovar estabelecimento já aprovado retorna erro claro
- [ ] Não envia e-mail duplicado

### Etapa 19: Preparação para Produção 🚀

Para quando for para produção:

- [ ] Mudar `synchronize: true` para `false`
- [ ] Implementar migrations apropriadas
- [ ] Configurar SMTP production (SendGrid, AWS SES, etc)
- [ ] Configurar HTTPS
- [ ] Implementar rate limiting
- [ ] Configurar monitoramento e alertas
- [ ] Backup do banco de dados
- [ ] Documentar processo de deploy
- [ ] Testes E2E automatizados

---

## 🎯 Score Final

**Total de itens:** ~120

**Meta para considerar implementação completa:** ≥ 95% (114/120)

### Como usar este checklist:

1. ✅ Marque cada item conforme concluir
2. 🔍 Investigue e corrija itens não marcados
3. 📝 Documente problemas encontrados
4. 🧪 Re-teste após correções
5. ✨ Celebre quando chegar a 95%+!

---

**Última atualização:** 02/11/2025  
**Sistema:** BarTab RBAC v1.0  
**Status de Implementação:** 🟢 Código completo | 🟡 Testes pendentes

