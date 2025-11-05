# 📋 Registro de Atividades de Tratamento de Dados Pessoais
## Conforme Art. 37 da LGPD (Lei 13.709/2018)

**Controlador:** BarTab - Sistema de PDV  
**Responsável:** Eduardo Klug  
**E-mail de contato:** eduardo.klug7@gmail.com  
**Última atualização:** 05 de novembro de 2025  

---

## 1. IDENTIFICAÇÃO DO CONTROLADOR

| Campo | Informação |
|-------|------------|
| **Nome/Razão Social** | [INSERIR NOME DA EMPRESA OU DESENVOLVEDOR] |
| **CNPJ/CPF** | [INSERIR] |
| **Endereço** | [INSERIR ENDEREÇO COMPLETO] |
| **Telefone** | [INSERIR TELEFONE] |
| **E-mail** | eduardo.klug7@gmail.com |
| **Encarregado (DPO)** | [INSERIR NOME] (eduardo.klug7@gmail.com) |

---

## 2. ATIVIDADES DE TRATAMENTO

### 2.1 AUTENTICAÇÃO E CONTROLE DE ACESSO

#### Dados Coletados:
- **Categorias:**
  - Nome completo
  - E-mail
  - Foto de perfil
  - Google ID (identificador único)
  
- **Fonte:** Google OAuth (fornecidos pelo próprio titular via autenticação Google)

#### Finalidade:
- Autenticação do usuário no sistema
- Controle de acesso às funcionalidades
- Identificação do usuário nas sessões

#### Base Legal:
- **Art. 7º, V da LGPD:** Execução de contrato

#### Tratamento Realizado:
- Coleta via API Google OAuth
- Armazenamento no banco de dados PostgreSQL (criptografado em trânsito via TLS)
- Geração de token JWT para sessões
- Validação em cada requisição à API

#### Compartilhamento:
- **Google LLC:** Para autenticação OAuth
- **Provedor de hospedagem:** Render/Railway (armazenamento em nuvem)

#### Prazo de Retenção:
- **Durante conta ativa:** Mantido enquanto usuário tiver conta ativa
- **Após exclusão:** 30 dias em backup, depois excluído permanentemente

#### Medidas de Segurança:
- ✅ Criptografia TLS/HTTPS em todas as transmissões
- ✅ Tokens JWT com expiração de 7 dias
- ✅ Autenticação via OAuth (sem armazenamento de senhas)
- ✅ Guards de autorização em todas as rotas
- ✅ Isolamento por estabelecimento (multi-tenancy)

---

### 2.2 GESTÃO DE ESTABELECIMENTOS

#### Dados Coletados:
- **Categorias:**
  - Nome do estabelecimento
  - E-mail de contato
  - Telefone (opcional)
  - Endereço (opcional)
  - Status de aprovação
  
- **Fonte:** Fornecidos pelo proprietário no cadastro

#### Finalidade:
- Identificação do estabelecimento comercial
- Comunicação com o proprietário
- Controle de aprovação de novos estabelecimentos

#### Base Legal:
- **Art. 7º, V da LGPD:** Execução de contrato

#### Tratamento Realizado:
- Coleta via formulário de registro
- Armazenamento no banco de dados
- Utilização para envio de notificações
- Exibição para o usuário no perfil

#### Compartilhamento:
- **Provedor de hospedagem:** Render/Railway
- **Não compartilhado** com terceiros comerciais

#### Prazo de Retenção:
- **Durante conta ativa:** Mantido
- **Após exclusão:** Anonimizado e mantido por 5 anos (obrigação fiscal)

#### Medidas de Segurança:
- ✅ Criptografia em trânsito (TLS)
- ✅ Validação de inputs (class-validator)
- ✅ Controle de acesso por usuário
- ✅ Backups regulares

---

### 2.3 CADASTRO DE CLIENTES DO PDV

#### Dados Coletados:
- **Categorias:**
  - Nome completo do cliente
  - Telefone (opcional)
  - Saldo devedor
  - Data de início do saldo negativo
  
- **Fonte:** Cadastrados manualmente pelo atendente/gerente

#### Finalidade:
- Identificação do cliente nas vendas
- Controle de contas fiadas ("pagar depois")
- Gestão de cobranças de débitos
- Histórico de consumo

#### Base Legal:
- **Art. 7º, IX da LGPD:** Legítimo interesse para controle financeiro e comercial

#### Tratamento Realizado:
- Cadastro via interface do sistema
- Armazenamento no banco de dados
- Cálculo automático de saldo devedor
- Vinculação a contas/vendas
- Atualização de saldo em pagamentos

#### Compartilhamento:
- **Provedor de hospedagem:** Render/Railway
- **Não compartilhado** com terceiros comerciais
- **Não vendido** ou cedido para marketing

#### Prazo de Retenção:
- **Durante relacionamento ativo:** Mantido
- **Após exclusão do estabelecimento:** Anonimizado e mantido por 5 anos (obrigação fiscal)
- **Cliente sem movimento há 5 anos:** Pode ser excluído (se não houver débitos)

#### Medidas de Segurança:
- ✅ Criptografia em trânsito (TLS)
- ✅ Acesso restrito apenas ao estabelecimento proprietário
- ✅ Validação de inputs
- ✅ Logs de auditoria de alterações
- ✅ Isolamento por estabelecimento (um estabelecimento não vê clientes de outro)

---

### 2.4 REGISTRO DE VENDAS E PAGAMENTOS

#### Dados Coletados:
- **Categorias:**
  - Identificador da venda (UUID)
  - Nome da conta/mesa
  - Itens consumidos (produtos e quantidades)
  - Valores (subtotal, total)
  - Método de pagamento (dinheiro, débito, crédito, PIX, pagar depois)
  - Data e hora da transação
  - Vinculação ao cliente (opcional)
  
- **Fonte:** Registrados pelo atendente durante operação do PDV

#### Finalidade:
- Controle financeiro e fiscal
- Gestão de vendas e estoque
- Histórico de consumo
- Emissão de relatórios gerenciais
- Cumprimento de obrigações fiscais e tributárias

#### Base Legal:
- **Art. 7º, II da LGPD:** Cumprimento de obrigação legal (legislação fiscal e tributária)
- **Art. 7º, V da LGPD:** Execução de contrato (registro de vendas)

#### Tratamento Realizado:
- Registro via interface do PDV
- Armazenamento no banco de dados
- Cálculo automático de totais
- Geração de relatórios
- Exportação para fins fiscais

#### Compartilhamento:
- **Provedor de hospedagem:** Render/Railway
- **Autoridades fiscais:** Quando solicitado por lei (Receita Federal, etc.)

#### Prazo de Retenção:
- **Obrigatório:** 5 anos (Art. 195 do Código Tributário Nacional)
- **Após 5 anos:** Anonimizado ou excluído

#### Medidas de Segurança:
- ✅ Criptografia em trânsito (TLS)
- ✅ Controle de acesso restrito
- ✅ Logs de auditoria
- ✅ Backups regulares com criptografia
- ✅ Imutabilidade de registros fiscais

---

### 2.5 LOGS DE SISTEMA E AUDITORIA

#### Dados Coletados:
- **Categorias:**
  - Endereço IP
  - Data e hora de acesso
  - Ação realizada (tipo de operação)
  - Identificador do usuário (UUID, sem dados pessoais nos logs)
  - Mensagens de erro (sem dados sensíveis)
  
- **Fonte:** Coletados automaticamente pelo sistema

#### Finalidade:
- Segurança da informação
- Prevenção de fraudes
- Auditoria de ações
- Diagnóstico de erros técnicos
- Demonstração de conformidade com LGPD

#### Base Legal:
- **Art. 7º, IX da LGPD:** Legítimo interesse (segurança e prevenção de fraudes)
- **Art. 46 da LGPD:** Demonstração de conformidade

#### Tratamento Realizado:
- Coleta automática em cada operação
- Armazenamento em arquivos de log
- Análise para fins de segurança
- Monitoramento de acessos não autorizados

#### Compartilhamento:
- **Não compartilhado** (uso interno apenas)
- **Autoridades:** Apenas mediante ordem judicial

#### Prazo de Retenção:
- **Logs de acesso:** 6 meses
- **Logs de segurança:** 1 ano
- **Após prazo:** Excluídos automaticamente

#### Medidas de Segurança:
- ✅ Logs não contêm dados sensíveis (apenas IDs truncados)
- ✅ Acesso restrito a administradores
- ✅ Armazenamento segregado
- ✅ Exclusão automática após prazo

---

## 3. TRANSFERÊNCIA INTERNACIONAL DE DADOS

### Países/Regiões de Armazenamento:
- **Estados Unidos:** Servidores Render/Railway, Google OAuth
- **Europa (opcional):** Conforme escolha de região na hospedagem

### Garantias de Proteção:
- ✅ Contratos com cláusulas de proteção de dados
- ✅ Conformidade com GDPR (europeu) e LGPD (brasileiro)
- ✅ Criptografia em trânsito e em repouso
- ✅ Certificações ISO dos provedores

### Avaliação de Adequação:
- Provedores selecionados possuem certificações de segurança
- Contratos incluem cláusulas de proteção de dados
- Conformidade com legislação local e internacional

---

## 4. DIREITOS DOS TITULARES (Art. 18 da LGPD)

### Como Exercer os Direitos:

| Direito | Como Solicitar | Prazo de Resposta |
|---------|----------------|-------------------|
| **Confirmação de Tratamento** | eduardo.klug7@gmail.com | 15 dias úteis |
| **Acesso aos Dados** | Página "Privacidade" > "Exportar Meus Dados" | Imediato |
| **Correção** | Editar perfil ou contatar eduardo.klug7@gmail.com | 15 dias úteis |
| **Anonimização/Bloqueio** | eduardo.klug7@gmail.com | 30 dias úteis |
| **Exclusão** | Página "Privacidade" > "Excluir Minha Conta" | Imediato |
| **Portabilidade** | Página "Privacidade" > "Exportar Meus Dados" (JSON) | Imediato |
| **Revogação de Consentimento** | eduardo.klug7@gmail.com | 15 dias úteis |
| **Oposição** | eduardo.klug7@gmail.com | 30 dias úteis |

### Exceções aos Direitos:
- Dados fiscais não podem ser excluídos antes do prazo legal (5 anos)
- Dados necessários para cumprimento de obrigação legal serão mantidos
- Dados em disputa judicial não podem ser excluídos

---

## 5. MEDIDAS DE SEGURANÇA TÉCNICAS E ORGANIZACIONAIS

### Medidas Técnicas:
- ✅ **Criptografia TLS 1.3** em todas as comunicações
- ✅ **Autenticação OAuth 2.0** (sem armazenamento de senhas)
- ✅ **JWT com expiração** para sessões
- ✅ **Helmet.js** para headers de segurança HTTP
- ✅ **Validação de inputs** com class-validator
- ✅ **Proteção contra SQL Injection** (TypeORM parametrizado)
- ✅ **CORS configurado** com origens permitidas
- ✅ **Rate limiting** (proteção contra ataques de força bruta)
- ✅ **Controle de acesso baseado em roles** (RBAC)
- ✅ **Isolamento de dados** por estabelecimento (multi-tenancy)
- ✅ **Backups automatizados** diários
- ✅ **Logs de auditoria** sem dados sensíveis
- ✅ **Monitoramento de acessos** não autorizados

### Medidas Organizacionais:
- ✅ **Política de Privacidade** disponível publicamente
- ✅ **Termos de Uso** aceitos explicitamente
- ✅ **Treinamento de equipe** sobre LGPD (quando aplicável)
- ✅ **Processo de resposta a incidentes** documentado
- ✅ **Revisão periódica** de segurança e conformidade
- ✅ **Contratos com terceiros** incluindo cláusulas de proteção de dados

---

## 6. PROCESSO DE NOTIFICAÇÃO DE INCIDENTES (Art. 48 da LGPD)

### Em caso de incidente de segurança:

1. **Identificação:** Equipe técnica identifica o incidente
2. **Contenção:** Medidas imediatas para mitigar o problema
3. **Avaliação:** Determinar gravidade e dados afetados
4. **Notificação ANPD:** Comunicar à Autoridade Nacional em até **72 horas** (se houver risco aos titulares)
5. **Notificação aos Titulares:** Informar usuários afetados sobre:
   - Natureza do incidente
   - Dados comprometidos
   - Medidas tomadas
   - Riscos associados
   - Recomendações de proteção
6. **Documentação:** Registrar o incidente e respostas no Registro de Incidentes

### Contato para Incidentes:
📧 **E-mail:** eduardo.klug7@gmail.com  
📞 **Telefone:** [INSERIR TELEFONE DE EMERGÊNCIA]

---

## 7. REVISÕES E ATUALIZAÇÕES

### Histórico de Alterações:

| Data | Versão | Alterações |
|------|--------|------------|
| 05/11/2025 | 1.0 | Versão inicial do documento |

### Próxima Revisão Prevista:
**Data:** 05/05/2026 (6 meses)

---

## 8. DECLARAÇÃO DE CONFORMIDADE

Declaro que as atividades de tratamento de dados pessoais realizadas pelo BarTab estão em conformidade com a Lei nº 13.709/2018 (LGPD) e que este registro está disponível para consulta pela Autoridade Nacional de Proteção de Dados (ANPD) quando solicitado.

**Responsável:**  
Nome: [INSERIR NOME DO RESPONSÁVEL]  
CPF: [INSERIR CPF]  
Cargo: Controlador de Dados / Encarregado (DPO)  
Data: 05/11/2025  

---

## 9. CONTATO

**Controlador de Dados:**  
E-mail: eduardo.klug7@gmail.com  
Telefone: [INSERIR TELEFONE]  

**Encarregado de Dados (DPO):**  
Nome: [INSERIR NOME]  
E-mail: eduardo.klug7@gmail.com  
Telefone: [INSERIR TELEFONE]  

**ANPD - Autoridade Nacional de Proteção de Dados:**  
Website: https://www.gov.br/anpd/pt-br  
Canal do Titular: https://www.gov.br/anpd/pt-br/canais_atendimento

---

✅ **Documento elaborado conforme Art. 37 da Lei 13.709/2018 (LGPD)**

**Última atualização:** 05 de novembro de 2025

