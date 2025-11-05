# 🔧 Como Adicionar as Rotas de LGPD

## ✅ O Que Foi Criado

Criei **2 páginas completas** dentro do seu sistema:

1. **`frontend/src/pages/PoliticaPrivacidade.tsx`** - Política de Privacidade completa
2. **`frontend/src/pages/TermosUso.tsx`** - Termos de Uso completos

Ambas as páginas têm:
- ✅ Design profissional e responsivo
- ✅ Botão "Voltar" funcional
- ✅ Conteúdo completo e formatado
- ✅ Links internos para navegação
- ✅ Conformidade com LGPD

---

## 📋 Passo a Passo: Adicionar as Rotas

### 1️⃣ Localize o arquivo de rotas

Procure um destes arquivos no seu projeto:
- `frontend/src/app/routes.tsx`
- `frontend/src/routes.tsx`
- `frontend/src/App.tsx` (se as rotas estão lá)
- `frontend/src/router/index.tsx`

### 2️⃣ Adicione os imports no topo do arquivo

```typescript
import PoliticaPrivacidade from '../pages/PoliticaPrivacidade';
import TermosUso from '../pages/TermosUso';
```

### 3️⃣ Adicione as rotas

**Se você usa React Router v6+:**

```typescript
// Adicione estas rotas junto com as outras
{
  path: '/politica-privacidade',
  element: <PoliticaPrivacidade />
},
{
  path: '/termos-uso',
  element: <TermosUso />
}
```

**Exemplo completo de como pode ficar:**

```typescript
import { createBrowserRouter } from 'react-router-dom';
import PoliticaPrivacidade from '../pages/PoliticaPrivacidade';
import TermosUso from '../pages/TermosUso';
// ... outros imports

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: '/customers',
        element: <Customers />
      },
      // ... outras rotas existentes ...
      
      // ✅ ADICIONE ESTAS DUAS ROTAS:
      {
        path: '/politica-privacidade',
        element: <PoliticaPrivacidade />
      },
      {
        path: '/termos-uso',
        element: <TermosUso />
      }
    ]
  }
]);
```

---

## 🎯 Testando as Rotas

Após adicionar as rotas, teste acessando:

1. **http://localhost:5175/politica-privacidade**
2. **http://localhost:5175/termos-uso**

Você deverá ver as páginas completas e formatadas! ✅

---

## 🔗 Links Atualizados

Os links no **Modal de Consentimento** já foram atualizados para:
- ✅ `/politica-privacidade` (em vez de GitHub)
- ✅ `/termos-uso` (em vez de GitHub)

---

## 📱 Onde Adicionar Links para as Páginas

### No Menu/Sidebar (Opcional)

Você pode adicionar links permanentes no seu menu:

```tsx
<nav>
  {/* ... outros links ... */}
  
  <a href="/politica-privacidade" className="text-gray-600 hover:text-gray-900">
    Política de Privacidade
  </a>
  
  <a href="/termos-uso" className="text-gray-600 hover:text-gray-900">
    Termos de Uso
  </a>
</nav>
```

### No Footer (Recomendado)

Adicione no rodapé do seu site:

```tsx
<footer className="bg-gray-100 py-4 px-6">
  <div className="flex gap-4 justify-center text-sm text-gray-600">
    <a href="/politica-privacidade" className="hover:text-gray-900">
      Política de Privacidade
    </a>
    <span>|</span>
    <a href="/termos-uso" className="hover:text-gray-900">
      Termos de Uso
    </a>
  </div>
</footer>
```

---

## 🎨 Personalização (Opcional)

Se quiser personalizar as páginas, edite:
- `frontend/src/pages/PoliticaPrivacidade.tsx`
- `frontend/src/pages/TermosUso.tsx`

Você pode:
- Mudar cores do Tailwind
- Adicionar seu logo
- Ajustar textos
- Modificar formatação

---

## ✅ Checklist Final

- [ ] Adicionar imports das páginas no arquivo de rotas
- [ ] Adicionar as 2 rotas (`/politica-privacidade` e `/termos-uso`)
- [ ] Testar acessando as URLs no navegador
- [ ] (Opcional) Adicionar links no footer/menu
- [ ] (Opcional) Personalizar visual das páginas

---

## 🆘 Precisa de Ajuda?

Se não encontrar o arquivo de rotas ou tiver dúvidas, me mostre a estrutura do seu `frontend/src/` que eu te ajudo! 

**Comando para ver a estrutura:**
```bash
cd frontend/src
ls -la
```

---

✅ **Pronto! Agora seus documentos legais estão dentro do próprio sistema!**

