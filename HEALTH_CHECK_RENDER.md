# Health Check para Manter o Backend do Render Ativo

## 📋 Problema

Serviços gratuitos do Render entram em modo sleep após períodos de inatividade, causando:
- Delays de 20+ segundos no primeiro acesso
- Má experiência do usuário
- Timeouts em integrações

## ✅ Solução Implementada

### 1. Endpoint de Health Check

Foi adicionado um endpoint simples em `/api/health` que:
- **Não requer autenticação** (acessível publicamente)
- Retorna resposta rápida com status e timestamp
- Não acessa banco de dados (para ser ultra-rápido)

```typescript
// backend/src/app.controller.ts
@Get('health')
healthCheck(): { status: string; timestamp: string } {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
  };
}
```

**URL de acesso**: `https://seu-backend.onrender.com/api/health`

### 2. GitHub Actions - Ping Automático

Um workflow do GitHub Actions faz ping no backend **a cada hora**:

```yaml
# .github/workflows/keep-render-alive.yml
on:
  schedule:
    - cron: '0 * * * *'  # A cada hora
  workflow_dispatch:      # Permite execução manual
```

O workflow:
1. Faz uma requisição ao endpoint `/api/health`
2. Se falhar, aguarda 30 segundos e tenta novamente
3. Registra logs detalhados de cada tentativa

## 🚀 Como Configurar

### 1. Atualizar a URL do Backend

Edite o arquivo `.github/workflows/keep-render-alive.yml` e substitua a URL:

```yaml
BACKEND_URL="https://seu-backend-real.onrender.com"
```

**Importante**: Substitua `seu-backend-real` pela URL real do seu backend no Render!

### 2. Fazer Deploy

Faça commit e push das alterações:

```bash
git add .
git commit -m "feat: adiciona health check para manter Render ativo"
git push origin main
```

### 3. Verificar se Funciona

#### Teste Manual do Endpoint

```bash
# Substitua pela sua URL real
curl https://seu-backend.onrender.com/api/health
```

Resposta esperada:
```json
{
  "status": "OK",
  "timestamp": "2025-11-13T20:30:00.000Z"
}
```

#### Verificar o Workflow

1. Acesse: `https://github.com/seu-usuario/bartab/actions`
2. Procure pelo workflow "Keep Render Backend Alive"
3. Você pode executá-lo manualmente clicando em "Run workflow"

## 📊 Frequência do Ping

O workflow está configurado para rodar **a cada 14 minutos** (`*/14 * * * *` em cron).

### Por que 14 minutos?

- **Render Free Tier**: Hiberna após ~15 minutos de inatividade
- **14 minutos**: Garante que o backend nunca entre em sleep
- **GitHub Actions**: Usa ~1.545 minutos/mês (77% do limite gratuito de 2.000 min)
- **Resultado**: Backend sempre ativo, sem cold starts! 🚀

### Ajustar a Frequência

Para mudar a frequência, edite o cron no arquivo `.github/workflows/keep-render-alive.yml`:

```yaml
# A cada 10 minutos (mais agressivo, usa mais minutos do GitHub)
- cron: '*/10 * * * *'

# A cada 20 minutos (mais econômico, mas pode hibernar)
- cron: '*/20 * * * *'

# Apenas durante horário comercial UTC (economiza minutos)
- cron: '*/14 8-22 * * *'
```

📚 **Documentação completa**: Veja `FREQUENCIA_HEALTH_CHECK.md` para detalhes sobre limites e otimizações.

**Referência de Cron**: https://crontab.guru/

## 🔍 Monitoramento

### Ver Logs do Workflow

1. Acesse: Actions → Keep Render Backend Alive
2. Clique no run mais recente
3. Abra "Ping Backend Health Check"
4. Veja os logs detalhados

### Logs Típicos

```
🌐 Tentando fazer ping no backend do Render...
📅 Wed Nov 13 20:00:00 UTC 2025
🔄 Primeira tentativa...
📊 Resposta: 200
✅ Status HTTP: 200
📄 Conteúdo da resposta:
{"status":"OK","timestamp":"2025-11-13T20:00:00.123Z"}
✅ Backend está ativo e respondendo!
```

### Se o Backend Estiver Acordando

```
🌐 Tentando fazer ping no backend do Render...
🔄 Primeira tentativa...
📊 Resposta: 502
✅ Status HTTP: 502
⏱️  Backend pode estar acordando... Aguardando 30 segundos...
🔄 Segunda tentativa...
📊 Resposta: 200
✅ Status HTTP após retry: 200
✅ Backend está ativo e respondendo!
```

## 🎯 Limitações

### Não é Perfeito

- **Ainda pode hibernar**: Se ninguém acessar por mais de 1 hora
- **Primeiro acesso pode demorar**: Entre os pings de 1 hora
- **Consumo de recursos**: Usa horas do plano gratuito

### Alternativas Melhores

Para produção, considere:
1. **Render Paid Plan**: Serviço sempre ativo (~$7/mês)
2. **Railway/Fly.io**: Planos gratuitos com menos sleep
3. **Vercel/Netlify**: Para frontends + Serverless Functions

## 🧪 Testes

Os testes do endpoint foram adicionados em `backend/src/app.controller.spec.ts`:

```bash
cd backend
npm test -- app.controller.spec
```

## 📚 Referências

- Artigo original: [Keeping a Render Backend Alive - Medium](https://mooncodelog.medium.com/keeping-a-render-backend-alive-what-worked-what-didnt-859eaa9e4cd6)
- GitHub Actions Cron: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule
- Render Free Tier: https://render.com/docs/free

## 🤝 Contribuindo

Se você melhorar este sistema, considere:
- Adicionar métricas de uptime
- Implementar notificações se o health check falhar
- Criar dashboard de monitoramento

---

**Última atualização**: Novembro 2025

