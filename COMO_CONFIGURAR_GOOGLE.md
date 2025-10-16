# 🔐 Como Configurar Google OAuth - Passo a Passo

## ⚠️ IMPORTANTE
Você precisa fazer isso ANTES de tentar fazer login no sistema!

## 📋 Etapas

### 1. Acessar Google Cloud Console
- Abra: https://console.cloud.google.com/
- Faça login com sua conta Google

### 2. Criar um Projeto
1. Clique no seletor de projeto no topo (ao lado de "Google Cloud")
2. Clique em "NOVO PROJETO"
3. Nome do projeto: `BarTab`
4. Clique em "CRIAR"

### 3. Configurar Tela de Consentimento OAuth
1. No menu lateral (☰), vá em: **APIs e serviços > Tela de consentimento OAuth**
2. Selecione **Externo** (ou Interno se você tem uma organização Google Workspace)
3. Clique em **CRIAR**
4. Preencha os campos obrigatórios:
   - **Nome do aplicativo**: BarTab
   - **E-mail de suporte do usuário**: seu@email.com
   - **Logotipo do aplicativo**: (opcional)
   - **Domínio do aplicativo**: (deixe em branco por enquanto)
   - **E-mail de contato do desenvolvedor**: seu@email.com
5. Clique em **SALVAR E CONTINUAR**
6. Na tela "Escopos", clique em **ADICIONAR OU REMOVER ESCOPOS**
7. Marque os seguintes escopos:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
8. Clique em **ATUALIZAR** e depois **SALVAR E CONTINUAR**
9. Em "Usuários de teste", clique em **+ ADD USERS**
10. Adicione seu email e o de pessoas que vão testar
11. Clique em **SALVAR E CONTINUAR**
12. Revise e clique em **VOLTAR AO PAINEL**

### 4. Criar Credenciais OAuth 2.0
1. No menu lateral, vá em: **APIs e serviços > Credenciais**
2. Clique em **+ CRIAR CREDENCIAIS** (no topo)
3. Selecione **ID do cliente OAuth 2.0**
4. Tipo de aplicativo: **Aplicativo da Web**
5. Nome: `BarTab Web Client`
6. **Origens JavaScript autorizadas**:
   - Clique em **+ ADICIONAR URI**
   - Digite: `http://localhost:3000`
   - Clique em **+ ADICIONAR URI** novamente
   - Digite: `http://localhost:5173`
7. **URIs de redirecionamento autorizados**:
   - Clique em **+ ADICIONAR URI**
   - Digite EXATAMENTE: `http://localhost:3000/api/auth/google/callback`
   - ⚠️ ATENÇÃO: Certifique-se de incluir `/api/auth/google/callback`
8. Clique em **CRIAR**
9. Uma janela aparecerá mostrando:
   - **ID do cliente**: algo como `123456789-abc...apps.googleusercontent.com`
   - **Chave secreta do cliente**: algo como `GOCSPX-...`
10. 📋 **COPIE ESTES VALORES** (você vai precisar deles agora!)

### 5. Configurar o Backend

#### Abra o terminal e execute:
```bash
cd /Users/eduardoklug/Documents/bartab/backend
```

#### Edite o arquivo .env:
```bash
nano .env
```

ou abra com seu editor preferido.

#### Substitua estas linhas:
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Por suas credenciais reais:
```env
GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-sua-chave-aqui
```

⚠️ **ATENÇÃO**: Cole os valores EXATAMENTE como você copiou do Google Cloud Console!

### 6. Reiniciar o Backend

No terminal, execute:
```bash
# Parar o backend
pkill -f "nest start"

# Aguardar 2 segundos
sleep 2

# Iniciar novamente
npm run start:dev
```

### 7. Testar o Login

1. Abra o navegador em: http://localhost:5173
2. Você será redirecionado para a página de login
3. Clique em **"Entrar com Google"**
4. Faça login com sua conta Google
5. Autorize o aplicativo BarTab
6. Se for seu primeiro acesso, você será solicitado a informar o nome do seu estabelecimento
7. Pronto! Você está autenticado! 🎉

## 🆘 Problemas Comuns

### "redirect_uri_mismatch"
- Verifique se você digitou EXATAMENTE: `http://localhost:3000/api/auth/google/callback`
- Deve ter `/api/` antes de `/auth`
- Não pode ter espaços ou caracteres extras

### "Error 400: invalid_request"
- Verifique se o GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET estão corretos no arquivo .env
- Certifique-se de reiniciar o backend após editar o .env

### "This app hasn't been verified"
- É normal em desenvolvimento!
- Clique em "Advanced" (ou "Avançado")
- Clique em "Go to BarTab (unsafe)" (ou "Ir para BarTab (não seguro)")
- Isso acontece porque o app está em modo de teste

### Backend não está rodando
- Verifique se o Docker está rodando: `docker ps`
- Verifique os logs: `tail -100 /Users/eduardoklug/Documents/bartab/backend/backend.log`

## 📚 Documentação Completa

Para mais detalhes, veja o arquivo `AUTENTICACAO.md` na raiz do projeto.

## ✅ Checklist

- [ ] Criei o projeto no Google Cloud Console
- [ ] Configurei a tela de consentimento OAuth
- [ ] Criei as credenciais OAuth 2.0
- [ ] Copiei o Client ID e Client Secret
- [ ] Editei o arquivo .env com as credenciais
- [ ] Reiniciei o backend
- [ ] Testei o login e funcionou! 🎉

