# Scripts do BarTab

Esta pasta contém todos os scripts auxiliares do projeto, organizados por categoria.

## 📁 Estrutura

### `/deploy`
Scripts relacionados ao deployment e saúde da aplicação:
- `render-build.sh` - Build para o Render
- `prepare-deploy.sh` - Preparação para deploy
- `DEPLOY_HEALTH_CHECK.sh` - Health check do deploy
- `test-health-check.sh` - Testes de health check

### `/testing`
Scripts para testes e validações:
- `run-tests.sh` - Executa todos os testes
- `TESTAR_REGISTRO_AGORA.sh` - Testa funcionalidade de registro
- `INSTALAR_E_TESTAR_RBAC.sh` - Testa RBAC (controle de acesso)

### `/sonar`
Scripts relacionados ao SonarQube (análise de qualidade):
- `configurar-sonar.sh` - Configuração inicial do SonarQube
- `verificar-sonar.sh` - Verificação de configuração
- `test-sonar.sh` - Testes com SonarQube

### `/dev`
Scripts de desenvolvimento e utilidades:
- `start-clean.sh` - Inicia o projeto (usado por `npm start`)
- `stop-project.sh` - Para o projeto (usado por `npm stop`)
- `preparar-wiki.sh` - Prepara arquivos para a wiki

## 🚀 Uso

Os principais scripts podem ser executados através do `package.json`:

```bash
npm start      # Inicia o projeto
npm stop       # Para o projeto
npm test       # Executa testes
```

Para executar scripts específicos diretamente:

```bash
bash scripts/deploy/render-build.sh
bash scripts/testing/run-tests.sh
bash scripts/sonar/verificar-sonar.sh
```

