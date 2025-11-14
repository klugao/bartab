# Dockerfile multi-stage para produção no Cloud Run
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar apenas package files para aproveitar cache
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:20-alpine AS production

WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copiar build do estágio anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Usuário não-root para segurança
USER node

# Cloud Run usa a variável PORT
ENV PORT=8080
EXPOSE 8080

# Comando de inicialização
CMD ["node", "--dns-result-order=ipv4first", "dist/src/main"]

