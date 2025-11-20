# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Build arguments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Atualizar npm e limpar cache
RUN npm cache clean --force

# Copy package files
COPY package*.json ./

# Install dependencies com tratamento de erro
# Tenta npm ci primeiro, se falhar usa npm install
RUN npm ci --legacy-peer-deps || \
    (echo "npm ci falhou, tentando npm install..." && \
     npm install --legacy-peer-deps)

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine AS production

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

