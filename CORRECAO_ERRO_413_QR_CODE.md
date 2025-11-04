# Correção Erro 413 - Upload de QR Code

## 🐛 Problema Identificado

**Erro:** `413 - request entity too large`

Ao tentar fazer upload de um QR Code PIX na página de Configurações, o sistema retornava erro 413 indicando que o payload era muito grande para o servidor processar.

### Causa Raiz

1. **Frontend validava 5MB** - Imagens de até 5MB eram aceitas
2. **Conversão Base64** - Imagens convertidas para base64 aumentam ~33% de tamanho
3. **Limite do Backend** - NestJS tem limite padrão de ~1-2MB para requisições
4. **Resultado** - Imagem de 2MB vira ~2.7MB em base64, ultrapassando o limite

## ✅ Solução Implementada

### Backend (`backend/src/main.ts`)

Aumentado o limite de payload do Express para **10MB**:

```typescript
const app = await NestFactory.create(AppModule, {
  bodyParser: true,
  rawBody: false,
});

// Aumentar limite de payload para aceitar imagens grandes em base64
app.use(require('express').json({ limit: '10mb' }));
app.use(require('express').urlencoded({ limit: '10mb', extended: true }));
```

### Frontend (`frontend/src/pages/Settings.tsx`)

Reduzido o limite de validação para **3MB** (mais conservador):

```typescript
// Validar tamanho (máximo 3MB - após conversão base64 fica ~4MB)
if (file.size > 3 * 1024 * 1024) {
  toast({
    title: '❌ Erro',
    description: 'A imagem deve ter no máximo 3MB',
    variant: 'destructive',
  });
  return;
}
```

## 📊 Capacidade Atual

| Item | Tamanho | Observação |
|------|---------|------------|
| **Limite Frontend** | 3MB | Validação antes do upload |
| **Imagem em Base64** | ~4MB | 3MB × 1.33 = ~4MB |
| **Limite Backend** | 10MB | Margem de segurança |
| **Margem Livre** | 6MB | Espaço para outras requisições |

## 🎯 Benefícios

1. ✅ **Upload funcionando** - QR Codes agora são aceitos corretamente
2. ✅ **Validação adequada** - Limite realista considerando conversão base64
3. ✅ **Margem de segurança** - Backend aceita mais que o necessário
4. ✅ **Experiência melhorada** - Usuário não recebe mais erro 413
5. ✅ **Produção preparada** - Configuração pronta para deploy

## 🧪 Como Testar

1. Acesse **Configurações** no menu
2. Vá até "QR Code PIX"
3. Faça upload de uma imagem de até 3MB
4. Clique em "Salvar Alterações"
5. ✅ Deve salvar com sucesso

## 📝 Arquivos Modificados

- ✏️ `backend/src/main.ts` - Aumentado limite de payload
- ✏️ `frontend/src/pages/Settings.tsx` - Reduzido limite para 3MB
- ✏️ `IMPLEMENTACAO_QR_CODE_PIX.md` - Atualizada documentação

## ⚠️ Importante para Deploy

Esta alteração afeta o tamanho máximo de requisições aceitas pelo backend. Certifique-se de que:

- O servidor tem memória suficiente para processar payloads de 10MB
- Proxies reversos (como Nginx) também permitem requisições de 10MB
- Se usar Nginx, adicionar: `client_max_body_size 10M;`

## 🚀 Status

✅ **Corrigido e Testado**

---

**Data:** 04/11/2025  
**Issue:** Erro 413 ao fazer upload de QR Code PIX

