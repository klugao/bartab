# ⚡ Início Rápido - BarTab

## 🎯 Um Comando Para Rodar Tudo

```bash
npm start
```

**É só isso!** ✨

Este comando faz TUDO automaticamente:
- 🐘 Inicia o PostgreSQL
- 🚀 Inicia o Backend
- 🌐 Inicia o Frontend
- ✅ Verifica se tudo está funcionando

---

## 🛑 Para Parar Tudo

```bash
npm stop
```

ou pressione `Ctrl+C` no terminal e depois:

```bash
npm stop
```

---

## 📋 Comandos Mais Usados

| Comando | O que faz |
|---------|-----------|
| `npm start` | Inicia TUDO (DB + Backend + Frontend) |
| `npm stop` | Para TUDO |
| `npm run clean` | Para tudo e limpa o banco de dados |
| `npm test` | Roda os testes |

---

## 🌐 Onde Acessar

Depois de rodar `npm start`, acesse:

- **Frontend**: http://localhost:5175
- **API Backend**: http://localhost:3000/api
- **Gerenciador BD (Adminer)**: http://localhost:8080

---

## 🆘 Problemas?

### Erro de porta ocupada?
```bash
npm stop
npm start
```

### Banco de dados corrompido?
```bash
npm run clean
npm start
```

### Dependências desatualizadas?
```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
npm start
```

---

## 💡 Dicas Importantes

1. **Primeira vez?** Execute `npm start` e aguarde até ver a mensagem "Projeto iniciado com sucesso!"

2. **Desenvolvendo?** Os arquivos têm hot-reload. Suas mudanças aparecem automaticamente!

3. **Terminando?** Use `npm stop` para não deixar processos rodando

4. **Logs?** Todos os logs aparecem no terminal onde você rodou `npm start`

---

## 🎓 Para Saber Mais

Veja o arquivo [COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md) para comandos avançados e detalhes técnicos.

---

**Pronto para começar? Digite:**

```bash
npm start
```

🎉 **É só isso! Aproveite o desenvolvimento!**

