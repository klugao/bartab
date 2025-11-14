# 🛠️ Scripts de Monitoramento BarTab

Scripts para monitorar e gerenciar a infraestrutura do BarTab no GCP.

## 📋 Scripts Disponíveis

### 🎯 `setup-monitoring.sh` - Configuração Inicial

**Quando usar:** Uma vez, após o deploy inicial.

**O que faz:**
- ✅ Cria Uptime Checks para backend e frontend
- ✅ Configura canal de notificação por email
- ✅ Habilita Cloud Trace automaticamente
- ✅ Configura Error Reporting

**Como usar:**

```bash
./setup-monitoring.sh
```

Siga as instruções na tela. Você será perguntado sobre:
- Email para receber alertas (opcional)

**Tempo:** ~2-3 minutos

---

### 📊 `monitor.sh` - Monitoramento Diário

**Quando usar:** Sempre que quiser ver o status do sistema.

**Modos de uso:**

#### 1. Modo Interativo (Recomendado)

```bash
./monitor.sh
```

Menu interativo com opções:
1. Status dos serviços
2. Métricas em tempo real
3. Logs recentes
4. Erros recentes
5. Health check
6. Visão completa
7. Modo contínuo (watch)

#### 2. Modo com Argumentos

```bash
# Ver status dos serviços
./monitor.sh status

# Ver métricas (requisições, latência, instâncias)
./monitor.sh metrics

# Ver logs
./monitor.sh logs           # todos os logs
./monitor.sh logs backend   # só backend
./monitor.sh logs frontend  # só frontend

# Ver erros recentes (últimas 2 horas)
./monitor.sh errors

# Health check detalhado
./monitor.sh health

# Visão completa
./monitor.sh all

# Modo contínuo (atualiza a cada 30s)
./monitor.sh watch
```

#### 3. Modo Watch (Monitoramento Contínuo)

```bash
./monitor.sh watch
```

Atualiza automaticamente a cada 30 segundos. Perfeito para deixar aberto em um monitor.

**Pressione Ctrl+C para sair.**

---

### 🚀 `deploy.sh` - Deploy Completo

Ver documentação em [../README.md](../README.md).

---

### 💾 `backup-database.sh` - Backup Manual

Ver documentação em [../README.md](../README.md).

---

### 🔄 `rollback.sh` - Reverter Deploy

Ver documentação em [../README.md](../README.md).

---

### 📜 `logs.sh` - Logs em Tempo Real

```bash
./logs.sh
```

Mostra logs em tempo real (tail) de todos os serviços.

---

### 📈 `status.sh` - Status Rápido

```bash
./status.sh
```

Mostra status de todos os recursos (Cloud Run, Cloud SQL, etc).

---

## 🎯 Casos de Uso Comuns

### Verificar se está tudo OK

```bash
./monitor.sh health
```

ou

```bash
./monitor.sh all
```

### Investigar erro reportado por usuário

```bash
# 1. Ver erros recentes
./monitor.sh errors

# 2. Ver logs detalhados
./monitor.sh logs backend

# 3. Ver traces (se necessário)
# Acessar: https://console.cloud.google.com/traces
```

### Monitorar performance durante teste de carga

```bash
# Em um terminal
./monitor.sh watch

# Em outro terminal
# Executar seus testes de carga
```

### Ver o que aconteceu ontem à noite

```bash
# Logs das últimas 24 horas com erros
gcloud logging read \
  "resource.labels.service_name=bartab-backend AND severity>=ERROR" \
  --limit=100 \
  --freshness=24h
```

### Acompanhar deploy em andamento

```bash
# Terminal 1: Deploy
cd ../
./deploy.sh

# Terminal 2: Monitorar
cd scripts/
./monitor.sh watch
```

---

## 💡 Dicas

### Criar alias para acesso rápido

Adicione no seu `~/.zshrc` ou `~/.bashrc`:

```bash
alias bartab-status="cd ~/Documents/bartab/gcp/scripts && ./monitor.sh status"
alias bartab-logs="cd ~/Documents/bartab/gcp/scripts && ./monitor.sh logs"
alias bartab-errors="cd ~/Documents/bartab/gcp/scripts && ./monitor.sh errors"
alias bartab-watch="cd ~/Documents/bartab/gcp/scripts && ./monitor.sh watch"
```

Depois:

```bash
source ~/.zshrc  # ou ~/.bashrc
```

Agora você pode usar de qualquer lugar:

```bash
bartab-status
bartab-watch
```

### Monitorar de qualquer lugar

```bash
# Instalar Google Cloud app no celular
# iOS: https://apps.apple.com/app/google-cloud/id1250200789
# Android: https://play.google.com/store/apps/details?id=com.google.android.apps.cloudconsole

# Configurar notificações push
# Receber alertas no celular
```

### Exportar logs para análise

```bash
# Exportar logs das últimas 24h
gcloud logging read \
  "resource.labels.service_name=bartab-backend" \
  --limit=10000 \
  --format=json \
  --freshness=24h > logs-$(date +%Y%m%d).json

# Analisar com jq
cat logs-20251114.json | jq '.[] | select(.severity == "ERROR")'
```

---

## 🆘 Troubleshooting

### Script não funciona: "Permission denied"

```bash
chmod +x *.sh
```

### "gcloud: command not found"

```bash
# Instalar gcloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### "Project ID not configured"

```bash
gcloud config set project SEU_PROJECT_ID
```

### "bc: command not found" (macOS)

```bash
brew install bc
```

### Métricas não aparecem

- Aguarde 2-3 minutos após fazer requisições
- Verifique se os serviços estão recebendo tráfego
- Confirme que está no projeto correto: `gcloud config get-value project`

---

## 📚 Mais Informações

- **Guia completo de monitoramento:** [../docs/MONITORING.md](../docs/MONITORING.md)
- **Guia de deploy:** [../README.md](../README.md)
- **Documentação GCP:** https://cloud.google.com/docs

---

**🎉 Bom monitoramento!**

