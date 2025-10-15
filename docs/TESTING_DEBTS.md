# Guia de Teste - Funcionalidade de Dívidas

## Pré-requisitos

Certifique-se de que o backend e frontend estão rodando:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Cenários de Teste

### 1. Criar uma Dívida com Pagamento "Fiado"

**Passos:**
1. Acesse a página inicial (Contas)
2. Crie uma nova conta para um cliente
3. Adicione alguns itens à conta
4. Clique em "Fechar Conta"
5. Selecione método de pagamento "Fiado (Pagar Depois)"
6. Confirme o pagamento

**Resultado Esperado:**
- Conta é fechada
- Cliente aparece na tela de Dívidas com o valor total devido

### 2. Criar uma Dívida com Pagamento Parcial

**Passos:**
1. Crie uma nova conta para um cliente
2. Adicione itens no valor de R$ 100,00
3. Clique em "Fechar Conta"
4. Registre um pagamento parcial:
   - Valor: R$ 60,00
   - Método: Dinheiro
5. A conta ainda não deve fechar (saldo devedor: R$ 40,00)
6. Registre outro pagamento:
   - Valor: R$ 40,00
   - Método: Fiado
7. Agora a conta fecha

**Resultado Esperado:**
- Cliente aparece na tela de Dívidas com R$ 40,00 de dívida
- Detalhes mostram o histórico de pagamentos

### 3. Visualizar Dívidas

**Passos:**
1. Acesse "Dívidas" no menu
2. Veja a lista de clientes devedores
3. Clique no nome de um cliente para expandir
4. Verifique os detalhes:
   - Itens consumidos
   - Pagamentos realizados
   - Saldo devedor

**Resultado Esperado:**
- Lista mostra todos os clientes com dívidas
- Detalhes completos e corretos de cada conta
- Valores calculados corretamente

### 4. Pagar Dívida Total

**Passos:**
1. Na tela de Dívidas, escolha um cliente
2. Clique em "Registrar Pagamento"
3. O valor deve estar preenchido com o total da dívida
4. Selecione método de pagamento (ex: Dinheiro)
5. Adicione uma observação (opcional)
6. Confirme o pagamento

**Resultado Esperado:**
- Pagamento é registrado
- Cliente some da lista de Dívidas
- Toast de sucesso é exibido

### 5. Pagar Dívida Parcial

**Passos:**
1. Na tela de Dívidas, escolha um cliente com dívida de R$ 100,00
2. Clique em "Registrar Pagamento"
3. Altere o valor para R$ 60,00
4. Observe o alerta de pagamento parcial
5. Selecione método de pagamento
6. Confirme

**Resultado Esperado:**
- Pagamento parcial é registrado
- Cliente continua na lista com dívida de R$ 40,00
- Alerta mostra saldo restante
- Toast de sucesso

### 6. Validações

**Teste os seguintes cenários de erro:**

a) **Valor Inválido:**
   - Tente pagar com valor 0 ou negativo
   - Sistema deve rejeitar

b) **Valor Maior que Dívida:**
   - Tente pagar mais do que o cliente deve
   - Sistema deve rejeitar

c) **Campos Obrigatórios:**
   - Tente enviar sem valor
   - Tente enviar sem método de pagamento
   - Sistema deve exigir campos obrigatórios

### 7. Teste de Integração Completo

**Fluxo completo:**
1. Crie 3 clientes
2. Para cada cliente, crie contas com diferentes cenários:
   - Cliente A: 2 contas fiadas (R$ 50,00 + R$ 30,00)
   - Cliente B: 1 conta com pagamento parcial (R$ 100,00, pago R$ 70,00)
   - Cliente C: 1 conta totalmente paga (não deve aparecer)
3. Vá para tela de Dívidas
4. Verifique que apenas A e B aparecem
5. Pague metade da dívida do Cliente A
6. Pague total da dívida do Cliente B
7. Verifique que B some e A continua com saldo reduzido

## Verificação de Dados

### No Backend

Você pode verificar os dados diretamente no banco:

```sql
-- Ver clientes com dívidas
SELECT id, name, balance_due 
FROM customers 
WHERE CAST(balance_due AS DECIMAL) < 0;

-- Ver contas fechadas de um cliente
SELECT t.id, t.status, t.closed_at,
       (SELECT SUM(CAST(total AS DECIMAL)) FROM tab_items WHERE tab_id = t.id) as total,
       (SELECT SUM(CAST(amount AS DECIMAL)) FROM payments WHERE tab_id = t.id) as paid
FROM tabs t
WHERE t.customer_id = 'ID_DO_CLIENTE' 
  AND t.status = 'CLOSED';
```

### Logs do Console

**Backend:**
- Observe os logs no terminal do backend
- Deve ver: "Buscando clientes com dívidas..."
- Deve ver: "Processando pagamento de dívida..."

**Frontend:**
- Abra DevTools (F12)
- Observe os logs de chamadas à API
- Verifique Network tab para ver requests

## Problemas Comuns

### Cliente não aparece na lista de Dívidas

**Possíveis causas:**
1. balance_due não está negativo
2. Conta não foi fechada
3. Cache do frontend

**Solução:**
- Verifique o balance_due no banco de dados
- Force refresh (Ctrl+F5)
- Verifique logs do backend

### Pagamento não atualiza saldo

**Possíveis causas:**
1. Erro na API
2. Validação falhou
3. Cliente não existe

**Solução:**
- Veja console do backend para erros
- Verifique Network tab no DevTools
- Confirme que o ID do cliente está correto

### Valores incorretos

**Possíveis causas:**
1. Problemas de conversão de tipos (string/number)
2. Arredondamento de decimais

**Solução:**
- Verifique cálculos no backend
- Confirme que valores estão sendo parseados corretamente

## Checklist de Testes

- [ ] Criar dívida com pagamento fiado
- [ ] Criar dívida com pagamento parcial
- [ ] Visualizar lista de dívidas
- [ ] Expandir/colapsar detalhes de cliente
- [ ] Ver detalhes de contas individuais
- [ ] Pagar dívida total
- [ ] Pagar dívida parcial
- [ ] Validar campos obrigatórios
- [ ] Validar valor mínimo
- [ ] Validar valor máximo
- [ ] Cliente some quando dívida zerada
- [ ] Responsividade mobile
- [ ] Navegação entre telas
- [ ] Mensagens de erro apropriadas
- [ ] Toast de sucesso exibido

## Aprovação Final

✅ **Todos os testes passaram?**
- Sistema está pronto para uso em produção
- Documente qualquer comportamento inesperado
- Considere melhorias futuras listadas no debts-feature.md

