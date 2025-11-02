# 🎯 Comandos Personalizados - Configuração Completa

## ✅ O Que Foi Configurado

### 1. **Scripts npm Personalizados** (`package.json`)

Agora você tem os seguintes comandos disponíveis na raiz do projeto:

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia TODO o projeto (DB + Backend + Frontend) |
| `npm run dev` | Igual ao `npm start` |
| `npm stop` | Para todos os serviços |
| `npm run db:start` | Inicia apenas o PostgreSQL |
| `npm run db:stop` | Para o PostgreSQL |
| `npm run backend` | Inicia apenas o backend |
| `npm run frontend` | Inicia apenas o frontend |
| `npm test` | Roda todos os testes |
| `npm run clean` | Para tudo e limpa o banco de dados |

### 2. **Scripts Shell Melhorados**

- ✅ `start-clean.sh` - Script robusto que inicia tudo
- ✅ `stop-project.sh` - Para todos os processos (melhorado)

### 3. **Documentação Criada**

- 📄 `INICIO_RAPIDO.md` - Guia rápido visual
- 📄 `COMANDOS_RAPIDOS.md` - Referência completa de comandos
- 📄 `QUICK_START.txt` - Resumo ultra-rápido (texto simples)
- 📄 `README.md` - Atualizado com seção de início rápido

---

## 🚀 Como Usar

### Uso Básico (Recomendado)

```bash
# Na raiz do projeto
npm start
```

Aguarde até ver:
```
🎉 Projeto iniciado com sucesso!
📊 Backend: http://localhost:3000/api
🌐 Frontend: http://localhost:5175
```

### Para Parar

```bash
npm stop
```

### Desenvolvimento do Dia a Dia

```bash
# Manhã
npm start

# Trabalhe normalmente...
# (hot-reload ativo em backend e frontend)

# Noite
npm stop
```

---

## 🔧 O Que Acontece ao Rodar `npm start`

1. 🧹 Para todos os processos anteriores
2. 🔌 Libera as portas 3000, 5174 e 5175
3. 🐘 Inicia o PostgreSQL via Docker
4. 📦 Verifica/instala dependências do backend
5. 🚀 Inicia o backend (NestJS)
6. ✅ Verifica se o backend está respondendo
7. 📦 Verifica/instala dependências do frontend
8. 🌐 Inicia o frontend (Vite)
9. 🎉 Exibe URLs de acesso

---

## 💡 Vantagens

### Antes
```bash
# Terminal 1
docker-compose up -d db

# Terminal 2
cd backend
npm install
npm run start:dev

# Terminal 3
cd frontend
npm install
npm run dev
```

### Agora
```bash
npm start
```

---

## 🆘 Solução de Problemas

### Erro: "Port already in use"
```bash
npm stop
npm start
```

### Erro: "Cannot connect to database"
```bash
docker-compose down -v
npm start
```

### Erro: "Module not found"
```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
npm start
```

### Backend não inicia
```bash
cd backend
rm -rf node_modules dist
npm install
cd ..
npm start
```

### Limpar tudo e começar do zero
```bash
npm run clean
rm -rf backend/node_modules frontend/node_modules
npm start
```

---

## 🎓 Comandos Avançados

### Iniciar apenas banco e backend
```bash
npm run db:start
npm run backend
```

### Reiniciar apenas o frontend
```bash
# Ctrl+C no processo do frontend
npm run frontend
```

### Ver logs do PostgreSQL
```bash
docker-compose logs -f db
```

### Acessar PostgreSQL via linha de comando
```bash
docker-compose exec db psql -U pdv -d pdv_dev
```

---

## 📊 Estrutura de Processos

Quando você roda `npm start`:

```
npm start (script pai)
  ├── docker-compose up -d db (PostgreSQL)
  ├── npm run start:dev (backend - processo filho)
  └── npm run dev (frontend - processo filho)
```

Quando você roda `npm stop`:
- Mata todos os processos Node/Nest/Vite
- Libera as portas 3000, 5174, 5175
- **Não para o PostgreSQL** (para manter os dados)

Para parar o PostgreSQL também:
```bash
npm run db:stop
# ou
docker-compose down
```

---

## 🔮 Melhorias Futuras Possíveis

1. **Usar `concurrently`** para logs mais organizados
2. **Adicionar `tmux`** para painéis separados
3. **Script de setup inicial** com verificação de dependências
4. **Healthchecks** automáticos
5. **Logs coloridos** por serviço

---

## 📝 Arquivos de Referência

- `package.json` - Scripts npm configurados
- `start-clean.sh` - Script principal de inicialização
- `stop-project.sh` - Script de parada
- `docker-compose.yml` - Configuração do PostgreSQL

---

## ✅ Checklist de Primeira Execução

- [ ] Docker está instalado e rodando
- [ ] Node.js 20+ está instalado
- [ ] npm está instalado
- [ ] Você está na pasta raiz do projeto (`/Users/eduardoklug/Documents/bartab`)
- [ ] Execute: `npm start`
- [ ] Aguarde a mensagem de sucesso
- [ ] Acesse: http://localhost:5175
- [ ] Verifique se a API responde: http://localhost:3000/api

---

## 🎉 Resumo

**Um comando para rodar tudo:**
```bash
npm start
```

**Um comando para parar tudo:**
```bash
npm stop
```

**Simples assim!** 🚀

---

**Precisa de ajuda?** Veja os outros arquivos de documentação:
- `INICIO_RAPIDO.md` - Guia visual
- `COMANDOS_RAPIDOS.md` - Referência completa
- `README.md` - Documentação do projeto

