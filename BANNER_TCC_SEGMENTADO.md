# Banner de Apresentação TCC - BarTab
## Estrutura Baseada no Formato ThriveCorp

---

## 🎯 **SEÇÃO 1: CABEÇALHO E IDENTIFICAÇÃO**

### Layout:
- **Canto Superior Esquerdo:** Logo da Católica de Santa Catarina
- **Canto Superior Direito:** 
  - **Título:** "BarTab" (em destaque, fonte grande e negrito)
  - **Nome:** "Eduardo Vinicios Klug"
  - **Email:** "eduardo.klug@catolicasc.edu.br"
- **Abaixo do cabeçalho:** "Graduando do curso de Bacharelado em Engenharia de Software da Católica de SC"

### Imagens:
- Logo da Católica de Santa Catarina (canto superior esquerdo)
- Logo do BarTab (`frontend/public/BarTab.svg` ou `frontend/dist/BarTab.svg`) - opcional no cabeçalho

---

## 📝 **SEÇÃO 2: INTRODUÇÃO**

### Texto:
O cenário de pequenos estabelecimentos comerciais, especialmente bares e botecos, enfrenta desafios significativos na gestão de contas e comandas. O controle manual através de papel, cadernos e calculadoras apresenta riscos de perda de informações, erros no cálculo final e dificuldades na organização do atendimento. Este projeto propõe o desenvolvimento de uma plataforma web de gestão de contas focada em estabelecimentos menores, utilizando arquitetura moderna para escalabilidade e segurança. O sistema inclui registro e gerenciamento de clientes, criação e controle de contas abertas, múltiplos métodos de pagamento (incluindo "pagar depois" com controle de dívidas) e relatórios financeiros. A plataforma visa melhorar a eficiência operacional, reduzir erros manuais e fortalecer o controle financeiro dos estabelecimentos.

---

## 🛠️ **SEÇÃO 3: DESENVOLVIMENTO**

### Tecnologias Utilizadas:

**Front-end:**
- React 18.3
- Vite
- TypeScript
- TailwindCSS
- Axios

**Back-end:**
- NestJS 11
- TypeORM 0.3
- Express
- PostgreSQL

**Qualidade:**
- Jest (backend)
- Vitest (frontend)
- SonarCloud (análise estática)

**Infraestrutura e DevOps:**
- Google Cloud Platform (Cloud Run, Cloud SQL)
- GitHub Actions (CI/CD)
- Docker

### Imagens:
- Logos das tecnologias organizadas por categoria (Front-end, Back-end, Qualidade, Infraestrutura)
- Layout similar ao exemplo, com logos visíveis

---

## ✅ **SEÇÃO 4: RESULTADO**

### Texto:
O sistema foi implantado com sucesso no Google Cloud Platform utilizando serviços como Cloud Run para escalabilidade automática e Cloud SQL para gerenciamento do banco de dados PostgreSQL. A qualidade do software foi garantida através de testes automatizados (Jest/Vitest) com 126 testes implementados (51 backend + 75 frontend) e análise estática contínua via SonarCloud, integrada em pipeline de CI/CD. A plataforma é segura, com autenticação OAuth via Google e controle de acesso baseado em roles (RBAC), capaz de gerenciar todo o ciclo de vida de contas e pagamentos com monitoramento de métricas de negócio em tempo real.

### Screenshot Sugerido:
**"Painel de gestão de contas"**
- Interface web mostrando:
  - Menu lateral (Dashboard, Contas, Clientes, Itens, Dívidas, Relatórios)
  - Área principal com:
    - Lista de contas abertas
    - Detalhes de uma conta (itens, total, pagamentos)
    - Controle de dívidas
    - Relatórios mensais

### Texto abaixo do screenshot:
O módulo de gestão permite controle autônomo de contas, clientes e pagamentos. A interface reflete a arquitetura do banco de dados, garantindo que cada conta esteja corretamente vinculada a um cliente e validada por middleware de segurança para prevenir acesso não autorizado aos recursos.

---

## 📱 **SEÇÃO 5: QR CODE**

### Título:
**"QR code para acessar a aplicação"**

### Conteúdo:
- QR Code grande (preto e branco) apontando para a URL de produção do sistema
- URL visível abaixo do QR Code

---

## 📊 **SEÇÃO 6: PRINCIPAL CASO DE USO**

### Título:
**"Principal caso de uso"**

### Diagrama UML:
**"BarTab - Atendente/Gerente"**

**Ator:** "Usuário Atendente/Gerente" (lado esquerdo)

**Casos de Uso:**
- "Abrir conta" (abre nova conta/mesa)
- "Adicionar item" (inclui item na conta)
- "Remover item" (remove item da conta) - extends "Adicionar item"
- "Registrar pagamento" (dinheiro, débito, crédito, pix, pagar depois)
- "Fechar conta" (finaliza conta) - includes "Registrar pagamento"
- "Consultar dívidas" (visualiza saldo devedor)
- "Gerar relatório" (relatórios mensais)

### Imagens:
- Diagrama UML de casos de uso gerado (PlantUML ou similar)

---

## 🏗️ **SEÇÃO 7: ARQUITETURA**

### Título:
**"Arquitetura"**

### Diagrama:
**CI/CD Pipeline (GitHub Actions) e Google Cloud Platform (Infraestrutura)**

**CI/CD Pipeline (GitHub Actions):**
- "Código (GitHub)" → "Build & Testes" → "SonarCloud (Qualidade)" → "Deploy Frontend" e "Deploy Backend"

**Google Cloud Platform (Infraestrutura):**
- "Deploy Frontend" → "Cloud Run (Frontend)"
- "Deploy Backend" → "Cloud Run (Backend)"
- "Cloud Run (Backend)" → "Cloud SQL (PostgreSQL)"
- "Cloud Run (Frontend)" e "Cloud Run (Backend)" (via "API Requests (JSON)") → "Usuário" via "Browser (HTTPS)"

### Imagens:
- Diagrama de arquitetura mostrando o fluxo completo de CI/CD e infraestrutura

---

## 🎓 **SEÇÃO 8: CONCLUSÃO**

### Texto:
O desenvolvimento da plataforma BarTab validou a aplicação prática de conceitos avançados de Engenharia de Software em uma solução real. O objetivo principal de criar um sistema escalável de gestão de contas foi alcançado através de uma arquitetura em camadas e segura. As principais lições aprendidas incluem a complexidade de orquestrar ambientes em nuvem (GCP) e a importância crítica da automação (CI/CD) para manter a qualidade do software. Conclui-se que a adoção de padrões de projeto (como Repository Pattern) e estratégias rigorosas de testes são fundamentais para garantir a robustez e manutenibilidade de sistemas modernos multi-tenant.

---

## 📚 **SEÇÃO 9: REFERÊNCIAS**

### Texto:
1. NESTJS. NestJS - A progressive Node.js framework. Disponível em: https://nestjs.com/. Acesso em: nov. 2025.

2. REACT. React: The library for web and native user interfaces. Disponível em: https://react.dev/. Acesso em: nov. 2025.

3. GOOGLE CLOUD PLATFORM. Cloud Run Documentation. Disponível em: https://cloud.google.com/run/docs. Acesso em: nov. 2025.

4. POSTGRESQL. PostgreSQL: The World's Most Advanced Open Source Relational Database. Disponível em: https://www.postgresql.org/. Acesso em: nov. 2025.

5. TYPEORM. TypeORM - Data Mapper, Active Record patterns. Disponível em: https://typeorm.io/. Acesso em: nov. 2025.

6. JEST. Jest - Delightful JavaScript Testing. Disponível em: https://jestjs.io/. Acesso em: nov. 2025.

7. VITEST. Vitest - Next Generation Testing Framework. Disponível em: https://vitest.dev/. Acesso em: nov. 2025.

8. SONARCLOUD. SonarCloud - Clean Code. Disponível em: https://www.sonarsource.com/products/sonarcloud/. Acesso em: nov. 2025.

---

## 📋 **CHECKLIST DE ELEMENTOS VISUAIS**

### Imagens Obrigatórias:
- [ ] Logo da Católica de Santa Catarina
- [ ] Logo do BarTab (opcional no cabeçalho)
- [ ] Screenshot da interface principal do sistema
- [ ] QR Code para acesso à aplicação
- [ ] Diagrama de Casos de Uso (UML)
- [ ] Diagrama de Arquitetura (CI/CD + GCP)
- [ ] Logos das tecnologias (React, NestJS, PostgreSQL, GCP, Jest, Vitest, SonarCloud)

### Formato do Banner:
- **Tamanho:** A0 (90cm x 120cm vertical ou 120cm x 90cm horizontal)
- **Resolução:** 300 DPI
- **Hierarquia Visual:**
  - Título: Maior destaque (fonte grande e negrito)
  - Seções: Títulos em vermelho/negrito (seguindo exemplo)
  - Diagramas: Tamanho médio-grande
  - Texto: Legível de 1-2 metros de distância
  - Logos: Tamanho pequeno

### Cores e Estilo:
- Manter consistência com o tema do BarTab
- Usar cores contrastantes para boa legibilidade
- Títulos de seções em vermelho/negrito (seguindo exemplo ThriveCorp)
- Evitar sobrecarga de informações

---

## 📝 **NOTAS ADICIONAIS**

### Adaptações do Exemplo ThriveCorp:
1. **Estrutura Simplificada:** Reduzido de 10 seções para 9 seções principais, seguindo o formato do exemplo
2. **Foco Visual:** Maior ênfase em diagramas e screenshots
3. **Tecnologias Agrupadas:** Organizadas por categoria (Front-end, Back-end, Qualidade, Infraestrutura)
4. **Casos de Uso:** Diagrama UML simplificado focado no fluxo principal
5. **Arquitetura:** Diagrama mostrando CI/CD e infraestrutura GCP de forma clara

### Próximos Passos:
1. Gerar diagramas UML (casos de uso e arquitetura)
2. Capturar screenshots da interface em produção
3. Criar QR Code para acesso à aplicação
4. Coletar logos das tecnologias
5. Revisar textos para ajuste de tamanho no banner A0
