# Configuração do Google OAuth para Desenvolvimento Local

Este guia explica como configurar o Google OAuth para funcionar no ambiente de desenvolvimento local (localhost).

## Problema

Se você está vendo o erro:
```
Access blocked: Authorization Error
Error 401: deleted_client
The OAuth client was deleted.
```

Isso significa que o `GOOGLE_CLIENT_ID` no arquivo `.env` do backend está apontando para um cliente OAuth que foi deletado ou não existe mais no Google Cloud Console.

## Solução

### Passo 1: Criar/Verificar Credenciais OAuth no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Selecione o projeto `bartab-475300` (ou seu projeto)
3. Clique em **"Criar credenciais"** → **"ID do cliente OAuth"**
4. Configure:
   - **Tipo de aplicativo**: Aplicativo da Web
   - **Nome**: BarTab Local Development (ou qualquer nome)
   - **URIs de redirecionamento autorizadas**: 
     ```
     http://localhost:3000/api/auth/google/callback
     ```
   - **Origens JavaScript autorizadas** (opcional):
     ```
     http://localhost:5173
     http://localhost:5175
     ```

5. Clique em **"Criar"**
6. **Copie o Client ID e Client Secret** (você precisará deles no próximo passo)

### Passo 2: Atualizar o arquivo .env do Backend

Edite o arquivo `backend/.env` e atualize as seguintes variáveis:

```env
GOOGLE_CLIENT_ID=seu-novo-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-novo-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

**Importante**: 
- Substitua `seu-novo-client-id` pelo Client ID que você copiou
- Substitua `seu-novo-client-secret` pelo Client Secret que você copiou
- O `GOOGLE_CALLBACK_URL` deve corresponder exatamente à URI configurada no Google Cloud Console

### Passo 3: Reiniciar o Backend

Após atualizar o `.env`, reinicie o servidor backend:

```bash
# Se estiver rodando, pare o servidor (Ctrl+C)
# Depois inicie novamente
cd backend
npm run start:dev
```

### Passo 4: Testar

1. Acesse `http://localhost:5175` (ou a porta que você está usando)
2. Clique em "Entrar com Google"
3. Deve funcionar! 🎉

## Verificação Rápida

Para verificar se as variáveis estão configuradas corretamente:

```bash
cd backend
# Verificar se o arquivo .env existe
ls -la .env

# Verificar se as variáveis estão definidas (sem mostrar os valores)
grep -E "GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|GOOGLE_CALLBACK_URL" .env
```

## Problemas Comuns

### Erro: "redirect_uri_mismatch"

- Verifique se a URI no `.env` (`GOOGLE_CALLBACK_URL`) corresponde **exatamente** à URI configurada no Google Cloud Console
- Certifique-se de que não há espaços extras ou diferenças (http vs https, porta diferente, etc.)

### Erro: "invalid_client"

- Verifique se o `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos
- Certifique-se de que copiou os valores completos (sem espaços extras)

### O cliente OAuth foi deletado novamente

- Se você deletou o cliente no Google Cloud Console, crie um novo e atualize o `.env`
- Considere criar um cliente OAuth separado apenas para desenvolvimento local

## Dica: Cliente OAuth Separado para Dev

É uma boa prática ter credenciais OAuth separadas para:
- **Desenvolvimento local**: `http://localhost:3000/api/auth/google/callback`
- **Produção**: `https://bartab-backend-*.run.app/api/auth/google/callback`

Isso evita problemas quando você deleta ou atualiza as credenciais de produção.

