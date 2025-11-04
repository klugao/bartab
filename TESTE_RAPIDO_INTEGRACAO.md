# 🧪 Teste Rápido - Integração Offline

## ⚡ Teste em 5 Minutos

### 1️⃣ Iniciar Aplicação (30 segundos)

```bash
cd /Users/eduardoklug/Documents/bartab/frontend
npm run dev
```

Acesse: http://localhost:5175

### 2️⃣ Login (30 segundos)

- Faça login na aplicação
- Vá para a página inicial (Comandas)

### 3️⃣ Testar Offline - Adicionar Item (2 minutos)

**Preparação:**
1. Abra DevTools (F12)
2. Vá para aba "Network"
3. Abra uma comanda existente ou crie uma nova

**Teste Offline:**
1. Marque checkbox "☐ Offline"
2. Tente adicionar um produto
3. ✅ Deve mostrar: "💾 Item salvo offline"
4. ✅ Widget SyncManager deve aparecer no canto inferior direito

**Observações esperadas:**
- Toast laranja: "💾 Item salvo offline"
- Widget no canto: contador de "1 item pendente"
- Item NÃO aparece na lista (ainda não sincronizado)

### 4️⃣ Testar Sincronização (1 minuto)

**Voltar Online:**
1. Desmarque checkbox "☐ Offline"
2. Aguarde 2 segundos (auto-sync)
   - OU clique em "Sincronizar Agora"
3. ✅ Deve mostrar: "✅ Sincronização Concluída"
4. ✅ Widget desaparece
5. ✅ Item aparece na lista da comanda

**Observações esperadas:**
- Toast verde: "✅ Sincronização Concluída"
- Widget mostra spinner durante sincronização
- Widget desaparece após sucesso
- Página recarrega mostrando o item

### 5️⃣ Testar Página de Dados Offline (1 minuto)

**Adicionar Dados:**
1. Marque "Offline" novamente
2. Adicione 2-3 itens diferentes
3. Desmarque "Offline"

**Acessar Página:**
1. Navegue para: http://localhost:5175/offline-data
2. ✅ Deve mostrar todos os itens pendentes
3. ✅ Cards de estatísticas no topo
4. ✅ Cada item com status visual

**Observações esperadas:**
- Cards: Total, Pendentes, Sincronizados
- Lista de lançamentos com detalhes
- Status visual (laranja = pendente)
- Botão de remover por item
- Botão "Limpar Todos os Dados"

---

## 🎯 Checklist Rápido

### Funcionalidades Básicas
- [ ] App inicia sem erros
- [ ] Login funciona
- [ ] Pode acessar comandas

### Modo Offline
- [ ] Adicionar item offline funciona
- [ ] Toast "💾 Item salvo offline" aparece
- [ ] Widget SyncManager aparece

### Sincronização
- [ ] Widget mostra contador correto
- [ ] Botão "Sincronizar" funciona
- [ ] Auto-sync após 2s funciona
- [ ] Toast "✅ Sincronização Concluída"
- [ ] Widget desaparece após sync
- [ ] Itens aparecem na comanda

### Página Offline Data
- [ ] Rota `/offline-data` acessível
- [ ] Estatísticas aparecem
- [ ] Lista de itens aparece
- [ ] Status visual correto
- [ ] Botão remover funciona
- [ ] Botão limpar tudo funciona

### Visual
- [ ] Toasts com cores corretas
- [ ] Widget bem posicionado
- [ ] Sem erros no console
- [ ] Interface responsiva

---

## 🔍 Teste Detalhado por Componente

### A. Hook `useTabOperations`

**Arquivo:** `frontend/src/hooks/useTabOperations.ts`

**Teste:**
```javascript
// No console do navegador, dentro de uma página de comanda:

// 1. Verificar hook está disponível
console.log('Hook disponível');

// 2. Adicionar item offline
// (Use a interface normal, marque Offline e adicione item)

// 3. Ver dados no IndexedDB
// DevTools → Application → IndexedDB → bartab → offline_expenses
```

### B. Componente SyncManager

**Arquivo:** `frontend/src/components/SyncManager.tsx`

**Teste:**
1. Adicionar dados offline (vários itens)
2. Widget deve aparecer automaticamente
3. Clicar em seta ▼ para expandir detalhes
4. Ver estatísticas detalhadas
5. Testar toggle "Sincronização automática"
6. Clicar "Sincronizar Agora"

**Verificações:**
- Widget posicionado no canto inferior direito
- Contador mostra número correto
- Detalhes expandem/colapsam
- Botão sincronizar funciona
- Toggle auto-sync funciona
- Spinner durante sincronização
- Status online/offline correto

### C. Página OfflineData

**Arquivo:** `frontend/src/pages/OfflineData.tsx`

**Teste:**
1. Navegar para `/offline-data`
2. Ver estatísticas no topo (3 cards)
3. Scroll pela lista de lançamentos
4. Testar botão "Remover" em um item
5. Testar botão "Limpar Todos os Dados"
6. Clicar "Atualizar" (botão com ícone refresh)

**Verificações:**
- Cards mostram números corretos
- Lista renderiza todos os itens
- Status visual por item (verde/laranja/vermelho)
- Timestamps formatados em PT-BR
- Botões funcionam
- Confirmação antes de remover
- Atualiza após remoção

---

## 🐛 Problemas Comuns e Soluções

### Problema 1: Widget não aparece

**Diagnóstico:**
```javascript
// Console:
import { hasOfflineData } from '@/services/offlineStorage';
const has = await hasOfflineData();
console.log('Tem dados?', has);
```

**Soluções:**
- Verifique se realmente adicionou dados offline
- Verifique console por erros
- Recarregue a página

### Problema 2: Sincronização não funciona

**Diagnóstico:**
```javascript
// Console:
import { getOfflineStats } from '@/services/offlineStorage';
const stats = await getOfflineStats();
console.log(stats);
```

**Soluções:**
- Verifique se está realmente online
- Verifique console por erros de rede
- Tente sincronização manual
- Verifique se auto-sync está ativado

### Problema 3: Dados não aparecem

**Verificar IndexedDB:**
1. DevTools → Application
2. IndexedDB → bartab
3. Verificar stores:
   - `offline_expenses`
   - `offline_payments`
   - `cached_data`

### Problema 4: Erro de TypeScript

**Verificar Build:**
```bash
cd frontend
npm run build
```

Se houver erros, verificar tipos em:
- `AddPaymentDto` (method, amount)
- `OfflinePayment` (paymentMethod, amount)

---

## 📊 Cenários de Teste Completos

### Cenário 1: Trabalho Offline Completo

**Duração:** 3 minutos

1. Login na aplicação
2. Abrir uma comanda
3. Ativar modo offline (DevTools)
4. Adicionar 3 itens diferentes
5. Tentar processar pagamento
6. Desativar modo offline
7. Aguardar auto-sync
8. Verificar todos os dados sincronizados

**Resultado Esperado:**
- 3 lançamentos sincronizados ✅
- 1 pagamento sincronizado ✅
- Comanda atualizada corretamente ✅

### Cenário 2: Erro de Conexão Durante Operação

**Duração:** 2 minutos

1. Estar online
2. Abrir comanda
3. Iniciar adição de item
4. Durante o processo, desconectar internet (Airplane mode)
5. Continuar adição
6. Verificar fallback para offline

**Resultado Esperado:**
- Item salvo offline automaticamente ✅
- Toast de aviso "⚠️ Erro de conexão" ✅
- SyncManager aparece ✅

### Cenário 3: Visualização Offline

**Duração:** 1 minuto

1. Estar online
2. Abrir várias comandas (para cachear)
3. Ativar modo offline
4. Navegar entre comandas abertas
5. Verificar banner de cache

**Resultado Esperado:**
- Comandas carregam do cache ✅
- Banner laranja aparece ✅
- Dados mostrados corretamente ✅

---

## ✅ Aprovação Final

### Antes de Considerar Pronto:

- [ ] Todos os testes básicos passam
- [ ] Todos os cenários funcionam
- [ ] Sem erros no console
- [ ] Build executa sem erros
- [ ] Visual está OK (toasts, widget, banner)
- [ ] Documentação está clara

### Qualidade do Código:

- [ ] TypeScript sem erros
- [ ] Linter sem warnings
- [ ] Imports organizados
- [ ] Código comentado onde necessário
- [ ] Tratamento de erros adequado

---

## 🎉 Sucesso!

Se todos os testes passarem, a integração está **100% completa e funcionando**!

**Próximo passo:** Testar em dispositivos reais e/ou fazer deploy em produção.

---

**Tempo total estimado:** 5-10 minutos  
**Nível de dificuldade:** Fácil  
**Pré-requisitos:** App rodando, login funcionando

