# 🧪 Guia de Testes - PWA BarTab

## 🚀 Comandos Rápidos

### Iniciar Desenvolvimento com PWA
```bash
cd frontend
npm run dev
```
O PWA funciona em modo dev! Acesse: http://localhost:5175

### Build e Preview de Produção
```bash
cd frontend
npm run build
npm run preview
```
Acesse: http://localhost:4173

### Limpar Cache e Reconstruir
```bash
cd frontend
rm -rf dist node_modules/.vite
npm run build
```

## ✅ Checklist de Testes

### 1️⃣ Service Worker
- [ ] Abrir DevTools (F12)
- [ ] Ir para "Application" > "Service Workers"
- [ ] Verificar se "sw.js" está ativado
- [ ] Status deve mostrar "activated and is running"

**Como testar:**
```bash
# No console do navegador:
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log(`${registrations.length} Service Worker(s) registrado(s)`);
});
```

### 2️⃣ Manifest e Instalação
- [ ] DevTools > Application > Manifest
- [ ] Verificar se todos os campos estão preenchidos
- [ ] Verificar se os ícones carregam (8 ícones)
- [ ] Clicar em "Install" no navegador
- [ ] App deve ser instalado como PWA

**Ícone de instalação aparece quando:**
- ✅ HTTPS ou localhost
- ✅ Manifest válido
- ✅ Service Worker registrado
- ✅ Ícones 192x192 e 512x512 presentes

### 3️⃣ Cache Offline
- [ ] Navegar por algumas páginas (Home, Clientes, Itens)
- [ ] DevTools > Application > Cache Storage
- [ ] Verificar entradas em "workbox-precache"
- [ ] Desconectar internet (DevTools > Network > Offline)
- [ ] Recarregar página - deve continuar funcionando
- [ ] Navegar entre páginas visitadas - deve funcionar

**Teste via console:**
```javascript
// Ver cache disponível
caches.keys().then(keys => console.log('Caches:', keys));

// Ver conteúdo de um cache
caches.open('workbox-precache-v1').then(cache => {
  cache.keys().then(keys => console.log('Cached files:', keys));
});
```

### 4️⃣ Armazenamento Offline
- [ ] Desconectar internet
- [ ] Tentar adicionar um lançamento (quando integrado)
- [ ] DevTools > Application > IndexedDB
- [ ] Verificar banco "bartab"
- [ ] Verificar store "offline_expenses"
- [ ] Reconectar e sincronizar

**Teste via console:**
```javascript
// Importar funções (no console do app):
import { addOfflineExpense, getOfflineExpenses } from './services/offlineStorage';

// Adicionar teste
await addOfflineExpense({
  tabId: 1,
  itemId: 2,
  quantity: 3,
  notes: 'Teste console'
});

// Listar
const expenses = await getOfflineExpenses();
console.log('Offline expenses:', expenses);
```

### 5️⃣ Indicadores Visuais
- [ ] Desconectar internet
- [ ] Verificar se aparece "Modo Offline" no canto superior direito
- [ ] Adicionar dados offline (se implementado)
- [ ] Reconectar internet
- [ ] Verificar se aparece botão "Sincronizar"
- [ ] Clicar em sincronizar
- [ ] Verificar toast de sucesso

### 6️⃣ Banner de Instalação
- [ ] Primeira visita ao site
- [ ] Banner "Instalar BarTab" deve aparecer (canto inferior direito)
- [ ] Clicar em "Instalar"
- [ ] App deve ser instalado
- [ ] Ou clicar em "Agora Não"
- [ ] Banner não deve aparecer novamente por 24h

### 7️⃣ Banner de Atualização
- [ ] Com app já em uso
- [ ] Fazer alteração no código
- [ ] Rebuild: `npm run build`
- [ ] Recarregar app (se em preview)
- [ ] Banner "Atualização Disponível" deve aparecer
- [ ] Clicar em "Atualizar Agora"
- [ ] App deve recarregar com nova versão

## 🔧 Testes Avançados

### Teste 1: Cache de API (Network First)

```bash
# Abrir DevTools Network
# Fazer uma chamada de API (ex: listar clientes)
# Verificar que veio da rede

# Desconectar internet
# Fazer a mesma chamada
# Deve vir do cache

# No console:
caches.open('api-cache').then(cache => {
  cache.keys().then(keys => {
    console.log('API cached:', keys.map(r => r.url));
  });
});
```

### Teste 2: Persistência do LocalForage

```javascript
// No console do navegador:
import localforage from 'localforage';

// Criar store de teste
const testStore = localforage.createInstance({
  name: 'test',
  storeName: 'test_data'
});

// Salvar dados
await testStore.setItem('teste', { 
  message: 'PWA funcionando!',
  timestamp: Date.now() 
});

// Recuperar
const data = await testStore.getItem('teste');
console.log('Recuperado:', data);

// Limpar
await testStore.clear();
```

### Teste 3: Detecção de Rede

```javascript
// Testar evento de mudança de rede
window.addEventListener('online', () => {
  console.log('🌐 ONLINE');
});

window.addEventListener('offline', () => {
  console.log('📡 OFFLINE');
});

// Status atual
console.log('Status:', navigator.onLine ? 'ONLINE' : 'OFFLINE');
```

### Teste 4: Background Sync (futuro)

```javascript
// Verificar se Background Sync é suportado
if ('sync' in navigator.serviceWorker.registration) {
  console.log('✅ Background Sync suportado');
} else {
  console.log('❌ Background Sync não suportado');
}
```

## 📱 Testes Mobile

### Android (Chrome)

1. **Instalar PWA:**
   - Acessar site
   - Menu (⋮) > "Adicionar à tela inicial"
   - Ou banner automático "Instalar app"

2. **Testar Offline:**
   - Modo avião ON
   - Abrir app instalado
   - Deve funcionar offline

3. **DevTools Mobile:**
   ```bash
   # No computador, com celular conectado via USB:
   chrome://inspect#devices
   ```

### iOS (Safari)

1. **Adicionar à Tela Inicial:**
   - Acessar site no Safari
   - Botão Compartilhar (□↑)
   - "Adicionar à Tela de Início"

2. **Limitações iOS:**
   - ⚠️ Não mostra banner de instalação
   - ⚠️ Service Worker tem limitações
   - ⚠️ Cache pode ser limpo pelo sistema

### Desktop (Chrome/Edge)

1. **Instalar:**
   - Ícone ⊕ na barra de endereços
   - Ou Settings > Install BarTab

2. **App Standalone:**
   - Abre em janela própria
   - Sem barra de endereço
   - Ícone na dock/taskbar

## 🐛 Debug e Troubleshooting

### Problema: Service Worker não registra

```javascript
// DevTools Console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  console.log('Service Workers removidos');
  location.reload();
});
```

### Problema: Cache antigo

```javascript
// Limpar todos os caches
caches.keys().then(keys => {
  Promise.all(keys.map(key => caches.delete(key)))
    .then(() => console.log('Todos os caches limpos'));
});
```

### Problema: IndexedDB corrompido

```javascript
// Limpar IndexedDB
indexedDB.deleteDatabase('bartab')
  .onsuccess = () => console.log('DB removido');
```

### Limpar TUDO (reset completo)

```javascript
// CUIDADO: Remove TODOS os dados da aplicação
async function resetApp() {
  // Service Workers
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const reg of registrations) {
    await reg.unregister();
  }
  
  // Caches
  const cacheNames = await caches.keys();
  for (const name of cacheNames) {
    await caches.delete(name);
  }
  
  // IndexedDB
  indexedDB.deleteDatabase('bartab');
  
  // LocalStorage
  localStorage.clear();
  
  // SessionStorage
  sessionStorage.clear();
  
  console.log('✅ App resetado completamente');
  location.reload();
}

// Executar:
// await resetApp();
```

## 📊 Métricas PWA

### Lighthouse Audit

1. DevTools > Lighthouse
2. Categories > Progressive Web App ✓
3. "Generate report"

**Metas:**
- ✅ PWA Score: 100/100
- ✅ Installable
- ✅ Works Offline
- ✅ Fast and reliable
- ✅ Optimized

### Chrome PWA Checklist

Verificar em: chrome://flags/#enable-desktop-pwas

- ✅ Web app manifest
- ✅ Service worker
- ✅ HTTPS
- ✅ Icons 192x192 e 512x512
- ✅ Start URL responde offline
- ✅ Viewport meta tag
- ✅ Theme color

## 🎯 Cenários de Teste Completos

### Cenário 1: Primeiro Uso

1. ✅ Usuário acessa pela primeira vez
2. ✅ Banner de instalação aparece
3. ✅ Usuário instala
4. ✅ App abre em standalone mode
5. ✅ Service Worker cacheia assets
6. ✅ Próxima visita carrega instantaneamente

### Cenário 2: Uso Offline

1. ✅ Usuário está online
2. ✅ Navega pelo app (páginas ficam em cache)
3. ✅ Perde conexão
4. ✅ Indicador "Modo Offline" aparece
5. ✅ Adiciona lançamento (salvo offline)
6. ✅ Recupera conexão
7. ✅ Botão "Sincronizar" aparece
8. ✅ Clica em sincronizar
9. ✅ Dados enviados ao servidor
10. ✅ Toast de confirmação

### Cenário 3: Atualização

1. ✅ Usuário tem versão antiga instalada
2. ✅ Dev faz deploy de nova versão
3. ✅ Usuário abre app
4. ✅ Service Worker detecta atualização
5. ✅ Banner "Atualização Disponível" aparece
6. ✅ Usuário clica "Atualizar"
7. ✅ App recarrega com nova versão

## 🔍 Ferramentas de Debug

### Chrome DevTools

- **Application Tab:**
  - Service Workers
  - Manifest
  - Storage (Cache, IndexedDB, LocalStorage)
  - Clear storage

- **Network Tab:**
  - ☐ Offline checkbox
  - Filtrar por "serviceWorker"
  - Ver o que vem do cache vs rede

- **Lighthouse:**
  - PWA Audit
  - Performance
  - Accessibility

### Firefox DevTools

- **Storage Inspector:**
  - Cache Storage
  - IndexedDB
  - Service Workers

### Safari DevTools

- **Storage Tab:**
  - Application Cache
  - IndexedDB

## 📈 Monitoramento em Produção

```javascript
// Adicionar analytics para PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Usuário está usando PWA instalado');
  // analytics.track('pwa_usage');
}

// Detectar instalação
window.addEventListener('appinstalled', (e) => {
  console.log('PWA instalado!');
  // analytics.track('pwa_installed');
});

// Monitorar atualizações do SW
navigator.serviceWorker.addEventListener('controllerchange', () => {
  console.log('Service Worker atualizado');
  // analytics.track('sw_updated');
});
```

## ✅ Checklist Final Antes do Deploy

- [ ] Build sem erros
- [ ] Lighthouse PWA score 100/100
- [ ] Testado offline em Chrome Desktop
- [ ] Testado offline em Chrome Mobile
- [ ] Testado instalação Desktop
- [ ] Testado instalação Android
- [ ] Testado instalação iOS (add to home screen)
- [ ] Ícones carregam corretamente
- [ ] Manifest válido
- [ ] Service Worker ativo
- [ ] Cache funcionando
- [ ] IndexedDB funcionando
- [ ] Sincronização offline testada
- [ ] Banner de instalação funcionando
- [ ] Banner de atualização funcionando
- [ ] HTTPS configurado em produção

## 🎉 Pronto para Produção!

Após completar todos os testes, seu PWA está pronto para:
- ✅ Funcionar offline
- ✅ Ser instalado como app nativo
- ✅ Carregar instantaneamente
- ✅ Salvar dados localmente
- ✅ Sincronizar quando online
- ✅ Atualizar automaticamente

