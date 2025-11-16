# Scripts úteis

Use estes scripts para configurar OAuth/URLs e operar serviços no GCP.

## Pré-requisitos
- gcloud SDK instalado e autenticado
- Projeto configurado (`gcloud config set project bartab-475300`)

## Variáveis rápidas (exemplo)
```bash
export GOOGLE_CLIENT_ID="SEU_CLIENT_ID.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="SEU_CLIENT_SECRET"
```

## Onde estão os scripts
- `gcp/scripts/` — scripts de GCP, OAuth e utilidades
- `scripts/dev/` — iniciar/parar ambiente local

## Fluxos comuns

### 1) Atualizar Client ID/Secret no Secret Manager
```bash
gcp/scripts/atualizar-oauth-agora.sh
# usa GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET do ambiente
```

Ou interativo:
```bash
gcp/scripts/atualizar-oauth.sh
# pede os valores e grava no Secret Manager
```

### 2) Ajustar URLs (novo formato Cloud Run)
```bash
gcp/scripts/atualizar-urls.sh
```

### 3) Corrigir OAuth (callback/origins)
```bash
gcp/scripts/fix-oauth.sh
```

### 4) Verificar status e env vars
```bash
gcp/scripts/verificar-config.sh
```

### 5) Reiniciar backend (forçar revisão)
```bash
gcp/scripts/reiniciar-backend.sh
```

### 6) Comandos rápidos (assistido)
```bash
gcp/scripts/COMANDOS_RAPIDOS.sh
```

## Dev local
```bash
scripts/dev/start-clean.sh   # inicia tudo
scripts/dev/stop-project.sh  # para tudo
```


