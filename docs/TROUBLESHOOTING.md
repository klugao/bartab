# Troubleshooting - Problemas Comuns e Soluções

## 🔴 Erro 404 no `/auth/me` - URL Antiga do Backend

### Sintomas
- Console do navegador mostra: `GET https://bartab-backend-nvwtehomyq-uc.a.run.app/auth/me 404 (Not Found)`
- Aviso: "API_BASE_URL deve terminar com /api"
- Frontend usando URL antiga do backend

### Solução
1. Verificar a URL correta do backend:
   ```bash
   gcloud run services describe bartab-backend --platform=managed --region=us-central1 --format="value(status.url)"
   ```

2. Fazer novo build e deploy do frontend com a URL correta:
   ```bash
   COMMIT_SHA=$(git rev-parse --short HEAD)
   gcloud builds submit --config=frontend/cloudbuild.yaml \
     --substitutions=_API_URL=https://bartab-backend-312426210115.us-central1.run.app/api,COMMIT_SHA=$COMMIT_SHA
   ```

3. Atualizar o serviço do frontend:
   ```bash
   gcloud run services update bartab-frontend \
     --platform=managed \
     --region=us-central1 \
     --image=gcr.io/bartab-475300/bartab-frontend:latest
   ```

---

## 🔴 Erro de Permissão: `PERMISSION_DENIED: Permission 'iam.serviceaccounts.actAs' denied`

### Sintomas
- Erro ao fazer deploy: `Permission 'iam.serviceaccounts.actAs' denied on service account`
- Build falha no step de deploy do Cloud Run

### Solução
Executar o script de correção de permissões:
```bash
cd gcp/scripts
./fix-service-account-permissions.sh
```

Ou manualmente:
```bash
PROJECT_ID=$(gcloud config get-value project)
SA_EMAIL="bartab-backend-sa@${PROJECT_ID}.iam.gserviceaccount.com"

# Permissão para atuar como ela mesma
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountUser"

# Permissão para Cloud Build usar a service account
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/iam.serviceAccountUser"
```

---

## 🔴 Erro de Build: `Could not resolve entry module "index.html"`

### Sintomas
- Build do frontend falha com: `Could not resolve entry module "index.html"`
- Erro do plugin PWA do Vite

### Solução
1. Verificar se `.gcloudignore` existe na raiz do projeto:
   ```bash
   cat .gcloudignore
   ```

2. Se não existir, criar com:
   ```bash
   echo "!frontend/index.html" > .gcloudignore
   ```

3. Verificar se `frontend/.dockerignore` não está excluindo `index.html`

4. Fazer novo build:
   ```bash
   gcloud builds submit --config=frontend/cloudbuild.yaml \
     --substitutions=_API_URL=https://bartab-backend-312426210115.us-central1.run.app/api,COMMIT_SHA=$(git rev-parse --short HEAD)
   ```

---

## 🔴 Redirecionamento para localhost após login

### Sintomas
- Após login com Google, redireciona para `http://localhost:5173`
- Backend não encontra `FRONTEND_URL` configurada

### Solução
Atualizar variáveis de ambiente do backend:
```bash
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
REGION="us-central1"
FRONTEND_URL="https://bartab-frontend-${PROJECT_NUMBER}.${REGION}.run.app"
BACKEND_URL="https://bartab-backend-${PROJECT_NUMBER}.${REGION}.run.app"
CALLBACK_URL="${BACKEND_URL}/api/auth/google/callback"

gcloud run services update bartab-backend \
  --platform=managed \
  --region=$REGION \
  --update-env-vars="FRONTEND_URL=${FRONTEND_URL},CORS_ORIGIN=${FRONTEND_URL},GOOGLE_CALLBACK_URL=${CALLBACK_URL},PROJECT_NUMBER=${PROJECT_NUMBER},REGION=${REGION}"
```

---

## 🔴 Frontend usando URL antiga da API

### Sintomas
- Console mostra aviso: "API_BASE_URL deve terminar com /api"
- Requisições falhando com 404

### Solução
1. Verificar configuração atual:
   ```bash
   gcloud run services describe bartab-frontend \
     --platform=managed \
     --region=us-central1 \
     --format="yaml" | grep -A 10 "env:"
   ```

2. Fazer novo build com URL correta (variável é injetada no build time):
   ```bash
   COMMIT_SHA=$(git rev-parse --short HEAD)
   gcloud builds submit --config=frontend/cloudbuild.yaml \
     --substitutions=_API_URL=https://bartab-backend-312426210115.us-central1.run.app/api,COMMIT_SHA=$COMMIT_SHA
   ```

3. Atualizar serviço:
   ```bash
   gcloud run services update bartab-frontend \
     --platform=managed \
     --region=us-central1 \
     --image=gcr.io/bartab-475300/bartab-frontend:latest
   ```

---

## 📋 Scripts Úteis

### Verificar URLs dos serviços
```bash
echo "Backend: $(gcloud run services describe bartab-backend --platform=managed --region=us-central1 --format='value(status.url)')"
echo "Frontend: $(gcloud run services describe bartab-frontend --platform=managed --region=us-central1 --format='value(status.url)')"
```

### Verificar variáveis de ambiente do backend
```bash
gcloud run services describe bartab-backend \
  --platform=managed \
  --region=us-central1 \
  --format="yaml" | grep -A 20 "env:"
```

### Deploy completo (backend + frontend)
```bash
COMMIT_SHA=$(git rev-parse --short HEAD)
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_API_URL=https://bartab-backend-312426210115.us-central1.run.app/api,COMMIT_SHA=$COMMIT_SHA
```

---

## 🔍 Verificações Rápidas

1. **URLs corretas?**
   - Backend: `https://bartab-backend-312426210115.us-central1.run.app`
   - Frontend: `https://bartab-frontend-312426210115.us-central1.run.app`

2. **Variáveis de ambiente configuradas?**
   - Backend: `FRONTEND_URL`, `CORS_ORIGIN`, `GOOGLE_CALLBACK_URL`
   - Frontend: `VITE_API_BASE_URL` (injetada no build)

3. **Permissões corretas?**
   - Service account tem `roles/iam.serviceAccountUser`?

4. **Build funcionando?**
   - `.gcloudignore` existe e inclui `!frontend/index.html`?
   - `frontend/.dockerignore` não exclui `index.html`?

---

## 📝 Notas Importantes

- **Frontend**: Variáveis de ambiente são injetadas no **build time** (não runtime)
- **Backend**: Variáveis de ambiente são configuradas no **runtime** (Cloud Run)
- **URLs**: Sempre usar formato com project number: `https://bartab-{service}-{PROJECT_NUMBER}.{REGION}.run.app`
- **Cache**: Limpar cache do navegador após mudanças (Cmd+Shift+R / Ctrl+Shift+R)

