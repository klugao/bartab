# 💡 Dicas e Otimizações para o Render - BarTab

## 🎯 Otimizações de Performance

### 1. Reduzir Tempo de Build

**Backend - Usar npm ci ao invés de npm install:**
```yaml
# No render.yaml
buildCommand: cd backend && npm ci && npm run build
```

**Frontend - Cache de dependências:**
```yaml
# No render.yaml  
buildCommand: cd frontend && npm ci && npm run build
```

### 2. Otimizar Bundle do Frontend

**Adicionar ao `frontend/vite.config.ts`:**
```typescript
export default defineConfig({
  // ... outras configs
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
```

### 3. Habilitar Compressão

O Render já faz isso automaticamente, mas certifique-se de que seu backend está configurado:

```typescript
// backend/src/main.ts
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar compressão
  app.use(compression());
  
  // ... resto do código
}
```

## 🔒 Segurança

### 1. Variáveis de Ambiente Sensíveis

**Nunca commite:**
- JWT_SECRET
- Senhas de banco
- API keys
- Credenciais SMTP
- Client secrets do OAuth

**Use sempre:**
- Variáveis de ambiente no Render
- `.env` local (gitignored)
- Secrets do GitHub (se usar GitHub Actions)

### 2. Headers de Segurança

O Helmet já está configurado no backend, mas verifique:

```typescript
// backend/src/main.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 3. Rate Limiting

Considere adicionar rate limiting no backend:

```bash
npm install --save @nestjs/throttler
```

```typescript
// backend/src/app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    // ... outros módulos
  ],
})
```

## 📊 Monitoramento

### 1. Health Checks

O Render usa o `healthCheckPath` para verificar se o serviço está rodando:

```typescript
// backend/src/app.controller.ts
@Get()
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
```

### 2. Logs Estruturados

Use um logger estruturado para facilitar debug:

```bash
npm install --save winston nest-winston
```

### 3. Alertas

Configure alertas no Render:
1. Vá em Settings → Notifications
2. Configure alertas para:
   - Deploy failures
   - Service unhealthy
   - High resource usage

## 💰 Otimização de Custos

### 1. Plano Free

**Limitações:**
- 750 horas/mês por serviço
- Sleep após 15 min de inatividade
- 512 MB RAM
- CPU compartilhada

**Estratégias:**
- Use para staging/desenvolvimento
- Aceite o sleep time (primeiro request leva ~30s)
- Combine com serviços que acordam o backend

### 2. Reduzir Sleep Time

**Ping externo (não recomendado no free tier):**
```bash
# Use um serviço como UptimeRobot
# ou cron-job.org para fazer ping a cada 10 min
```

**Melhor opção: Upgrade para Starter ($7/mês)**

### 3. Banco de Dados

**Free tier PostgreSQL:**
- 1 GB de armazenamento
- Backups por 7 dias
- Ótimo para desenvolvimento

**Quando fazer upgrade:**
- Mais de 1 GB de dados
- Necessita backups mais longos
- Performance crítica

## 🚀 CI/CD Avançado

### 1. Preview Environments

Render cria automaticamente ambientes de preview para Pull Requests:

```yaml
# render.yaml
services:
  - type: web
    name: bartab-backend
    previewsEnabled: yes # Habilita preview environments
```

### 2. Branch Deploys

Configure diferentes branches para diferentes ambientes:

**Produção: main**
```yaml
# render.yaml para produção
```

**Staging: develop**
- Crie um segundo Blueprint para a branch develop
- Use variáveis de ambiente diferentes

### 3. Deploy Hooks

Execute comandos após o deploy:

```yaml
# render.yaml
services:
  - type: web
    name: bartab-backend
    buildCommand: npm ci && npm run build
    startCommand: npm run start:prod
    # Executar migrations após deploy
    envVars:
      - key: AUTO_MIGRATE
        value: true
```

```typescript
// backend/src/main.ts
async function bootstrap() {
  // ... criar app
  
  if (process.env.AUTO_MIGRATE === 'true') {
    // Executar migrations
    console.log('Running migrations...');
    // await runMigrations();
  }
  
  await app.listen(3000);
}
```

## 🐛 Debug em Produção

### 1. Logs

**Ver logs em tempo real:**
```bash
# No dashboard do Render
Logs → Live Logs
```

**Filtrar logs:**
- Use o campo de busca
- Filtre por erro: busque "error" ou "exception"

### 2. Shell

**Executar comandos no container:**
1. Vá em Shell na dashboard
2. Execute comandos:
```bash
# Ver variáveis de ambiente
env | grep DATABASE

# Testar conexão com banco
psql $DATABASE_URL

# Ver status do Node
node -v
npm -v

# Executar seed
npm run seed
```

### 3. Métricas

**Monitorar uso de recursos:**
- CPU
- Memória
- Requisições por segundo
- Tempo de resposta

## 🔄 Rollback

### Automático
```yaml
# render.yaml
services:
  - type: web
    name: bartab-backend
    autoDeploy: true # Deploy automático
    healthCheckPath: /api
    # Se health check falhar, Render faz rollback automático
```

### Manual
1. Vá em Events
2. Selecione um deploy anterior
3. Clique em "Rollback to this deploy"

## 📧 Configuração de Email

### Gmail com Senha de App

1. **Habilitar 2FA** na conta Google
2. **Gerar senha de app:**
   - https://myaccount.google.com/apppasswords
   - Selecione "Mail" e seu dispositivo
   - Copie a senha gerada (16 caracteres)

3. **Configurar no Render:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

### SendGrid (Alternativa recomendada)

```bash
# Free tier: 100 emails/dia
```

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key-here
```

## 🌐 Custom Domain

### 1. Adicionar Domínio

1. Settings → Custom Domain
2. Adicionar: `app.bartab.com`

### 2. Configurar DNS

**Para apex domain (bartab.com):**
```
Type: A
Name: @
Value: [IP fornecido pelo Render]
```

**Para subdomain (app.bartab.com):**
```
Type: CNAME
Name: app
Value: bartab-frontend.onrender.com
```

### 3. SSL/TLS

- Render fornece SSL gratuito via Let's Encrypt
- Renovação automática
- Redirecionamento HTTP → HTTPS automático

## 🔐 Backup e Recovery

### 1. Backup do Banco

**Free tier:**
- Backups automáticos diários
- Retenção por 7 dias

**Manual:**
```bash
# No shell do Render
pg_dump $DATABASE_URL > backup.sql

# Restaurar
psql $DATABASE_URL < backup.sql
```

### 2. Backup do Código

- Git é seu backup
- Tags para releases importantes
- Branches para diferentes ambientes

## 📈 Escalabilidade

### Horizontal Scaling

Render suporta múltiplas instâncias:

```yaml
# render.yaml
services:
  - type: web
    name: bartab-backend
    scaling:
      minInstances: 2 # Mínimo 2 instâncias
      maxInstances: 10 # Máximo 10 instâncias
```

**Nota:** Disponível apenas em planos pagos

### Vertical Scaling

Upgrade do plano:
- Free: 512 MB RAM
- Starter: 512 MB RAM
- Standard: 2 GB RAM
- Pro: 4 GB RAM

## 🎓 Recursos Educacionais

- [Render Docs](https://render.com/docs)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [PostgreSQL Best Practices](https://render.com/docs/postgresql)

## 📞 Suporte

- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)
- [GitHub Issues](https://github.com/render-examples)

---

**🎉 Mantenha seu BarTab rodando suavemente!**

