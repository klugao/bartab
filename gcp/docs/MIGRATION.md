# 📦 Guia de Migração - Render/Supabase → GCP

Guia detalhado para migrar o BarTab mantendo o ambiente atual funcionando.

## 🎯 Estratégia de Migração

### Migração Blue-Green

Vamos usar a estratégia **Blue-Green Deployment**:
- **Blue (Antigo)**: Render + Supabase - continua funcionando
- **Green (Novo)**: GCP - testado em paralelo
- **Cutover**: Mudança rápida quando tudo estiver validado

### Vantagens

✅ Zero downtime  
✅ Rollback fácil se houver problemas  
✅ Tempo para testar o novo ambiente  
✅ Ambos os ambientes funcionando em paralelo  

## 📋 Checklist de Migração

### Fase 1: Preparação (Dia 1)

- [ ] Criar conta no GCP
- [ ] Habilitar billing
- [ ] Instalar gcloud CLI
- [ ] Executar `./scripts/setup-gcp.sh`
- [ ] Configurar secrets com `./scripts/update-secrets.sh`
- [ ] Criar infraestrutura com Terraform

### Fase 2: Setup Banco de Dados (Dia 1-2)

- [ ] Criar Cloud SQL
- [ ] Configurar backups automáticos
- [ ] Testar conexão com Cloud SQL Proxy
- [ ] **NÃO MIGRAR DADOS AINDA** - apenas preparar

### Fase 3: Deploy Inicial (Dia 2-3)

- [ ] Build das imagens Docker
- [ ] Deploy do backend no Cloud Run
- [ ] Deploy do frontend no Cloud Run
- [ ] Testar com banco de dados vazio

### Fase 4: Migração de Dados (Escolher momento de baixo tráfego)

- [ ] Fazer backup completo do Supabase
- [ ] Executar `./scripts/migrate-database.sh`
- [ ] Validar integridade dos dados
- [ ] Testar todas as funcionalidades

### Fase 5: Testes (Dia 4-7)

- [ ] Testar autenticação
- [ ] Testar CRUD de clientes
- [ ] Testar CRUD de itens
- [ ] Testar abertura/fechamento de contas
- [ ] Testar pagamentos
- [ ] Testar OAuth do Google
- [ ] Testar envio de emails
- [ ] Teste de carga

### Fase 6: Cutover (Quando estiver pronto)

- [ ] Escolher horário de baixo tráfego
- [ ] Colocar Render em modo manutenção
- [ ] Fazer backup final do Supabase
- [ ] Migrar dados finais (delta)
- [ ] Atualizar DNS/URLs
- [ ] Validar funcionamento
- [ ] Monitorar por 24-48h

### Fase 7: Cleanup (Após 1 semana de estabilidade)

- [ ] Manter Render/Supabase por mais 1-2 semanas
- [ ] Fazer backups finais
- [ ] Cancelar Render (se tudo ok)
- [ ] Cancelar Supabase (se tudo ok)

## 🔄 Migração Passo a Passo Detalhado

### 1. Setup do GCP

```bash
# Clonar ou atualizar repositório
git pull

# Ir para diretório de scripts
cd gcp/scripts

# Executar setup
./setup-gcp.sh
```

Quando solicitado:
- Digite o **Project ID** do seu projeto GCP
- Aguarde habilitação das APIs (pode demorar 2-3 minutos)

### 2. Configurar Secrets

```bash
./update-secrets.sh
```

Você precisará dos seguintes valores:

#### DATABASE_URL
```
postgresql://bartab:SUA_SENHA@/bartab_production?host=/cloudsql/PROJECT:REGION:INSTANCE
```

Obtenha o connection name:
```bash
gcloud sql instances describe bartab-postgres --format="value(connectionName)"
```

#### JWT_SECRET
Use o mesmo do Render ou gere um novo:
```bash
openssl rand -base64 32
```

#### Google OAuth
- Vá em: https://console.cloud.google.com/apis/credentials
- Crie novas credenciais OAuth 2.0
- Adicione as URLs de callback do GCP:
  - `https://bartab-backend-XXXXX-uc.a.run.app/api/auth/google/callback`

#### SMTP
- Use as mesmas credenciais do Render
- Para Gmail: https://myaccount.google.com/apppasswords

### 3. Criar Infraestrutura com Terraform

```bash
cd ../terraform

# Copiar arquivo de exemplo
cp terraform.tfvars.example terraform.tfvars

# Editar com seus valores
nano terraform.tfvars

# Inicializar Terraform
terraform init

# Ver o que será criado
terraform plan

# Criar infraestrutura
terraform apply
```

**O que será criado:**
- Cloud SQL PostgreSQL
- Service Account
- Secrets no Secret Manager
- Permissões IAM

**Tempo estimado:** 5-10 minutos

### 4. Deploy das Aplicações

```bash
cd ../scripts

# Deploy completo
./deploy.sh
```

Escolha opção 1 (Deploy completo)

**Tempo estimado:** 10-15 minutos (primeiro build é mais lento)

### 5. Configurar URLs

Após o deploy, você receberá as URLs:

```
Backend: https://bartab-backend-XXXXX-uc.a.run.app
Frontend: https://bartab-frontend-XXXXX-uc.a.run.app
```

#### Atualizar CORS no Backend

Edite o Secret Manager:
```bash
# Obter URL do frontend
FRONTEND_URL=$(gcloud run services describe bartab-frontend --platform=managed --region=us-central1 --format="value(status.url)")

# Atualizar variável de ambiente
gcloud run services update bartab-backend \
    --update-env-vars="CORS_ORIGIN=$FRONTEND_URL,FRONTEND_URL=$FRONTEND_URL" \
    --region=us-central1
```

#### Atualizar Google OAuth Callback

Adicione a nova URL no Google Console:
```
https://bartab-backend-XXXXX-uc.a.run.app/api/auth/google/callback
```

### 6. Testar o Ambiente

```bash
# Ver status
./status.sh

# Ver logs em tempo real
./logs.sh

# Testar backend
curl https://bartab-backend-XXXXX-uc.a.run.app/api/health

# Acessar frontend
open https://bartab-frontend-XXXXX-uc.a.run.app
```

### 7. Migração de Dados

⚠️ **IMPORTANTE**: Faça isso em horário de baixo tráfego

```bash
# Fazer backup do Supabase
pg_dump "postgresql://user:pass@host:5432/database" > backup_supabase.sql

# Ou usar o script
./migrate-database.sh
```

O script irá:
1. Pedir a URL do Supabase
2. Fazer backup completo
3. Adicionar seu IP ao whitelist do Cloud SQL
4. Importar os dados
5. Validar a importação
6. Remover seu IP do whitelist

### 8. Validação Completa

#### Teste Manual

1. **Autenticação**
   - Login com Google
   - Verificar JWT

2. **Clientes**
   - Listar clientes
   - Criar novo cliente
   - Editar cliente
   - Ver saldo devedor

3. **Itens**
   - Listar itens do cardápio
   - Criar novo item
   - Editar item

4. **Contas**
   - Abrir nova conta
   - Adicionar itens à conta
   - Remover itens
   - Adicionar pagamento
   - Fechar conta

5. **Emails**
   - Testar envio de email
   - Verificar templates

#### Teste de Performance

```bash
# Instalar Apache Bench
brew install apache2

# Teste de carga no backend
ab -n 1000 -c 10 https://bartab-backend-XXXXX-uc.a.run.app/api/health

# Monitorar no GCP Console
# https://console.cloud.google.com/run
```

#### Verificar Logs

```bash
./logs.sh
```

Procure por:
- Erros de conexão com banco
- Erros de autenticação
- Timeouts
- Erros 5xx

### 9. Cutover (Mudança Final)

Quando tudo estiver funcionando perfeitamente:

#### Opção A: Manter URLs do GCP

1. Atualizar configurações dos clientes
2. Compartilhar nova URL
3. Desligar Render gradualmente

#### Opção B: Usar Domínio Customizado

1. Configurar Cloud Load Balancer
2. Adicionar SSL Certificate
3. Atualizar DNS
4. Aguardar propagação (24-48h)
5. Desligar Render

#### Opção C: Continuar com Ambos

- Manter Render como backup
- Usar GCP como principal
- Avaliar por 1-2 semanas
- Decidir depois

## 🔙 Plano de Rollback

Se algo der errado no GCP:

### Rollback Rápido (< 5 minutos)

1. **Não alterou DNS**: Apenas volte a usar URLs do Render
2. **Alterou DNS**: 
   ```bash
   # Reverter DNS para Render
   # Aguardar propagação (pode demorar)
   ```

### Rollback do Deploy (< 2 minutos)

```bash
./rollback.sh
```

Escolha a revisão anterior para voltar.

### Rollback do Banco de Dados

```bash
# Listar backups
gcloud sql backups list --instance=bartab-postgres

# Restaurar
gcloud sql backups restore BACKUP_ID --backup-instance=bartab-postgres
```

## 🔍 Monitoramento Pós-Migração

### Primeiras 24 horas

- [ ] Verificar logs a cada 2 horas
- [ ] Monitorar uso de recursos
- [ ] Verificar tempo de resposta
- [ ] Testar todas as funcionalidades principais
- [ ] Verificar backups automáticos

### Primeira semana

- [ ] Monitoramento diário
- [ ] Verificar custos no billing
- [ ] Coletar feedback dos usuários
- [ ] Otimizar configurações se necessário

### Primeiro mês

- [ ] Análise completa de custos
- [ ] Otimização de recursos
- [ ] Ajustes de escala
- [ ] Decidir sobre desligamento definitivo do Render

## 📊 Comparação de Ambientes

| Aspecto | Render/Supabase | GCP |
|---------|----------------|-----|
| **Setup** | Simples, UI-based | Mais complexo, CLI |
| **Escalabilidade** | Automática, limitada | Automática, ilimitada |
| **Custo** | Fixo por tier | Pay-per-use |
| **Integração** | Limitada | Completa (GCP) |
| **Monitoramento** | Básico | Avançado |
| **Backups** | Diários | Configurável |
| **SLA** | 99.9% | 99.95% |

## 💡 Dicas Importantes

1. **Não tenha pressa**: Teste tudo antes do cutover
2. **Backups são essenciais**: Sempre tenha backup antes de cada passo
3. **Monitore custos**: Configure billing alerts no GCP
4. **Use staging**: Se possível, crie um ambiente de staging primeiro
5. **Documente mudanças**: Anote todas as URLs, senhas, configurações
6. **Mantenha o Render**: Por pelo menos 2 semanas após a migração

## 🆘 Contatos de Emergência

Se algo der muito errado:

1. **Rollback imediato** para Render
2. **Verificar logs**: `./logs.sh`
3. **Verificar status**: `./status.sh`
4. **Consultar documentação do GCP**
5. **Suporte GCP**: https://cloud.google.com/support

## ✅ Checklist Final

Antes de desligar o Render:

- [ ] GCP funcionando perfeitamente por 2+ semanas
- [ ] Todos os usuários usando o novo ambiente
- [ ] Backups automáticos configurados
- [ ] Monitoramento configurado
- [ ] Custos dentro do esperado
- [ ] Documentação atualizada
- [ ] Time treinado nas novas ferramentas

---

**🎉 Boa migração! Qualquer dúvida, consulte o README principal.**

