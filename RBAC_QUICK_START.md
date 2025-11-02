# 🚀 RBAC Quick Start - BarTab

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Instalar Dependências
```bash
cd backend
npm install nodemailer @types/nodemailer
```

### 2️⃣ Configurar E-mail
```bash
# Edite o arquivo .env e adicione:
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-do-gmail
```

**Como obter senha de app do Gmail:**
1. Vá em: https://myaccount.google.com/apppasswords
2. Crie uma senha para "E-mail"
3. Copie e cole no `.env`

### 3️⃣ Iniciar Servidor
```bash
npm run start:dev
```

### 4️⃣ Testar
```bash
# Teste o envio de e-mail
npx ts-node test-email.ts

# Faça login como admin
# Acesse: http://localhost:5173
# Login com: eduardo.klug7@gmail.com
```

---

## 🎯 O Que Foi Implementado?

### ✅ Sistema de Roles (RBAC)
- **Administrador do Sistema** (eduardo.klug7@gmail.com)
  - Pode aprovar/rejeitar estabelecimentos
  - Acessa todos os dados do sistema
  
- **Proprietário** (qualquer outro e-mail)
  - Gerencia apenas seu estabelecimento
  - Aguarda aprovação para usar o sistema

### ✅ Fluxo de Aprovação
```
1. Novo usuário faz login
   ↓
2. Se não for admin → Status "Pendente"
   ↓
3. 📧 E-mail enviado para admin
   ↓
4. Admin aprova/rejeita
   ↓
5. 📧 E-mail enviado para proprietário
   ↓
6. Proprietário pode usar o sistema
```

### ✅ Endpoints de Admin
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/statistics` | Estatísticas gerais |
| GET | `/admin/establishments/pending` | Estabelecimentos pendentes |
| GET | `/admin/establishments` | Todos os estabelecimentos |
| POST | `/admin/approve/:id` | Aprovar estabelecimento |
| POST | `/admin/reject/:id` | Rejeitar estabelecimento |

### ✅ Notificações por E-mail
1. **🚨 Alerta para Admin** - Quando novo proprietário se cadastra
2. **✅ Aprovação** - Quando estabelecimento é aprovado
3. **❌ Rejeição** - Quando estabelecimento é rejeitado

---

## 📚 Documentação Completa

| Arquivo | Descrição |
|---------|-----------|
| `backend/RBAC_E_NOTIFICACOES.md` | 📖 Documentação técnica completa |
| `backend/INSTALL_RBAC.md` | 🔧 Guia de instalação detalhado |
| `RESUMO_IMPLEMENTACAO_RBAC.md` | 📋 Resumo da implementação |
| `COMANDOS_RAPIDOS_RBAC.md` | ⚡ Comandos úteis |
| `CHECKLIST_RBAC.md` | ✅ Checklist de verificação |

---

## 🧪 Testar Rapidamente

### Teste 1: Verificar Admin
```bash
# 1. Login como eduardo.klug7@gmail.com
# 2. Abra o console do navegador
# 3. Execute:
JSON.parse(atob(localStorage.getItem('token').split('.')[1]))
# Deve mostrar: "role": "AdministradorSistema"
```

### Teste 2: Novo Proprietário
```bash
# 1. Abra em modo anônimo
# 2. Login com outra conta Google
# 3. Crie estabelecimento "Bar Teste"
# 4. Verifique inbox de eduardo.klug7@gmail.com
# ✅ Deve receber e-mail de alerta
```

### Teste 3: Aprovar
```bash
# Como admin
TOKEN="seu-token-aqui"
curl -X GET http://localhost:3000/admin/establishments/pending \
  -H "Authorization: Bearer $TOKEN"

# Copie o ID e aprove
curl -X POST http://localhost:3000/admin/approve/ID_AQUI \
  -H "Authorization: Bearer $TOKEN"

# ✅ Proprietário recebe e-mail de aprovação
```

---

## 🆘 Problemas Comuns

### ❌ Erro ao enviar e-mail
```bash
# Solução: Verifique as credenciais
cat .env | grep SMTP
npx ts-node test-email.ts
```

### ❌ Column 'role' does not exist
```bash
# Solução: Recrie o banco
psql -U pdv -c "DROP DATABASE pdv_dev; CREATE DATABASE pdv_dev;"
npm run start:dev
```

### ❌ 403 Forbidden em rotas admin
```bash
# Verifique se é realmente admin
# Token deve conter: "role": "AdministradorSistema"
# Se não, faça logout e login novamente
```

---

## 🎨 Próximos Passos (Frontend)

### Criar Tela de Admin
```typescript
// src/pages/AdminDashboard.tsx
export function AdminDashboard() {
  const [pending, setPending] = useState([]);
  
  useEffect(() => {
    api.get('/admin/establishments/pending')
      .then(res => setPending(res.data));
  }, []);
  
  const handleApprove = async (id: string) => {
    await api.post(`/admin/approve/${id}`);
    alert('Aprovado!');
    // Recarregar lista
  };
  
  return (
    <div>
      <h1>Estabelecimentos Pendentes</h1>
      {pending.map(est => (
        <Card key={est.id}>
          <h3>{est.name}</h3>
          <p>{est.proprietario?.email}</p>
          <Button onClick={() => handleApprove(est.id)}>
            Aprovar
          </Button>
        </Card>
      ))}
    </div>
  );
}
```

### Criar Tela de "Aguardando Aprovação"
```typescript
// src/pages/PendingApproval.tsx
export function PendingApproval() {
  const { user } = useAuth();
  
  if (user?.establishment?.statusAprovacao === 'Aprovado') {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>⏳ Aguardando Aprovação</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Seu estabelecimento está em análise.</p>
          <p>Você receberá um e-mail quando for aprovado.</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Proteger Rotas por Role
```typescript
// src/components/ProtectedRoute.tsx
export function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: { 
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && user.role !== 'AdministradorSistema') {
    return <Navigate to="/dashboard" />;
  }
  
  if (user.establishment?.statusAprovacao !== 'Aprovado' && 
      user.role !== 'AdministradorSistema') {
    return <Navigate to="/pending-approval" />;
  }
  
  return <>{children}</>;
}

// Uso nas rotas:
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requireAdmin>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## 📊 Status da Implementação

| Componente | Status |
|------------|--------|
| ✅ Enums | Completo |
| ✅ Entidades | Completo |
| ✅ Guards | Completo |
| ✅ NotificationService | Completo |
| ✅ AdminModule | Completo |
| ✅ AuthService | Completo |
| ✅ Documentação | Completo |
| 🟡 Testes Automatizados | Pendente |
| 🟡 Frontend Admin | Pendente |

---

## 🎉 Conclusão

O sistema RBAC está **100% funcional** no backend!

### O que funciona agora:
- ✅ Login com Google OAuth
- ✅ Atribuição automática de roles
- ✅ Aprovação de estabelecimentos
- ✅ Notificações por e-mail
- ✅ Guards de autorização
- ✅ Endpoints de administração

### Próximo passo:
Implementar as telas de admin e aprovação no frontend.

---

**💻 Desenvolvido para o BarTab**  
**📅 Data:** 02/11/2025  
**👨‍💻 Desenvolvedor:** Eduardo Klug  
**📧 Admin:** eduardo.klug7@gmail.com

**⭐ Documentação completa em:** `backend/RBAC_E_NOTIFICACOES.md`

