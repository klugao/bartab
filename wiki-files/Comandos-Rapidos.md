# 🚀 Comandos Rápidos - BarTab

## Comandos Principais

### Iniciar TODO o projeto (recomendado)
```bash
npm start
# ou
npm run dev
```
Este comando vai:
- ✅ Parar todos os processos anteriores
- ✅ Iniciar PostgreSQL (Docker)
- ✅ Iniciar Backend (NestJS na porta 3000)
- ✅ Iniciar Frontend (Vite na porta 5175)
- ✅ Verificar se tudo está funcionando

### Parar TODO o projeto
```bash
npm stop
```

### Limpar tudo (incluindo banco de dados)
```bash
npm run clean
```
⚠️ **Atenção**: Este comando apaga TODOS os dados do banco de dados!

---

## Comandos Individuais

### Banco de Dados
```bash
# Iniciar apenas o PostgreSQL
npm run db:start

# Parar PostgreSQL
npm run db:stop
```

### Backend
```bash
# Iniciar apenas o backend
npm run backend
```
O backend rodará em: http://localhost:3000/api

### Frontend
```bash
# Iniciar apenas o frontend
npm run frontend
```
O frontend rodará em: http://localhost:5175

### Testes
```bash
# Rodar todos os testes
npm test
```

---

## URLs Importantes

- 🌐 **Frontend**: http://localhost:5175
- 📊 **Backend API**: http://localhost:3000/api
- 🐘 **PostgreSQL**: localhost:5432
- 🔧 **Adminer** (Gerenciador de BD): http://localhost:8080

### Credenciais do Banco (Adminer)
- **Sistema**: PostgreSQL
- **Servidor**: db
- **Usuário**: pdv
- **Senha**: pdv
- **Base de dados**: pdv_dev

---

## Solução de Problemas

### Porta já em uso?
```bash
# Parar tudo e limpar portas
npm stop
```

### Banco de dados com problemas?
```bash
# Reiniciar banco do zero
docker-compose down -v
docker-compose up -d db
```

### Backend não inicia?
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run start:dev
```

### Frontend não inicia?
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Fluxo de Desenvolvimento

1. **Primeira vez rodando o projeto:**
   ```bash
   npm start
   ```

2. **Desenvolvendo:**
   - O backend e frontend já estão com hot-reload ativo
   - Suas mudanças aparecerão automaticamente

3. **Terminando o dia:**
   ```bash
   npm stop
   ```

4. **Próxima sessão:**
   ```bash
   npm start
   ```

---

## Dicas

- 💡 Use `npm start` para iniciar tudo de uma vez
- 💡 Os logs aparecem no terminal onde você rodou o comando
- 💡 Para parar, use `Ctrl+C` ou abra outro terminal e rode `npm stop`
- 💡 O comando `npm start` sempre limpa processos antigos antes de iniciar

---

## Estrutura do Projeto

```
bartab/
├── backend/          # NestJS API (porta 3000)
├── frontend/         # React + Vite (porta 5175)
├── docker-compose.yml  # PostgreSQL
└── package.json      # Scripts principais 👈 VOCÊ ESTÁ AQUI
```

