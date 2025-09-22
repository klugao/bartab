const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Mock data
const customers = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-9999', balance_due: '0' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 88888-8888', balance_due: '0' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@email.com', phone: '(11) 77777-7777', balance_due: '0' }
];

const items = [
  { id: '1', name: 'Cerveja Heineken', price: '8.50', active: true },
  { id: '2', name: 'Refrigerante Coca-Cola', price: '6.00', active: true },
  { id: '3', name: 'Água Mineral', price: '4.00', active: true },
  { id: '4', name: 'Batata Frita', price: '12.00', active: true },
  { id: '5', name: 'Hambúrguer', price: '18.00', active: true },
  { id: '6', name: 'Pizza Margherita', price: '25.00', active: true }
];

const tabs = [];

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'BarTab API funcionando!', timestamp: new Date().toISOString() });
});

app.get('/api/customers', (req, res) => {
  console.log('GET /api/customers - retornando', customers.length, 'clientes');
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const newCustomer = {
    id: String(customers.length + 1),
    ...req.body,
    balance_due: '0'
  };
  customers.push(newCustomer);
  console.log('POST /api/customers - criado:', newCustomer.name);
  res.json(newCustomer);
});

app.get('/api/items', (req, res) => {
  console.log('GET /api/items - retornando', items.length, 'itens');
  res.json(items);
});

app.get('/api/items/active', (req, res) => {
  const activeItems = items.filter(item => item.active);
  console.log('GET /api/items/active - retornando', activeItems.length, 'itens ativos');
  res.json(activeItems);
});

app.post('/api/items', (req, res) => {
  const newItem = {
    id: String(items.length + 1),
    ...req.body,
    active: true
  };
  items.push(newItem);
  console.log('POST /api/items - criado:', newItem.name);
  res.json(newItem);
});

app.get('/api/tabs', (req, res) => {
  const openTabs = tabs.filter(tab => tab.status === 'OPEN');
  console.log('GET /api/tabs - retornando', openTabs.length, 'contas abertas');
  res.json(openTabs);
});

// Endpoint para listar contas fechadas
app.get('/api/tabs/closed', (req, res) => {
  const closedTabs = tabs.filter(tab => tab.status === 'CLOSED')
    .sort((a, b) => new Date(b.closed_at || b.opened_at) - new Date(a.closed_at || a.opened_at));
  console.log('GET /api/tabs/closed - retornando', closedTabs.length, 'contas fechadas');
  res.json(closedTabs);
});

app.post('/api/tabs', (req, res) => {
  const newTab = {
    id: String(tabs.length + 1),
    customerId: req.body.customerId,
    customer: req.body.customerId ? customers.find(c => c.id === req.body.customerId) : null,
    status: 'OPEN',
    opened_at: new Date().toISOString(),
    tabItems: [],
    payments: []
  };
  tabs.push(newTab);
  console.log('POST /api/tabs - criada conta:', newTab.id);
  res.json(newTab);
});

// Endpoint para adicionar item que FUNCIONA
app.post('/api/tabs/add-item', (req, res) => {
  const { tabId, itemId, qty } = req.body;
  console.log('POST /api/tabs/add-item - Dados:', { tabId, itemId, qty });
  
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) {
    return res.status(404).json({ error: 'Conta não encontrada' });
  }
  
  const item = items.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item não encontrado' });
  }
  
  const unitPrice = parseFloat(item.price);
  const total = (unitPrice * qty).toFixed(2);
  
  const tabItem = {
    id: String(Date.now()),
    item: item,
    qty: qty,
    unit_price: item.price,
    total: total
  };
  
  tab.tabItems.push(tabItem);
  
  console.log('POST /api/tabs/add-item - Item adicionado:', item.name, 'x', qty);
  res.json(tabItem);
});

// Endpoint para buscar detalhes de uma conta específica
app.get('/api/tabs/:id', (req, res) => {
  const { id } = req.params;
  console.log('GET /api/tabs/:id - Buscando conta:', id);
  
  const tab = tabs.find(t => t.id === id);
  if (!tab) {
    return res.status(404).json({ error: 'Conta não encontrada' });
  }
  
  console.log('GET /api/tabs/:id - Conta encontrada:', tab.id);
  res.json(tab);
});

// Endpoint para remover item da conta
app.post('/api/tabs/remove-item', (req, res) => {
  const { tabId, tabItemId } = req.body;
  console.log('POST /api/tabs/remove-item - Dados:', { tabId, tabItemId });
  
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) {
    return res.status(404).json({ error: 'Conta não encontrada' });
  }
  
  const itemIndex = tab.tabItems.findIndex(item => item.id === tabItemId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item não encontrado na conta' });
  }
  
  const removedItem = tab.tabItems.splice(itemIndex, 1)[0];
  console.log('POST /api/tabs/remove-item - Item removido:', removedItem.item.name);
  res.json({ message: 'Item removido com sucesso' });
});

// Endpoint para adicionar pagamento
app.post('/api/tabs/add-payment', (req, res) => {
  const { tabId, method, amount, notes } = req.body;
  console.log('POST /api/tabs/add-payment - Dados:', { tabId, method, amount, notes });
  
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) {
    return res.status(404).json({ error: 'Conta não encontrada' });
  }
  
  // Criar pagamento
  const payment = {
    id: Date.now().toString(),
    method,
    amount: parseFloat(amount).toFixed(2),
    notes: notes || '',
    paid_at: new Date().toISOString()
  };
  
  if (!tab.payments) {
    tab.payments = [];
  }
  
  tab.payments.push(payment);
  
  // Calcular total pago
  const totalPaid = tab.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const totalDue = tab.tabItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
  
  // Se pagou tudo, fechar a conta
  if (totalPaid >= totalDue) {
    tab.status = 'CLOSED';
    tab.closed_at = new Date().toISOString();
  }
  
  console.log('POST /api/tabs/add-payment - Pagamento adicionado:', method, 'R$', amount);
  res.json(payment);
});

// Endpoint para excluir conta vazia
app.post('/api/tabs/delete-tab', (req, res) => {
  const { tabId } = req.body;
  console.log('POST /api/tabs/delete-tab - ID:', tabId);
  
  const tabIndex = tabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) {
    return res.status(404).json({ error: 'Conta não encontrada' });
  }
  
  const tab = tabs[tabIndex];
  if (tab.tabItems && tab.tabItems.length > 0) {
    return res.status(400).json({ error: 'Não é possível excluir uma conta que possui itens' });
  }
  
  tabs.splice(tabIndex, 1);
  console.log('POST /api/tabs/delete-tab - Conta excluída:', tabId);
  res.json({ message: 'Conta excluída com sucesso' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log('🚀 BarTab Backend iniciado com sucesso!');
  console.log(`📊 API rodando em: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend deve acessar: http://localhost:5173`);
  console.log('');
  console.log('📋 Endpoints disponíveis:');
  console.log('  GET  /api/customers');
  console.log('  POST /api/customers');
  console.log('  GET  /api/items');
  console.log('  GET  /api/items/active');
  console.log('  POST /api/items');
  console.log('  GET  /api/tabs');
  console.log('  GET  /api/tabs/closed');
  console.log('  GET  /api/tabs/:id');
  console.log('  POST /api/tabs');
  console.log('  POST /api/tabs/add-item');
  console.log('  POST /api/tabs/remove-item');
  console.log('  POST /api/tabs/add-payment');
  console.log('  POST /api/tabs/delete-tab');
  console.log('');
  console.log('✅ Pronto para receber requisições!');
});
