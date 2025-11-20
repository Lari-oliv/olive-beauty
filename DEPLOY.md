# 🚀 Guia de Deploy - VPS Hostinger

Este guia detalha como fazer o deploy da aplicação Olive Beauty em uma VPS da Hostinger.

## 📋 Pré-requisitos

- VPS da Hostinger com acesso SSH
- Domínio configurado apontando para o IP da VPS (opcional, mas recomendado)
- Conhecimento básico de Linux e Docker

## 🔧 Passo 1: Configuração Inicial da VPS

### 1.1 Conectar via SSH

```bash
ssh root@seu-ip-vps
# ou
ssh usuario@seu-ip-vps
```

### 1.2 Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Instalar dependências necessárias

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Nginx
sudo apt install nginx -y

# Instalar Git
sudo apt install git -y

# Adicionar usuário ao grupo docker (se não for root)
sudo usermod -aG docker $USER
```

### 1.4 Verificar instalações

```bash
docker --version
docker-compose --version
nginx -v
```

## 📦 Passo 2: Preparar o Projeto na VPS

### 2.1 Clonar o repositório

```bash
cd /var/www
sudo git clone https://github.com/Lari-oliv/olive-beauty.git
# ou faça upload via SFTP/FTP
cd olive-beauty
```

### 2.2 Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp env.production.example .env.production

# Editar com suas configurações
nano .env.production
```

**Importante:** Configure:

- `DATABASE_URL` com as credenciais do PostgreSQL
- `JWT_SECRET` com uma string aleatória segura
- `POSTGRES_PASSWORD` com uma senha forte
- `VITE_API_URL` com a URL do seu domínio (ex: `https://seu-dominio.com/api`)

### 2.3 Configurar variáveis de ambiente dos frontends

```bash
# Frontend Admin
cd frontend-admin
echo "VITE_API_URL=https://seu-dominio.com/api" > .env.production
nano .env.production
# Configure VITE_API_URL com a URL correta do seu domínio
cd ..

# Frontend E-commerce
cd frontend-ecommerce
echo "VITE_API_URL=https://seu-dominio.com/api" > .env.production
nano .env.production
# Configure VITE_API_URL com a URL correta do seu domínio
cd ..
```

**Nota:** As variáveis de ambiente dos frontends são usadas durante o build. Certifique-se de que `VITE_API_URL` está configurada corretamente antes de fazer o build.

## 🐳 Passo 3: Build e Deploy com Docker

### 3.1 Build das imagens

```bash
# Na raiz do projeto
docker-compose -f docker-compose.prod.yml build
```

### 3.2 Executar migrações do banco de dados

```bash
# Aguardar o banco iniciar
docker-compose -f docker-compose.prod.yml up -d postgres
sleep 10

# Executar migrações
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

# (Opcional) Popular banco com dados iniciais
docker-compose -f docker-compose.prod.yml run --rm backend npm run prisma:seed
docker-compose -f docker-compose.prod.yml run --rm backend npm run prisma:seed:dashboard
```

### 3.3 Iniciar todos os serviços

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3.4 Verificar status dos containers

```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

## 🌐 Passo 4: Configurar Nginx

### 4.1 Copiar configuração do Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/olive-beauty
```

### 4.2 Editar configuração

```bash
sudo nano /etc/nginx/sites-available/olive-beauty
```

**Ajustar:**

- `server_name` com seu domínio (ou IP se não tiver domínio)
- Descomentar configuração de HTTPS se tiver certificado SSL

### 4.3 Ativar site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/olive-beauty /etc/nginx/sites-enabled/

# Remover configuração padrão (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 4.4 Configurar firewall (se necessário)

```bash
# UFW (Uncomplicated Firewall)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (se usar SSL)
sudo ufw enable
```

## 🔒 Passo 5: Configurar SSL (Opcional mas Recomendado)

### 5.1 Instalar Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Obter certificado SSL

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### 5.3 Renovação automática

O Certbot já configura renovação automática, mas você pode testar:

```bash
sudo certbot renew --dry-run
```

## ✅ Passo 6: Verificar Deploy

### 6.1 Testar endpoints

```bash
# Health check
curl http://localhost:3000/health

# Verificar containers
docker ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend-admin
docker-compose -f docker-compose.prod.yml logs frontend-ecommerce
```

### 6.2 Acessar aplicação

- **E-commerce:** `http://seu-dominio.com` ou `http://seu-ip`
- **Admin:** `http://seu-dominio.com/admin` ou `http://seu-ip/admin`
- **API:** `http://seu-dominio.com/api/health`

## 🔄 Passo 7: Comandos Úteis para Manutenção

### 7.1 Atualizar aplicação

```bash
cd /var/www/olive-beauty

# Atualizar código
git pull origin main

# Rebuild e restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 7.2 Ver logs

```bash
# Todos os serviços
docker-compose -f docker-compose.prod.yml logs -f

# Serviço específico
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### 7.3 Parar/Iniciar serviços

```bash
# Parar
docker-compose -f docker-compose.prod.yml stop

# Iniciar
docker-compose -f docker-compose.prod.yml start

# Parar e remover containers
docker-compose -f docker-compose.prod.yml down

# Parar, remover containers e volumes (CUIDADO: apaga dados)
docker-compose -f docker-compose.prod.yml down -v
```

### 7.4 Backup do banco de dados

```bash
# Criar backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U olive_beauty_user olive_beauty > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U olive_beauty_user olive_beauty < backup.sql
```

### 7.5 Acessar banco de dados

```bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U olive_beauty_user -d olive_beauty
```

## 🐛 Troubleshooting

### Problema: Containers não iniciam

```bash
# Verificar logs
docker-compose -f docker-compose.prod.yml logs

# Verificar se portas estão em uso
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :8081
```

### Problema: Nginx não funciona

```bash
# Verificar configuração
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/error.log

# Reiniciar
sudo systemctl restart nginx
```

### Problema: Banco de dados não conecta

```bash
# Verificar se container está rodando
docker ps | grep postgres

# Ver logs do postgres
docker-compose -f docker-compose.prod.yml logs postgres

# Verificar variáveis de ambiente
docker-compose -f docker-compose.prod.yml exec backend env | grep DATABASE
```

### Problema: Frontend não carrega

```bash
# Verificar se variável VITE_API_URL está correta
docker-compose -f docker-compose.prod.yml exec frontend-admin env | grep VITE

# Rebuild frontend
docker-compose -f docker-compose.prod.yml build frontend-admin frontend-ecommerce
docker-compose -f docker-compose.prod.yml up -d frontend-admin frontend-ecommerce
```

## 📊 Monitoramento

### Ver uso de recursos

```bash
# Uso de CPU e memória
docker stats

# Espaço em disco
df -h
docker system df
```

### Configurar auto-restart

Os containers já estão configurados com `restart: unless-stopped` no docker-compose.prod.yml, então reiniciam automaticamente após reboot da VPS.

## 🔐 Segurança

### Recomendações importantes:

1. **Altere todas as senhas padrão** no arquivo `.env.production`
2. **Use JWT_SECRET forte** (gerar com: `openssl rand -base64 32`)
3. **Configure firewall** para permitir apenas portas necessárias
4. **Use HTTPS** com certificado SSL
5. **Mantenha o sistema atualizado**: `sudo apt update && sudo apt upgrade`
6. **Configure backup automático** do banco de dados
7. **Não commite arquivos `.env`** no Git

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verifique status dos containers: `docker ps`
3. Verifique configuração do Nginx: `sudo nginx -t`
4. Consulte a documentação do Docker e Nginx

---

**Boa sorte com o deploy! 🚀**
