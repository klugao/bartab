# 🚀 Início Rápido - Funcionalidade de Dívidas

## Como Iniciar o Sistema

### 1️⃣ Iniciar o Backend

```bash
cd /Users/eduardoklug/Documents/bartab/backend
npm run start:dev
```

**O backend estará rodando em**: `http://localhost:3000`

### 2️⃣ Iniciar o Frontend

```bash
cd /Users/eduardoklug/Documents/bartab/frontend
npm run dev
```

**O frontend estará rodando em**: `http://localhost:5173`

## ✅ Como Testar a Nova Funcionalidade

### Teste Rápido (5 minutos)

#### Passo 1: Criar um Cliente
1. Acesse `http://localhost:5173`
2. Clique em "Clientes" no menu
3. Clique em "Novo Cliente"
4. Preencha: Nome: "João Silva", Telefone: "11999999999"
5. Salve

#### Passo 2: Criar uma Conta com Dívida
1. Volte para "Contas" no menu
2. Clique em "Nova Conta"
3. Selecione o cliente "João Silva"
4. Adicione alguns itens (ex: 2x Cerveja, 1x Porção)
5. Clique em "Adicionar Pagamento"
6. Selecione método: "Fiado (Pagar Depois)"
7. Clique em "Fechar Conta"

#### Passo 3: Ver a Dívida
1. Clique em "Dívidas" no menu 🎉
2. Você verá o cliente "João Silva" na lista
3. Veja o valor total da dívida
4. Clique no nome para expandir e ver detalhes

#### Passo 4: Registrar Pagamento
1. Clique em "Registrar Pagamento"
2. O valor total já está preenchido
3. Selecione método de pagamento (ex: Dinheiro)
4. Clique em "Pagar Total"
5. ✅ Cliente some da lista!

### Teste de Pagamento Parcial

#### Cenário: Cliente deve R$ 100
1. Crie uma conta com valor de R$ 100
2. Feche com método "Fiado"
3. Vá em "Dívidas"
4. Clique em "Registrar Pagamento"
5. **Altere o valor para R$ 60**
6. Observe o alerta: "⚠️ Pagamento parcial - Restará R$ 40,00"
7. Confirme o pagamento
8. ✅ Cliente continua na lista com R$ 40,00 de dívida

## 📱 Navegação

### Menu Principal

- **Contas** → Gerenciar contas abertas/fechadas
- **Clientes** → Cadastro de clientes
- **Produtos** → Cadastro de itens do cardápio
- **Dívidas** 🆕 → Controle de dívidas
- **Relatórios** → Relatórios de consumo

## 🎯 Funcionalidades da Tela de Dívidas

### Visualização
- ✅ Lista de clientes com dívidas
- ✅ Valor total devido por cliente
- ✅ Detalhes expansíveis de cada conta
- ✅ Histórico de itens consumidos
- ✅ Histórico de pagamentos realizados

### Ações
- ✅ Registrar pagamento total
- ✅ Registrar pagamento parcial
- ✅ Adicionar observações
- ✅ Escolher método de pagamento

### Métodos de Pagamento Disponíveis
- 💵 Dinheiro (CASH)
- 💳 Débito (DEBIT)
- 💳 Crédito (CREDIT)
- 📱 PIX

## 🔍 Verificar se Está Funcionando

### Checklist Rápido

✅ **Backend rodando?**
```bash
curl http://localhost:3000/api/customers
# Deve retornar uma lista de clientes
```

✅ **Frontend rodando?**
- Abra `http://localhost:5173` no navegador
- Deve ver a tela de Contas

✅ **Endpoint de dívidas funcionando?**
```bash
curl http://localhost:3000/api/customers/debts/list
# Deve retornar lista de clientes com dívidas
```

✅ **Menu atualizado?**
- Veja se aparece "Dívidas" no menu de navegação
- Clique e veja se abre a nova tela

## 🐛 Problemas Comuns

### "Cannot GET /api/customers/debts/list"
**Solução**: Reinicie o backend
```bash
cd backend
npm run start:dev
```

### "Página não encontrada ao clicar em Dívidas"
**Solução**: Limpe cache e reinicie frontend
```bash
cd frontend
rm -rf .vite
npm run dev
```

### "Cliente não aparece na lista de Dívidas"
**Verificar**:
1. Cliente tem conta fechada?
2. Usou método "Fiado"?
3. Veja logs do backend no terminal

### Console mostra erros TypeScript
**Solução**: Compile novamente
```bash
cd frontend
npm run build
```

## 📊 Ver Dados no Banco

Se precisar verificar os dados diretamente:

```sql
-- Ver clientes com dívidas
SELECT name, balance_due 
FROM customers 
WHERE CAST(balance_due AS DECIMAL) < 0;

-- Ver contas de um cliente
SELECT * FROM tabs WHERE customer_id = 'ID_DO_CLIENTE';

-- Ver pagamentos de uma conta
SELECT * FROM payments WHERE tab_id = 'ID_DA_CONTA';
```

## 🎨 Capturas de Tela (O que Esperar)

### Tela de Dívidas - Vazia
```
╔══════════════════════════════════════╗
║  Controle de Dívidas                 ║
║  Clientes com pagamento pendente     ║
╠══════════════════════════════════════╣
║                                      ║
║     💵                               ║
║  Nenhuma dívida pendente             ║
║  Todos os clientes estão com         ║
║  as contas em dia! 🎉                ║
║                                      ║
╚══════════════════════════════════════╝
```

### Tela de Dívidas - Com Clientes
```
╔══════════════════════════════════════╗
║  João Silva               ▼          ║
║  11999999999                         ║
║  Dívida Total: R$ 150,00             ║
║  2 conta(s) com saldo devedor        ║
║           [Registrar Pagamento]      ║
╠══════════════════════════════════════╣
║  Maria Santos             ▼          ║
║  11988888888                         ║
║  Dívida Total: R$ 75,00              ║
║  1 conta(s) com saldo devedor        ║
║           [Registrar Pagamento]      ║
╚══════════════════════════════════════╝
```

### Modal de Pagamento
```
╔═══════════════════════════════════╗
║  Registrar Pagamento          ✕   ║
╠═══════════════════════════════════╣
║  Cliente: João Silva              ║
║  Dívida Total: R$ 150,00          ║
║                                   ║
║  Valor do Pagamento *             ║
║  R$ [150.00]       [Total]        ║
║                                   ║
║  Método de Pagamento *            ║
║  [Dinheiro ▼]                     ║
║                                   ║
║  Observações (opcional)           ║
║  [                    ]           ║
║                                   ║
║  ┌─────────────────────────────┐  ║
║  │ Dívida Atual:   R$ 150,00   │  ║
║  │ Pagamento:     -R$ 150,00   │  ║
║  │ ────────────────────────────│  ║
║  │ Saldo Final:     R$ 0,00    │  ║
║  └─────────────────────────────┘  ║
║                                   ║
║  [Cancelar]    [Pagar Total]      ║
╚═══════════════════════════════════╝
```

## 📞 Ajuda Adicional

### Documentação Completa
- `docs/debts-feature.md` - Documentação técnica completa
- `docs/TESTING_DEBTS.md` - Guia de testes detalhado
- `IMPLEMENTACAO_DIVIDAS.md` - Resumo da implementação

### Comandos Úteis

**Limpar tudo e reiniciar:**
```bash
# Backend
cd backend
rm -rf node_modules dist
npm install
npm run start:dev

# Frontend
cd frontend
rm -rf node_modules dist .vite
npm install
npm run dev
```

**Ver logs detalhados:**
```bash
# Backend - logs aparecem automaticamente no terminal
cd backend && npm run start:dev

# Frontend - abra DevTools (F12) no navegador
```

## ✨ Pronto para Usar!

A funcionalidade está **100% implementada e funcional**. 

Basta iniciar o sistema e começar a testar! 🎉

---

**Última atualização**: 15 de Outubro de 2025

