# 🧪 Guia de Teste - Health Check

## Teste Local (Desenvolvimento)

### 1. Inicie o Backend

```bash
cd backend
npm run start:dev
```

### 2. Teste o Endpoint

#### Opção A: curl (Terminal)

```bash
curl http://localhost:3000/api/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-13T20:30:45.123Z"
}
```

#### Opção B: Navegador

Abra no navegador:
```
http://localhost:3000/api/health
```

#### Opção C: Postman/Insomnia

- **Método**: GET
- **URL**: `http://localhost:3000/api/health`
- **Headers**: Nenhum necessário
- **Auth**: Nenhuma necessária

### 3. Verifique os Testes Automatizados

```bash
cd backend
npm test -- app.controller.spec.ts
```

## Teste em Produção (Render)

### 1. Após Deploy, Teste Manualmente

```bash
# Substitua pela sua URL real do Render
curl https://seu-backend.onrender.com/api/health
```

### 2. Teste o Workflow do GitHub Actions

1. Acesse: `https://github.com/seu-usuario/bartab/actions`
2. Clique em "Keep Render Backend Alive"
3. Clique em "Run workflow" → "Run workflow"
4. Aguarde a execução (~30 segundos)
5. Clique no run para ver os logs

### 3. Verifique os Logs do Workflow

Procure por:
```
✅ Backend está ativo e respondendo!
```

Se aparecer:
```
⏱️  Backend pode estar acordando...
```

Isso é normal! O workflow aguarda 30s e tenta novamente.

## Cenários de Teste

### ✅ Sucesso (200 OK)

```bash
$ curl -i http://localhost:3000/api/health

HTTP/1.1 200 OK
Content-Type: application/json
{
  "status": "OK",
  "timestamp": "2025-11-13T20:30:45.123Z"
}
```

### ⚠️ Backend Hibernando (502/503)

No Render, na primeira chamada após sleep:
```bash
$ curl -i https://seu-backend.onrender.com/api/health

HTTP/1.1 502 Bad Gateway
(aguarde 20-30 segundos e tente novamente)
```

### ❌ Backend Offline (Timeout)

Se o backend estiver realmente offline:
```bash
$ curl -i https://seu-backend.onrender.com/api/health

curl: (28) Connection timed out after 30000 milliseconds
```

## Frequência dos Pings

O GitHub Actions está configurado para pingar:
- **Automaticamente**: A cada hora (00:00, 01:00, 02:00, etc.)
- **Manualmente**: Você pode executar quando quiser

## Dicas de Teste

### 1. Simular Sleep do Render

Para testar localmente o comportamento de wake-up:

1. Pare o backend: `Ctrl+C`
2. Aguarde alguns segundos
3. Inicie novamente: `npm run start:dev`
4. Tente acessar `/api/health` imediatamente

### 2. Monitorar Logs em Tempo Real

No Render:
1. Acesse seu serviço no dashboard
2. Clique em "Logs"
3. Veja as requisições ao `/api/health` chegando a cada hora

### 3. Verificar se Não Requer Autenticação

O endpoint `/api/health` **não deve** exigir token JWT:

```bash
# SEM Authorization header - deve funcionar!
curl http://localhost:3000/api/health

# Outros endpoints precisam de auth
curl http://localhost:3000/api/tabs
# ❌ Unauthorized
```

## Troubleshooting

### Problema: 401 Unauthorized

**Solução**: Verifique se não há guard global bloqueando o endpoint

### Problema: 404 Not Found

**Possíveis causas**:
- Backend não está rodando
- URL incorreta (lembre-se do prefixo `/api`)
- Deploy não concluído

### Problema: Workflow Falhando

**Possíveis causas**:
1. URL do backend incorreta no workflow
2. Backend realmente offline
3. Render em manutenção

**Verificar**:
```bash
# Teste manual primeiro
curl https://seu-backend.onrender.com/api/health
```

## Próximos Passos

Após confirmar que funciona:

1. ✅ Endpoint `/api/health` responde localmente
2. ✅ Testes automatizados passam
3. ✅ Fazer deploy no Render
4. ✅ Atualizar URL no workflow
5. ✅ Testar workflow manualmente
6. ✅ Aguardar primeira execução automática (próxima hora cheia)

---

**Dúvidas?** Consulte: `HEALTH_CHECK_RENDER.md`

