# 📋 Instruções para Compilar o Banner TCC

Este documento contém instruções para compilar o banner do TCC em LaTeX no tamanho A0.

## 📁 Arquivos Disponíveis

- `banner-tcc.tex` - Versão para XeLaTeX/LuaLaTeX (com suporte a fontes customizadas)
- `banner-tcc-pdflatex.tex` - Versão para pdflatex (mais compatível)

## 🖼️ Imagens Necessárias

Antes de compilar, você precisa ter as seguintes imagens no mesmo diretório do arquivo `.tex`:

### Imagens Obrigatórias:

1. **`logo-catolica.png`** - Logo da Católica de Santa Catarina
   - Tamanho recomendado: ~8cm de largura
   - Formato: PNG ou JPG

2. **`screenshot-interface.png`** - Screenshot da interface do sistema
   - Tamanho recomendado: Alta resolução (para impressão A0)
   - Formato: PNG ou JPG

3. **`diagrama-casos-uso.png`** - Diagrama UML de casos de uso
   - Tamanho recomendado: Alta resolução
   - Formato: PNG ou JPG

4. **`diagrama-arquitetura.png`** - Diagrama de arquitetura (CI/CD + GCP)
   - Tamanho recomendado: Alta resolução
   - Formato: PNG ou JPG

5. **`qrcode.png`** - QR Code para acesso à aplicação
   - Tamanho recomendado: 8cm x 8cm (alta resolução)
   - Formato: PNG
   - **Como gerar**: Use um gerador online de QR codes (ex: qr-code-generator.com) ou o pacote LaTeX `qrcode` se disponível

### Imagens Opcionais (para logos das tecnologias):

- `logo-react.png`
- `logo-nestjs.png`
- `logo-postgresql.png`
- `logo-gcp.png`
- `logo-jest.png`
- `logo-vitest.png`
- `logo-sonarcloud.png`

## 🔧 Compilação

### Opção 1: Usando pdflatex (Recomendado)

```bash
pdflatex banner-tcc-pdflatex.tex
pdflatex banner-tcc-pdflatex.tex  # Executar duas vezes para referências
```

### Opção 2: Usando XeLaTeX (para fontes customizadas)

```bash
xelatex banner-tcc.tex
xelatex banner-tcc.tex  # Executar duas vezes
```

### Opção 3: Usando LuaLaTeX

```bash
lualatex banner-tcc.tex
lualatex banner-tcc.tex  # Executar duas vezes
```

## ⚙️ Ajustes Necessários

Antes de compilar, você precisa ajustar:

1. **URL do QR Code** (linha ~120):
   ```latex
   \qrcode[height=8cm]{https://seu-dominio.com} % Substitua pela URL real
   ```
   E também o texto abaixo:
   ```latex
   {\smallfont https://seu-dominio.com} % Substitua pela URL real
   ```

2. **Caminhos das Imagens**: 
   - Se as imagens estiverem em outro diretório, ajuste os caminhos no arquivo `.tex`
   - Exemplo: `{../imagens/logo-catolica.png}`

3. **Tamanhos de Imagens**: 
   - Ajuste os parâmetros `width` e `height` conforme necessário
   - Para A0, use valores grandes (ex: `width=0.8\textwidth`)

## 📦 Pacotes LaTeX Necessários

Certifique-se de ter os seguintes pacotes instalados:

- `geometry` - Para configuração de página
- `graphicx` - Para inclusão de imagens
- `tikz` - Para posicionamento do cabeçalho
- `xcolor` - Para cores
- `titlesec` - Para formatação de títulos
- `multicol` - Para colunas múltiplas
- `qrcode` - Para geração de QR codes
- `enumitem` - Para listas customizadas
- `babel` - Para suporte ao português

### Instalação de Pacotes (Ubuntu/Debian)

```bash
sudo apt-get install texlive-latex-extra texlive-fonts-extra texlive-lang-portuguese
```

### Instalação de Pacotes (macOS com MacTeX)

```bash
# Os pacotes já vêm incluídos no MacTeX
```

### Instalação de Pacotes (Windows com MiKTeX)

Os pacotes serão instalados automaticamente quando você compilar pela primeira vez.

## 🎨 Personalização

### Ajustar Cores

Edite as cores no início do arquivo:

```latex
\definecolor{sectioncolor}{RGB}{200,0,0} % Vermelho para títulos
\definecolor{titlecolor}{RGB}{0,0,139}   % Azul escuro para título
```

### Ajustar Tamanhos de Fonte

Os tamanhos estão definidos como comandos:

```latex
\newcommand{\hugefont}{\fontsize{72}{86}\selectfont}
\newcommand{\LARGEfont}{\fontsize{48}{58}\selectfont}
```

Ajuste conforme necessário para melhor legibilidade.

### Ajustar Layout

- **Margens**: Ajuste em `\usepackage[margin=2cm]{geometry}`
- **Espaçamento**: Ajuste os valores de `\vspace{}` entre seções
- **Colunas**: Ajuste `\begin{multicols}{2}` para mais ou menos colunas

## 🖨️ Impressão

1. **Resolução**: O PDF gerado deve ter 300 DPI para impressão A0
2. **Tamanho**: A0 = 84.1cm x 118.9cm (ou 33.1" x 46.8")
3. **Orientação**: O banner está configurado em modo `landscape` (paisagem)

### Verificar Tamanho do PDF

```bash
# No Linux
pdfinfo banner-tcc-pdflatex.pdf

# Verificar se as dimensões estão corretas para A0
```

## ❓ Problemas Comuns

### Erro: "File not found" para imagens
- Verifique se os caminhos das imagens estão corretos
- Use caminhos relativos ou absolutos

### Erro: "Package qrcode not found"
- **Solução 1**: Gere o QR code externamente usando um gerador online e salve como `qrcode.png`
- **Solução 2**: Instale o pacote: `sudo apt-get install texlive-extra-utils` e descomente a linha `\usepackage{qrcode}` no arquivo `.tex`
- O arquivo já está configurado para usar imagem externa por padrão

### Texto muito pequeno/grande
- Ajuste os tamanhos de fonte definidos no início do arquivo
- Teste com uma impressão de teste em tamanho menor primeiro

### Margens incorretas
- Ajuste o valor em `\usepackage[margin=2cm]{geometry}`

## 📝 Checklist Antes de Compilar

- [ ] Todas as imagens necessárias estão no diretório correto
- [ ] URL do QR Code foi atualizada
- [ ] Caminhos das imagens estão corretos no arquivo `.tex`
- [ ] Todos os pacotes LaTeX estão instalados
- [ ] Textos foram revisados e estão corretos

## 🚀 Compilação Rápida

```bash
# Navegue até o diretório do projeto
cd /Users/eduardoklug/Documents/bartab

# Compile o banner
pdflatex banner-tcc-pdflatex.tex
pdflatex banner-tcc-pdflatex.tex

# Abra o PDF gerado
open banner-tcc-pdflatex.pdf  # macOS
# ou
xdg-open banner-tcc-pdflatex.pdf  # Linux
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de compilação (arquivos `.log`)
2. Certifique-se de que todos os pacotes estão instalados
3. Teste com imagens de placeholder primeiro
4. Compile em modo draft primeiro para verificar layout

