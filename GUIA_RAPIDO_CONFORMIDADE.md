# ⚡ Guia Rápido de Conformidade - BarTab

Este guia apresenta as ações mínimas necessárias para colocar o projeto em **conformidade básica** com normas e regulamentações.

## 🎯 Objetivo

Alcançar **80% de conformidade** em **2-3 semanas** implementando os itens críticos e de alta prioridade.

---

## ✅ ETAPA 1: Correções Críticas (Esta Semana)

### 1.1 ✅ Helmet Habilitado [CONCLUÍDO]

O Helmet já foi habilitado no backend para adicionar headers de segurança HTTP.

**Status:** ✅ **IMPLEMENTADO**

### 1.2 📄 Documentos Legais Criados [CONCLUÍDO]

Documentos já criados:
- ✅ `POLITICA_PRIVACIDADE.md`
- ✅ `TERMOS_DE_USO.md`
- ✅ `LICENSE` (MIT)
- ✅ `THIRD_PARTY_LICENSES.md`

**Status:** ✅ **CRIADOS** - Requerem personalização

**Ação necessária:**
1. Revisar e preencher campos marcados com `[INSERIR...]` na Política de Privacidade
2. Revisar e preencher campos marcados com `[INSERIR...]` nos Termos de Uso
3. Escolher modelo de cobrança nos Termos (Gratuito/Freemium/Pago)

### 1.3 🔒 Tela de Consentimento LGPD [PENDENTE]

**O que fazer:**

1. **Criar componente de Consentimento** (`frontend/src/components/ConsentModal.tsx`):

```typescript
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

export default function ConsentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('bartab_consent');
    if (!consent) {
      setIsOpen(true);
    } else {
      setHasAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('bartab_consent', JSON.stringify({
      accepted: true,
      date: new Date().toISOString(),
      version: '1.0'
    }));
    setHasAccepted(true);
    setIsOpen(false);
  };

  const handleReject = () => {
    window.location.href = 'https://www.google.com';
  };

  if (hasAccepted) return null;

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-2xl font-bold mb-4">
            🔒 Privacidade e Consentimento
          </Dialog.Title>
          
          <div className="prose max-h-96 overflow-y-auto mb-6">
            <p>Bem-vindo ao BarTab! Antes de continuar, precisamos do seu consentimento para:</p>
            <ul>
              <li>✅ Coletar seu nome, e-mail e foto via Google OAuth</li>
              <li>✅ Armazenar informações do seu estabelecimento</li>
              <li>✅ Processar dados de clientes e vendas do seu PDV</li>
              <li>✅ Utilizar cookies para manter sua sessão</li>
            </ul>
            <p className="text-sm text-gray-600">
              Seus dados são protegidos conforme a LGPD (Lei 13.709/2018). 
              Você pode exercer seus direitos de acesso, correção e exclusão a qualquer momento.
            </p>
            <div className="flex gap-2 mt-4">
              <a href="/POLITICA_PRIVACIDADE.md" target="_blank" 
                 className="text-blue-600 hover:underline text-sm">
                📄 Política de Privacidade
              </a>
              <a href="/TERMOS_DE_USO.md" target="_blank" 
                 className="text-blue-600 hover:underline text-sm">
                📜 Termos de Uso
              </a>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleReject}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Recusar
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Aceitar e Continuar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
```

2. **Adicionar ao App principal** (`frontend/src/App.tsx`):

```typescript
import ConsentModal from './components/ConsentModal';

function App() {
  return (
    <>
      <ConsentModal />
      {/* resto do app */}
    </>
  );
}
```

**Tempo estimado:** 2 horas

### 1.4 🧹 Remover Logs Sensíveis [PENDENTE]

**Buscar e remover/modificar:**

```bash
# Buscar logs que expõem dados sensíveis
cd backend
grep -r "console.log.*customer" src/
grep -r "console.log.*user" src/
grep -r "console.log.*payment" src/
```

**Substituir por logs estruturados:**

```typescript
// ❌ Antes
console.log('Cliente criado:', customer);

// ✅ Depois
console.log('Cliente criado com sucesso', { customerId: customer.id });
```

**Tempo estimado:** 3 horas

---

## 🟠 ETAPA 2: Alta Prioridade (Próximas 2 Semanas)

### 2.1 🗑️ Funcionalidade de Exclusão de Dados (LGPD)

**Backend - Endpoint de exclusão:**

```typescript
// backend/src/modules/customers/customers.controller.ts

@Delete(':id')
async remove(@Param('id') id: string, @Req() req: any) {
  // Verifica se há débitos pendentes
  const customer = await this.customersService.findOne(id, req.user.establishmentId);
  
  if (parseFloat(customer.balance_due) > 0) {
    throw new BadRequestException(
      'Não é possível excluir cliente com débitos pendentes. ' +
      'Regularize a situação ou solicite exclusão ao suporte.'
    );
  }
  
  // Excluir histórico de vendas (anonimizar se necessário por lei fiscal)
  await this.customersService.remove(id, req.user.establishmentId);
  
  return { message: 'Cliente excluído com sucesso' };
}
```

**Frontend - Botão de exclusão:**

```tsx
<button
  onClick={() => handleDeleteCustomer(customer.id)}
  className="text-red-600 hover:text-red-800"
>
  🗑️ Excluir Dados
</button>
```

**Tempo estimado:** 4 horas

### 2.2 📊 Funcionalidade de Acesso aos Dados (LGPD)

**Backend - Endpoint de exportação:**

```typescript
// backend/src/modules/customers/customers.controller.ts

@Get(':id/export')
async exportData(@Param('id') id: string, @Req() req: any) {
  const customer = await this.customersService.findOne(id, req.user.establishmentId);
  const tabs = await this.tabsService.findByCustomer(id, req.user.establishmentId);
  
  return {
    customer: {
      name: customer.name,
      phone: customer.phone,
      balance_due: customer.balance_due,
      created_at: customer.created_at,
    },
    purchase_history: tabs,
    exported_at: new Date().toISOString(),
    format: 'JSON',
  };
}
```

**Frontend - Botão de exportação:**

```tsx
<button
  onClick={() => downloadCustomerData(customer.id)}
  className="text-blue-600 hover:text-blue-800"
>
  📥 Baixar Meus Dados
</button>
```

**Tempo estimado:** 4 horas

### 2.3 🚦 Rate Limiting

**Instalar dependência:**

```bash
cd backend
npm install @nestjs/throttler
```

**Configurar no AppModule:**

```typescript
// backend/src/app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minuto
      limit: 100, // 100 requisições por minuto
    }]),
    // ... outros imports
  ],
})
```

**Aplicar globalmente:**

```typescript
// backend/src/main.ts
import { ThrottlerGuard } from '@nestjs/throttler';

app.useGlobalGuards(new ThrottlerGuard());
```

**Tempo estimado:** 2 horas

### 2.4 ⚠️ Desabilitar `synchronize: true` em Produção

**Modificar `app.module.ts`:**

```typescript
// backend/src/app.module.ts

TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production', // ✅ Desabilitado em prod
  logging: process.env.NODE_ENV !== 'production',
  // ...
}),
```

**Criar migrations:**

```bash
cd backend
npm run typeorm migration:generate -- -n InitialSchema
npm run typeorm migration:run
```

**Tempo estimado:** 3 horas

### 2.5 📝 Documentar Tratamento de Dados

**Criar `TRATAMENTO_DADOS.md`:**

```markdown
# Registro de Atividades de Tratamento de Dados

## 1. Dados de Usuários do Sistema
- **Dados coletados:** Nome, e-mail, foto, Google ID
- **Finalidade:** Autenticação e controle de acesso
- **Base legal:** Execução de contrato
- **Retenção:** Enquanto conta ativa + 30 dias após exclusão
- **Compartilhamento:** Google LLC (autenticação)

## 2. Dados de Clientes do PDV
- **Dados coletados:** Nome, telefone, saldo devedor
- **Finalidade:** Gestão de vendas e contas fiadas
- **Base legal:** Legítimo interesse comercial
- **Retenção:** Enquanto houver relacionamento + 5 anos (fiscal)
- **Compartilhamento:** Não compartilhado

## 3. Dados de Transações
- **Dados coletados:** Valor, método, data/hora, itens
- **Finalidade:** Controle financeiro e fiscal
- **Base legal:** Obrigação legal
- **Retenção:** 5 anos (legislação fiscal)
- **Compartilhamento:** Autoridades fiscais (quando solicitado)
```

**Tempo estimado:** 2 horas

---

## 🟡 ETAPA 3: Média Prioridade (1 Mês)

### 3.1 🔐 Criptografia de Dados Financeiros

Implementar criptografia para campos sensíveis como `balance_due`.

**Tempo estimado:** 8 horas

### 3.2 📋 Logs Estruturados

Migrar para Winston ou Pino para logs profissionais.

**Tempo estimado:** 6 horas

### 3.3 🔄 Rotação de Tokens JWT

Implementar refresh tokens e rotação automática.

**Tempo estimado:** 8 horas

---

## 📊 Checklist de Progresso

### ✅ Crítico (Esta Semana)
- [x] Helmet habilitado
- [x] Política de Privacidade criada
- [x] Termos de Uso criados
- [x] Licença MIT adicionada
- [x] THIRD_PARTY_LICENSES.md criado
- [ ] Tela de consentimento implementada (2h)
- [ ] Logs sensíveis removidos (3h)
- [ ] Personalizar documentos legais (2h)

**Total:** ~7 horas de trabalho restantes

### 🟠 Alta Prioridade (2 Semanas)
- [ ] Exclusão de dados (4h)
- [ ] Acesso aos dados (4h)
- [ ] Rate limiting (2h)
- [ ] Desabilitar synchronize em prod (3h)
- [ ] Documentar tratamento de dados (2h)

**Total:** ~15 horas de trabalho

### 🟡 Média Prioridade (1 Mês)
- [ ] Criptografia de dados financeiros (8h)
- [ ] Logs estruturados (6h)
- [ ] Rotação de tokens JWT (8h)

**Total:** ~22 horas de trabalho

---

## 🎯 Conformidade por Etapa

| Etapa | Conformidade | Status |
|-------|--------------|--------|
| **Atual** | 55% | ⚠️ Parcial |
| **Após Etapa 1** | 70% | ✅ Adequado |
| **Após Etapa 2** | 85% | ✅ Bom |
| **Após Etapa 3** | 95% | ✅ Excelente |

---

## 📚 Documentos de Referência

1. **Análise Completa:** [ANALISE_CONFORMIDADE_NORMAS.md](./ANALISE_CONFORMIDADE_NORMAS.md)
2. **Política de Privacidade:** [POLITICA_PRIVACIDADE.md](./POLITICA_PRIVACIDADE.md)
3. **Termos de Uso:** [TERMOS_DE_USO.md](./TERMOS_DE_USO.md)
4. **Licenças de Terceiros:** [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md)

---

## ❓ Dúvidas Frequentes

**P: Preciso contratar um advogado?**  
R: Para uso acadêmico/portfólio, os templates fornecidos são suficientes. Para uso comercial real, recomenda-se revisão jurídica.

**P: Posso usar o projeto em produção agora?**  
R: Após implementar a **Etapa 1** (crítico), sim. As demais etapas aumentam a segurança e conformidade.

**P: E se eu não implementar nada disso?**  
R: Para fins acadêmicos, pode limitar a nota. Para uso real, há risco de multas LGPD e problemas legais.

**P: Quanto tempo leva para conformidade total?**  
R: ~44 horas de trabalho (~1-2 semanas em tempo integral, ou 2-3 semanas em tempo parcial).

---

✅ **Foco nas Etapas 1 e 2 para ter um projeto apresentável e seguro!**

