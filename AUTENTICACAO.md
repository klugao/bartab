# Configuração de Autenticação Google OAuth

Este documento explica como configurar a autenticação do Google OAuth no sistema BarTab.

## Configuração do Google Cloud Console

### 1. Criar um Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Selecionar um projeto" no topo da página
3. Clique em "Novo projeto"
4. Dê um nome ao projeto (ex: "BarTab") e clique em "Criar"

### 2. Habilitar a API do Google OAuth

1. No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
2. Busque por "Google+ API" e habilite
3. Busque por "Google Identity Services" e habilite

### 3. Configurar a Tela de Consentimento OAuth

1. No menu lateral, vá em "APIs e Serviços" > "Tela de consentimento OAuth"
2. Selecione "Externo" (ou "Interno" se for uma organização)
3. Preencha as informações obrigatórias:
   - Nome do aplicativo: BarTab
   - E-mail de suporte do usuário: seu email
   - E-mail de contato do desenvolvedor: seu email
4. Clique em "Salvar e continuar"
5. Na tela de Escopos, adicione:
   - `userinfo.email`
   - `userinfo.profile`
6. Clique em "Salvar e continuar"
7. Revise as configurações e clique em "Voltar ao painel"

### 4. Criar Credenciais OAuth 2.0

1. No menu lateral, vá em "APIs e Serviços" > "Credenciais"
2. Clique em "Criar credenciais" > "ID do cliente OAuth 2.0"
3. Selecione "Aplicativo da Web"
4. Configure:
   - Nome: BarTab Web Client
   - Origens JavaScript autorizadas:
     - `http://localhost:5173`
     - `http://localhost:3000`
   - URIs de redirecionamento autorizados:
     - `http://localhost:3000/api/auth/google/callback`
5. Clique em "Criar"
6. Copie o **ID do cliente** e o **Segredo do cliente**

## Configuração do Backend

### 1. Criar arquivo .env

No diretório `backend/`, crie um arquivo `.env` com as seguintes variáveis:

```env
DATABASE_URL=postgresql://pdv:pdv@localhost:5432/pdv_dev

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-aqui-mude-em-producao

# Google OAuth
GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:5173
```

⚠️ **IMPORTANTE**: Substitua os valores de exemplo pelos valores reais que você obteve no Google Cloud Console.

### 2. Gerar uma Chave Secreta JWT

Para gerar uma chave secreta segura, você pode usar:

```bash
# No terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use o resultado como valor para `JWT_SECRET`.

## Como Funciona a Autenticação

### Fluxo de Autenticação

1. **Login**: Usuário clica em "Entrar com Google"
2. **Redirecionamento**: Sistema redireciona para o Google OAuth
3. **Autorização**: Usuário autoriza o aplicativo
4. **Callback**: Google redireciona de volta para a aplicação
5. **Verificação**: Sistema verifica se o usuário já existe
   - Se SIM: Faz login automaticamente
   - Se NÃO: Redireciona para página de registro
6. **Registro**: Usuário informa o nome do estabelecimento
7. **Token JWT**: Sistema gera um token JWT e armazena no localStorage
8. **Acesso**: Usuário acessa o sistema com o token

### Estrutura de Dados

#### Estabelecimento (Establishment)
- id: UUID
- name: string (nome do estabelecimento)
- email: string (opcional)
- phone: string (opcional)
- address: string (opcional)
- active: boolean

#### Usuário (User)
- id: UUID
- email: string
- name: string
- picture: string (foto do Google)
- googleId: string (ID único do Google)
- establishment_id: UUID (referência ao estabelecimento)
- active: boolean

### Isolamento de Dados

Todas as entidades principais do sistema foram modificadas para incluir o campo `establishment_id`:

- **Customers** (Clientes)
- **Items** (Produtos)
- **Tabs** (Contas)
- **Expenses** (Despesas)

Isso garante que cada estabelecimento veja apenas seus próprios dados.

## Testando a Autenticação

### 1. Iniciar o Backend

```bash
cd backend
npm install
npm run start:dev
```

### 2. Iniciar o Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Acessar o Sistema

1. Abra o navegador em `http://localhost:5173`
2. Você será redirecionado para a página de login
3. Clique em "Entrar com Google"
4. Autorize o aplicativo
5. Se for o primeiro acesso, informe o nome do estabelecimento
6. Você será redirecionado para a página inicial

## Segurança

### Recomendações para Produção

1. **JWT_SECRET**: Use uma chave longa e aleatória
2. **HTTPS**: Use HTTPS em produção
3. **CORS**: Configure CORS adequadamente para o domínio de produção
4. **Google OAuth**: 
   - Atualize as origens autorizadas para o domínio de produção
   - Atualize os URIs de redirecionamento para o domínio de produção
5. **Variáveis de Ambiente**: Nunca commite o arquivo `.env` no Git

### Proteção de Rotas

Todas as rotas da API estão protegidas com `JwtAuthGuard`, exceto:
- `/api/auth/google` - Iniciar autenticação
- `/api/auth/google/callback` - Callback do Google
- `/api/auth/register` - Registro de novo estabelecimento

No frontend, todas as rotas exceto `/login`, `/register` e `/auth/callback` requerem autenticação.

## Troubleshooting

### Erro: "redirect_uri_mismatch"

- Verifique se o URI de redirecionamento no código corresponde exatamente ao configurado no Google Cloud Console
- O URI deve incluir o protocolo (http/https), domínio e porta

### Erro: "Invalid token"

- Verifique se o `JWT_SECRET` é o mesmo no backend
- Verifique se o token não expirou (validade: 7 dias)
- Tente fazer logout e login novamente

### Usuário não consegue acessar dados

- Verifique se o `establishment_id` está correto nas tabelas do banco
- Verifique se o token JWT contém o `establishmentId`

## Suporte

Para mais informações sobre Google OAuth:
- [Documentação oficial do Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Guia de implementação](https://developers.google.com/identity/protocols/oauth2/web-server)

