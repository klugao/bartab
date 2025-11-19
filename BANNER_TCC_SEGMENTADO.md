# Banner de Apresentação TCC - BarTab
## Segmentação de Conteúdo e Sugestões de Imagens

---

## 📋 **SEÇÃO 1: TÍTULO E IDENTIFICAÇÃO**

### Texto:
**BarTab - Gestão de Contas e Consumo de clientes em bares**

**Eduardo Vinicios Klug**  
Centro Universitário Católica de Santa Catarina - Joinville  
Engenharia de Software

### Imagens Sugeridas:
- Logo do BarTab (`frontend/public/BarTab.svg` ou `frontend/dist/BarTab.svg`)
- Logo da instituição (se disponível)

---

## 📋 **SEÇÃO 2: RESUMO EXECUTIVO**

### Texto:
Sistema web desenvolvido para pequenos estabelecimentos (bares e botecos) que enfrentam desafios na gestão de contas e comandas. Solução simples, intuitiva e acessível para controle de vendas, gerenciamento de mesas e pagamentos, incluindo funcionalidade de "Marcar Depois". Desenvolvido com React (frontend) e NestJS (backend), autenticação OAuth via Google, implantado em produção no Google Cloud Platform. Inclui 126 testes automatizados (51 backend + 75 frontend) e deploy automatizado via CI/CD.

### Imagens Sugeridas:
- Screenshot da tela principal do sistema (se disponível)
- Ícone representando bares/estabelecimentos

---

## 📋 **SEÇÃO 3: PROBLEMA E JUSTIFICATIVA**

### Texto:
**Problema:**
- Controle manual de consumo (papel, cadernos, calculadoras)
- Risco de perda de informações
- Erros no cálculo final da conta
- Falta de controle sobre pendências ("marcar depois")
- Dificuldade na organização do atendimento
- Ausência de histórico estruturado
- Falta de visão financeira

**Justificativa:**
Lacuna entre sistemas existentes (desenvolvidos para restaurantes maiores) e necessidades reais de estabelecimentos menores com rotinas mais simples e informais.

### Imagens Sugeridas:
- Diagrama comparativo (antes/depois)
- Ilustração representando o problema (papel/cadernos vs sistema digital)

---

## 📋 **SEÇÃO 4: OBJETIVOS**

### Texto:
**Objetivo Principal:**
Desenvolver solução digital para registrar, gerenciar e finalizar contas abertas em bares e botecos, reduzindo erros manuais e simplificando a rotina.

**Objetivos Secundários:**
- Organizar lançamentos de consumo por cliente
- Permitir diferentes métodos de pagamento
- Facilitar acesso ao histórico
- Reduzir tempo de fechamento de contas
- Fornecer visão geral sobre contas ativas
- Implementar controle de dívidas
- Fornecer relatórios mensais financeiros

### Imagens Sugeridas:
- Ícones representando cada objetivo
- Fluxograma simplificado do processo

---

## 📋 **SEÇÃO 5: ARQUITETURA E SOLUÇÃO**

### Texto:
**Arquitetura:**
- Frontend: React 18.3 + TypeScript + Vite + TailwindCSS
- Backend: NestJS 11 + TypeORM + Express
- Banco de Dados: PostgreSQL (Cloud SQL no GCP)
- Autenticação: OAuth Google + JWT
- Deploy: Google Cloud Platform (Cloud Run)
- CI/CD: GitHub Actions

**Padrões Aplicados:**
- Clean Code e SOLID
- Arquitetura em camadas
- DTOs para validação
- Guards para controle de acesso

### Imagens Sugeridas:
✅ **DIAGRAMA DE CONTEXTO C4** (`diagrama-c4-contexto.puml` - gerar como PNG)
- Mostra a visão geral do sistema e seus relacionamentos externos

✅ **DIAGRAMA DE CONTÊINERES C4** (`diagrama-c4-conteineres.puml` - gerar como PNG)
- Mostra os principais componentes: Frontend, Backend, Banco de Dados

✅ **DIAGRAMA DE COMPONENTES C4** (`diagrama-c4-componentes.puml` ou versão simplificada)
- Mostra a estrutura interna do backend

---

## 📋 **SEÇÃO 6: FUNCIONALIDADES**

### Texto:
**Funcionalidades Implementadas:**
- ✅ CRUD Completo: Clientes, Itens, Despesas
- ✅ Gestão de Contas: Abertura, adição/remoção de itens, fechamento
- ✅ Pagamentos: Dinheiro, débito, crédito, pix e "pagar depois"
- ✅ Controle de Dívidas: Tela dedicada com histórico completo
- ✅ Autenticação: OAuth Google para proprietários e gerentes
- ✅ Administração: Sistema multi-estabelecimento
- ✅ Relatórios: Mensais de consumo, receitas, despesas e lucro
- ✅ Conformidade: LGPD e OWASP implementadas

### Imagens Sugeridas:
✅ **DIAGRAMA DE CASOS DE USO** (`diagrama-casos-uso-final.puml` ou `diagrama-casos-uso-simples.puml` - gerar como PNG)
- Mostra todas as funcionalidades do sistema de forma visual

- Screenshots das principais telas:
  - Tela de contas abertas
  - Tela de detalhes da conta
  - Tela de controle de dívidas
  - Tela de relatórios

---

## 📋 **SEÇÃO 7: STACK TECNOLÓGICA**

### Texto:
**Tecnologias Utilizadas:**
- **Linguagem:** TypeScript
- **Frontend:** React 18.3 + Vite + TailwindCSS + React Router
- **Backend:** NestJS 11 + TypeORM 0.3 + Express
- **Banco de Dados:** PostgreSQL (Cloud SQL)
- **Autenticação:** OAuth Google (Passport.js) + JWT
- **Testes:** Jest (backend) + Vitest (frontend)
- **CI/CD:** GitHub Actions
- **Cloud:** Google Cloud Platform (Cloud Run, Cloud SQL, Secret Manager)
- **Containerização:** Docker

### Imagens Sugeridas:
- Logos das tecnologias (React, NestJS, PostgreSQL, GCP, etc.)
- Diagrama de stack tecnológica (camadas)

---

## 📋 **SEÇÃO 8: QUALIDADE E TESTES**

### Texto:
**Testes Implementados:**
- ✅ 126 testes automatizados
- ✅ 51 testes no backend (Jest)
- ✅ 75 testes no frontend (Vitest)
- ✅ Cobertura de código documentada

**Conformidade:**
- ✅ LGPD: Políticas de privacidade e termos de uso
- ✅ OWASP Top 10: Proteção contra SQL Injection, validação de inputs, headers de segurança, CORS, rate limiting

### Imagens Sugeridas:
- Gráfico de cobertura de testes
- Badge de conformidade LGPD/OWASP
- Screenshot dos relatórios de teste

---

## 📋 **SEÇÃO 9: STATUS E RESULTADOS**

### Texto:
**Status da Implementação:**
✅ Sistema 100% implementado e em produção

**Deploy e Infraestrutura:**
- ✅ Backend: Cloud Run com escalabilidade automática
- ✅ Frontend: Cloud Run servindo aplicação React
- ✅ Banco de Dados: Cloud SQL (PostgreSQL) gerenciado
- ✅ Secrets: Secret Manager para credenciais
- ✅ CI/CD: GitHub Actions para deploy automático

**Metodologia:**
- Desenvolvido utilizando SCRUM com 10 sprints quinzenais
- Entregas incrementais
- Documentação viva em Wiki

### Imagens Sugeridas:
- Screenshot do dashboard do GCP
- Logo do Google Cloud Platform
- Gráfico de progresso das sprints
- Badge "Em Produção"

---

## 📋 **SEÇÃO 10: CONCLUSÃO E PRÓXIMOS PASSOS**

### Texto:
Sistema completo e funcional, atendendo todos os objetivos estabelecidos. Solução pronta para uso em estabelecimentos reais, com arquitetura escalável e boas práticas de engenharia de software implementadas.

### Imagens Sugeridas:
- QR Code para acesso ao sistema (se disponível)
- Screenshot final da interface

---

## 🎨 **RESUMO DE IMAGENS RECOMENDADAS PARA O BANNER**

### **Imagens Principais (Prioridade Alta):**

1. ✅ **Diagrama de Contexto C4** 
   - Arquivo: `diagrama-c4-contexto.puml`
   - Mostra a visão geral do sistema
   - **Recomendação:** Gerar como PNG e usar na seção de Arquitetura

2. ✅ **Diagrama de Contêineres C4**
   - Arquivo: `diagrama-c4-conteineres.puml`
   - Mostra Frontend, Backend e Banco de Dados
   - **Recomendação:** Gerar como PNG e usar na seção de Arquitetura

3. ✅ **Diagrama de Casos de Uso**
   - Arquivo: `diagrama-casos-uso-final.puml` ou `diagrama-casos-uso-simples.puml`
   - Mostra todas as funcionalidades
   - **Recomendação:** Gerar como PNG e usar na seção de Funcionalidades

4. ✅ **Logo do BarTab**
   - Arquivo: `frontend/public/BarTab.svg` ou `frontend/dist/BarTab.svg`
   - **Recomendação:** Usar no cabeçalho do banner

### **Imagens Secundárias (Prioridade Média):**

5. **Diagrama de Componentes C4**
   - Arquivo: `diagrama-c4-componentes.puml` ou versão simplificada
   - Mostra estrutura interna do backend
   - **Recomendação:** Usar se houver espaço, na seção técnica detalhada

6. **Screenshots da Interface**
   - Tela principal, detalhes da conta, controle de dívidas
   - **Recomendação:** Capturar do sistema em produção

7. **Logos das Tecnologias**
   - React, NestJS, PostgreSQL, GCP
   - **Recomendação:** Usar na seção de Stack Tecnológica

### **Imagens Opcionais (Prioridade Baixa):**

8. **Gráficos e Estatísticas**
   - Cobertura de testes, progresso das sprints
   - **Recomendação:** Criar se necessário para visualização

---

## 📝 **NOTAS IMPORTANTES**


2. **Formato do Banner (A0):**
   - Tamanho típico: 90cm x 120cm (vertical) ou 120cm x 90cm (horizontal)
   - Resolução recomendada: 300 DPI
   - Manter texto legível de 1-2 metros de distância

3. **Hierarquia Visual:**
   - Título: Maior destaque
   - Diagramas principais: Tamanho médio-grande
   - Texto explicativo: Tamanho legível
   - Logos e badges: Tamanho pequeno

4. **Cores e Estilo:**
   - Manter consistência com o tema do BarTab
   - Usar cores contrastantes para boa legibilidade
   - Evitar sobrecarga de informações


