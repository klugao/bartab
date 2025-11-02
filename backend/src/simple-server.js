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
  res.json({ message: 'BarTab API funcionando!' });
});

app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const newCustomer = {
    id: String(customers.length + 1),
    ...req.body,
    balance_due: '0'
  };
  customers.push(newCustomer);
  res.json(newCustomer);
});

app.get('/api/items', (req, res) => {
  res.json(items);
});

app.get('/api/items/active', (req, res) => {
  res.json(items.filter(item => item.active));
});

app.post('/api/items', (req, res) => {
  const newItem = {
    id: String(items.length + 1),
    ...req.body,
    active: true
  };
  items.push(newItem);
  res.json(newItem);
});

app.get('/api/tabs', (req, res) => {
  res.json(tabs.filter(tab => tab.status === 'OPEN'));
});

app.post('/api/tabs', (req, res) => {
  const newTab = {
    id: String(tabs.length + 1),
    ...req.body,
    status: 'OPEN',
    total: '0.00',
    items: [],
    payments: [],
    created_at: new Date().toISOString()
  };
  tabs.push(newTab);
  res.json(newTab);
});

app.listen(PORT, () => {
  console.log(`🚀 Backend temporário rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🔧 Este é um servidor temporário para resolver os problemas`);
});
