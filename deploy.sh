#!/bin/bash

# Script de deploy automatizado para VPS
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deploy da Olive Beauty..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está na raiz do projeto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

# Verificar se .env.production existe
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env.production não encontrado${NC}"
    if [ -f "env.production.example" ]; then
        echo "Copiando env.production.example para .env.production..."
        cp env.production.example .env.production
    fi
    echo -e "${YELLOW}⚠️  Por favor, edite .env.production com suas configurações antes de continuar${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Verificações iniciais concluídas${NC}"

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down

# Build das imagens
echo "🔨 Construindo imagens Docker..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar banco de dados
echo "🗄️  Iniciando banco de dados..."
docker-compose -f docker-compose.prod.yml up -d postgres

# Aguardar banco estar pronto
echo "⏳ Aguardando banco de dados estar pronto..."
sleep 10

# Executar migrações
echo "📊 Executando migrações do banco de dados..."
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Migrações falharam, tentando gerar Prisma Client...${NC}"
    docker-compose -f docker-compose.prod.yml run --rm backend npx prisma generate
}

# Iniciar todos os serviços
echo "🚀 Iniciando todos os serviços..."
docker-compose -f docker-compose.prod.yml up -d

# Aguardar serviços iniciarem
echo "⏳ Aguardando serviços iniciarem..."
sleep 5

# Verificar status
echo "📊 Verificando status dos containers..."
docker-compose -f docker-compose.prod.yml ps

# Testar health check
echo "🏥 Testando health check da API..."
sleep 3
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API está respondendo corretamente${NC}"
else
    echo -e "${YELLOW}⚠️  API não está respondendo ainda, verifique os logs${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "📝 Próximos passos:"
echo "1. Configure o Nginx (veja DEPLOY.md)"
echo "2. Configure SSL se necessário"
echo "3. Verifique os logs: docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🌐 URLs locais:"
echo "  - API: http://localhost:3000"
echo "  - Admin: http://localhost:8080"
echo "  - E-commerce: http://localhost:8081"

