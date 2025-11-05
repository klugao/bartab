# 🔒 Política de Privacidade - BarTab

**Última atualização:** 05 de novembro de 2025

## 1. Introdução

O **BarTab** ("nós", "nosso" ou "Sistema") respeita a privacidade dos seus usuários e está comprometido com a proteção dos seus dados pessoais. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações, em conformidade com a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)**.

## 2. Controlador de Dados

**Razão Social:** [INSERIR NOME DA EMPRESA/DESENVOLVEDOR]  
**CNPJ/CPF:** [INSERIR]  
**Endereço:** [INSERIR ENDEREÇO COMPLETO]  
**E-mail para contato:** eduardo.klug7@gmail.com  
**Encarregado de Dados (DPO):** [INSERIR NOME E CONTATO]

## 3. Dados Coletados

### 3.1 Dados Fornecidos Diretamente por Você

Coletamos as seguintes informações quando você se cadastra ou utiliza o sistema:

#### Para Usuários do Sistema (Atendentes/Gerentes):
- **Nome completo**
- **E-mail** (via Google OAuth)
- **Foto de perfil** (via Google)
- **Google ID** (identificador único)
- **Nome do estabelecimento**

#### Para Clientes Cadastrados no PDV:
- **Nome completo**
- **Telefone** (opcional)
- **Saldo devedor**
- **Histórico de compras e pagamentos**

### 3.2 Dados Coletados Automaticamente

- **Data e hora de acesso**
- **Endereço IP**
- **Informações de navegador e dispositivo**
- **Logs de atividade no sistema**

### 3.3 Dados que NÃO Coletamos

❌ Não coletamos senhas (autenticação via Google OAuth)  
❌ Não coletamos dados de cartão de crédito (pagamentos processados externamente)  
❌ Não coletamos dados sensíveis (origem racial, opiniões políticas, dados de saúde, etc.)

## 4. Finalidade do Tratamento de Dados

Utilizamos seus dados pessoais para:

| Finalidade | Base Legal (LGPD) | Dados Utilizados |
|------------|-------------------|------------------|
| Autenticação e acesso ao sistema | Execução de contrato (Art. 7º, V) | Nome, e-mail, Google ID |
| Gestão de estabelecimentos | Execução de contrato (Art. 7º, V) | Nome do estabelecimento, dados do usuário |
| Registro de vendas e pagamentos | Execução de contrato (Art. 7º, V) | Nome do cliente, histórico de compras |
| Controle de contas fiadas | Legítimo interesse (Art. 7º, IX) | Nome, telefone, saldo devedor |
| Comunicações sobre o sistema | Consentimento (Art. 7º, I) | E-mail, nome |
| Segurança e prevenção de fraudes | Legítimo interesse (Art. 7º, IX) | Logs, IP, data/hora |
| Cumprimento de obrigações legais | Obrigação legal (Art. 7º, II) | Dados fiscais, registros de transações |

## 5. Compartilhamento de Dados

### 5.1 Com Quem Compartilhamos

Seus dados podem ser compartilhados com:

1. **Google LLC** - Para autenticação via Google OAuth
   - Dados: E-mail, nome, foto de perfil, Google ID
   - Localização: Estados Unidos
   - Política de Privacidade: https://policies.google.com/privacy

2. **Render/Railway** - Hospedagem do backend
   - Dados: Todos os dados armazenados no banco de dados
   - Localização: Estados Unidos/Europa
   - Política de Privacidade: [Inserir link do provedor]

3. **Supabase/PostgreSQL** - Banco de dados
   - Dados: Todos os dados estruturados do sistema
   - Localização: [Verificar localização dos servidores]

4. **Autoridades Públicas** - Quando exigido por lei ou ordem judicial

### 5.2 Transferência Internacional de Dados

⚠️ Seus dados podem ser transferidos e armazenados em servidores localizados fora do Brasil, especialmente nos Estados Unidos. Estas transferências são realizadas com base em:
- Cláusulas contratuais padrão
- Garantias de segurança adequadas
- Conformidade com as leis locais de proteção de dados

## 6. Armazenamento e Segurança

### 6.1 Medidas de Segurança

Implementamos as seguintes medidas técnicas e organizacionais:

✅ **Criptografia em trânsito** (HTTPS/TLS)  
✅ **Autenticação segura** (OAuth 2.0 + JWT)  
✅ **Controle de acesso** (RBAC - Role-Based Access Control)  
✅ **Isolamento de dados** por estabelecimento  
✅ **Validação e sanitização** de inputs  
✅ **Proteção contra SQL Injection**  
✅ **Configuração de CORS** restrita  
✅ **Backups regulares**

### 6.2 Prazo de Armazenamento

| Tipo de Dado | Prazo de Retenção | Justificativa |
|--------------|-------------------|---------------|
| Dados de usuários ativos | Enquanto a conta estiver ativa | Execução do contrato |
| Dados de clientes (PDV) | Enquanto houver relacionamento comercial | Legítimo interesse |
| Histórico de vendas | 5 anos | Obrigação legal (fiscalização) |
| Logs de acesso | 6 meses | Segurança e prevenção de fraudes |
| Dados de contas excluídas | 30 dias (backup) | Reversão de exclusões acidentais |

Após os prazos acima, os dados serão **anonimizados** ou **excluídos definitivamente**.

## 7. Seus Direitos (LGPD - Art. 18)

Como titular dos dados, você tem os seguintes direitos:

### 7.1 Direitos Garantidos

| Direito | Como Exercer |
|---------|--------------|
| ✅ **Confirmação e Acesso** - Saber se tratamos seus dados e acessá-los | [Contatar eduardo.klug7@gmail.com] |
| ✅ **Correção** - Corrigir dados incompletos ou desatualizados | [Editar perfil no sistema] |
| ✅ **Anonimização/Bloqueio** - Solicitar anonimização de dados desnecessários | [Contatar eduardo.klug7@gmail.com] |
| ✅ **Exclusão** - Solicitar exclusão de dados não obrigatórios | [Contatar eduardo.klug7@gmail.com] |
| ✅ **Portabilidade** - Receber seus dados em formato estruturado | [Contatar eduardo.klug7@gmail.com] |
| ✅ **Revogação de Consentimento** - Retirar consentimento dado anteriormente | [Contatar eduardo.klug7@gmail.com] |
| ✅ **Oposição** - Se opor a tratamentos baseados em legítimo interesse | [Contatar eduardo.klug7@gmail.com] |
| ✅ **Informação sobre Compartilhamento** - Saber com quem compartilhamos | Esta política |

### 7.2 Como Exercer Seus Direitos

Para exercer qualquer um desses direitos, entre em contato conosco através de:

📧 **E-mail:** eduardo.klug7@gmail.com  
📝 **Assunto:** "LGPD - Solicitação de [tipo de direito]"  
⏱️ **Prazo de resposta:** Até 15 dias úteis

### 7.3 Exclusão de Conta

Para excluir sua conta e todos os dados associados:

1. Acesse o sistema
2. Vá em **Configurações** > **Minha Conta**
3. Clique em **"Excluir Conta"**
4. Confirme a exclusão

⚠️ **ATENÇÃO:** A exclusão é irreversível e removerá:
- Sua conta de usuário
- Histórico de atividades
- Dados do estabelecimento (se você for o proprietário)

⚠️ Dados relacionados a obrigações legais (ex: registros fiscais) serão mantidos pelo prazo legal.

## 8. Cookies e Tecnologias Similares

### 8.1 Uso de Cookies

O sistema utiliza as seguintes tecnologias:

| Tipo | Finalidade | Duração |
|------|------------|---------|
| **Token JWT** | Manter sessão do usuário autenticado | 7 dias |
| **localStorage** | Armazenar preferências e dados offline | Permanente (até limpeza) |
| **Cookies do Google** | Autenticação via OAuth | Conforme política do Google |

### 8.2 Gerenciamento de Cookies

Você pode limpar cookies e dados armazenados através das configurações do seu navegador.

## 9. Menores de Idade

O BarTab **não é destinado a menores de 18 anos**. Não coletamos intencionalmente dados de menores. Se tomarmos conhecimento de coleta acidental, os dados serão excluídos imediatamente.

## 10. Alterações nesta Política

Podemos atualizar esta Política de Privacidade periodicamente. Alterações significativas serão notificadas por:
- E-mail cadastrado
- Aviso no sistema
- Atualização da data no topo deste documento

Recomendamos revisar esta política regularmente.

## 11. Incidentes de Segurança

Em caso de incidente de segurança que possa gerar risco aos seus dados:
- Você será **notificado em até 72 horas**
- A ANPD (Autoridade Nacional de Proteção de Dados) será comunicada conforme exigido por lei
- Medidas corretivas serão tomadas imediatamente

## 12. Legislação e Foro

Esta Política é regida pelas leis brasileiras, especialmente:
- Lei nº 13.709/2018 (LGPD)
- Lei nº 12.965/2014 (Marco Civil da Internet)
- Código de Defesa do Consumidor (Lei nº 8.078/1990)

Fica eleito o foro da comarca de [INSERIR CIDADE], com exclusão de qualquer outro, por mais privilegiado que seja.

## 13. Contato

Para dúvidas, solicitações ou reclamações sobre privacidade:

📧 **E-mail do DPO:** eduardo.klug7@gmail.com  
📧 **E-mail geral:** eduardo.klug7@gmail.com  
📞 **Telefone:** [INSERIR TELEFONE]  
📍 **Endereço:** [INSERIR ENDEREÇO COMPLETO]

**ANPD (Autoridade Nacional de Proteção de Dados):**  
https://www.gov.br/anpd/pt-br

---

**Ao utilizar o BarTab, você concorda com esta Política de Privacidade.**

Se você não concordar com qualquer parte desta política, por favor, não utilize o sistema.

---

✅ **Documento elaborado em conformidade com a LGPD (Lei 13.709/2018)**

