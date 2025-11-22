# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Update npm to compatible version (npm 9.x for Node 18) and clear cache
RUN npm install -g npm@9 && npm cache clean --force

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

# Update npm to compatible version (npm 9.x for Node 18)
RUN npm install -g npm@9

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "run", "start"]