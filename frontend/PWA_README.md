# 📱 PWA BarTab - Referência Rápida

## ✨ O que foi implementado?

Esta aplicação agora é um **Progressive Web App (PWA)** completo com:

- ✅ **Instalação como app nativo** (Desktop e Mobile)
- ✅ **Funcionamento offline** com cache inteligente
- ✅ **Armazenamento local** para dados offline
- ✅ **Sincronização automática** quando voltar online
- ✅ **Atualizações automáticas** em segundo plano

## 🚀 Testar Agora

```bash
npm run dev
# Acesse: http://localhost:5175
# Abra DevTools (F12) → Application → Service Workers
```

## 📦 Dependências PWA

```json
{
  "dependencies": {
    "localforage": "^1.10.0"
  },
  "devDependencies": {
    "vite-plugin-pwa": "^1.1.0",
    "workbox-window": "^7.0.0"
  }
}
```

## 📁 Arquivos Principais

```
frontend/
├── public/
│   ├── manifest.json          # Manifesto PWA
│   └── icons/                 # 8 ícones (72px até 512px)
│
├── src/
│   ├── components/
│   │   ├── PWAInstallPrompt.tsx    # Banner de instalação
│   │   └── OfflineIndicator.tsx    # Indicador de status
│   │
│   ├── services/
│   │   └── offlineStorage.ts       # Persistência offline
│   │
│   └── hooks/
│       └── useOfflineStorage.ts    # Hook para offline
│
├── vite.config.ts             # Plugin PWA configurado
└── index.html                 # Meta tags PWA
```

## 🔧 Configuração

### Workbox (Service Worker)

```typescript
// vite.config.ts
VitePWA({
  registerType: 'prompt',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
    runtimeCaching: [
      // Cache de API com NetworkFirst
      // Cache de fontes com CacheFirst
    ]
  }
})
```

### LocalForage (IndexedDB)

```typescript
// offlineStorage.ts
const offlineExpensesStore = localforage.createInstance({
  name: 'bartab',
  storeName: 'offline_expenses'
});
```

## 💻 Exemplo de Uso

### Adicionar Lançamento Offline

```typescript
import { addOfflineExpense, isOnline } from '@/services/offlineStorage';

async function handleAddExpense(itemId: number, quantity: number) {
  if (isOnline()) {
    await api.post('/tabs/expense', { itemId, quantity });
  } else {
    await addOfflineExpense({ tabId, itemId, quantity });
    toast({ title: "💾 Salvo offline" });
  }
}
```

### Hook de Gerenciamento

```typescript
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

function MyComponent() {
  const { online, hasPendingData, syncOfflineData } = useOfflineStorage();
  
  return (
    <div>
      <p>Status: {online ? 'Online' : 'Offline'}</p>
      {hasPendingData && (
        <button onClick={handleSync}>Sincronizar</button>
      )}
    </div>
  );
}
```

## 🧪 Testar Offline

1. Abra DevTools (F12)
2. Vá para **Network**
3. Marque **Offline**
4. Recarregue a página
5. Navegue normalmente! ✅

## 📱 Instalar PWA

### Desktop
- Clique no ícone ⊕ na barra de endereços
- Ou aguarde o banner automático

### Android
- Menu (⋮) → "Adicionar à tela inicial"
- Ou banner automático

### iOS
- Botão Compartilhar (□↑)
- "Adicionar à Tela de Início"

## 🔍 Debug

### Ver Service Worker
```javascript
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log(regs));
```

### Ver Cache
```javascript
caches.keys().then(keys => console.log(keys));
```

### Ver Dados Offline
```javascript
import { getOfflineStats } from './services/offlineStorage';
const stats = await getOfflineStats();
console.log(stats);
```

### Limpar Tudo
```javascript
// Service Workers
const regs = await navigator.serviceWorker.getRegistrations();
regs.forEach(reg => reg.unregister());

// Caches
const keys = await caches.keys();
keys.forEach(key => caches.delete(key));

// IndexedDB
indexedDB.deleteDatabase('bartab');
```

## 📖 Documentação Completa

- **`../INICIO_RAPIDO_PWA.md`** - Começar agora (5 min)
- **`../PWA_IMPLEMENTATION.md`** - Implementação completa
- **`../INTEGRACAO_OFFLINE_EXAMPLE.md`** - 7 exemplos práticos
- **`../TESTE_PWA.md`** - Checklist de testes
- **`../RESUMO_PWA.md`** - Métricas e estatísticas

## 🎯 Próximos Passos

1. ✅ PWA implementado e funcionando
2. 🎨 Personalizar ícones (substituir placeholders)
3. 🔌 Integrar offline nos componentes existentes
4. 📱 Testar em dispositivos reais
5. 🚀 Deploy em produção (HTTPS necessário)

## 🆘 Suporte

Problemas? Consulte:
- `../TESTE_PWA.md` - Seção Troubleshooting
- DevTools → Application → Service Workers
- Console do navegador para erros

---

**Versão:** 1.0.0  
**Data:** Novembro 2025  
**Status:** ✅ Pronto para uso

