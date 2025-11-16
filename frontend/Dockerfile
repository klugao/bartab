# Dockerfile multi-stage para frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Receber a URL da API no build e expor para o Vite
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build da aplicação
RUN npm run build

# Estágio de produção com nginx
FROM nginx:alpine AS production

# Copiar build para nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run usa a variável PORT
ENV PORT=8080
EXPOSE 8080

# Script para substituir PORT em runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

