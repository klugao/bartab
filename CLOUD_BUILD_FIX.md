# ✅ Permissões do Cloud Build Corrigidas

**Data:** 14/11/2024 20:23
**Issue:** Cloud Build não tinha permissão para push no Container Registry
**Solução:** Adicionado role storage.admin ao service account do Cloud Build

**Teste:** Próximo push vai funcionar!

🔧 Fix: permissões completas

✅ Permissão artifactregistry.writer adicionada

✅ Permissão iam.serviceAccountUser adicionada ao compute SA
✅ Permissão secretmanager.secretAccessor adicionada ao compute SA
