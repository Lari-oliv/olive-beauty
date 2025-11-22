# 🚀 Configuração de Deploy Automático com GitHub Actions

## Passo 1: Gerar chave SSH no servidor

```bash
# Conectar no servidor
ssh root@seu-servidor.com

# Gerar chave SSH dedicada para GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Adicionar chave pública ao authorized_keys
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys

# Verificar permissões
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Exibir chave privada (copiar TODO o conteúdo)
cat ~/.ssh/github_actions_deploy
```

**⚠️ IMPORTANTE:** Copie TODO o conteúdo da chave privada, incluindo:
- `-----BEGIN OPENSSH PRIVATE KEY-----`
- Todo o conteúdo
- `-----END OPENSSH PRIVATE KEY-----`

## Passo 2: Configurar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá em **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Adicione os seguintes secrets:

### `SSH_PRIVATE_KEY`
- **Nome:** `SSH_PRIVATE_KEY`
- **Valor:** Cole a chave privada completa que você copiou acima

### `SERVER_HOST`
- **Nome:** `SERVER_HOST`
- **Valor:** IP ou domínio do seu servidor
  - Exemplo: `srv873973.hostgator.com.br`
  - Ou: `123.456.789.0`

### `SERVER_USER`
- **Nome:** `SERVER_USER`
- **Valor:** Usuário SSH (geralmente `root`)
  - Exemplo: `root`

## Passo 3: Configurar Git no servidor

```bash
# No servidor, verificar configuração atual
cd /var/www/olive-beauty
git remote -v

# Se necessário, configurar remote
git remote set-url origin https://github.com/SEU_USUARIO/olive-beauty.git

# Ou se usar SSH:
git remote set-url origin git@github.com:SEU_USUARIO/olive-beauty.git

# Testar pull
git pull origin main
```

## Passo 4: Testar o workflow

1. Faça um commit e push para a branch `main`:
   ```bash
   git add .
   git commit -m "test: deploy automático"
   git push origin main
   ```

2. Vá em **Actions** no GitHub e acompanhe o deploy

3. Ou execute manualmente:
   - Vá em **Actions** > **Deploy to Production**
   - Clique em **Run workflow**
   - Selecione a branch `main`
   - Clique em **Run workflow**

## Passo 5: Verificar deploy

```bash
# No servidor, verificar logs
cd /var/www/olive-beauty
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f backend
```

## Troubleshooting

### Erro de permissão SSH
```bash
# Verificar permissões no servidor
chmod 600 ~/.ssh/github_actions_deploy
chmod 644 ~/.ssh/github_actions_deploy.pub
```

### Erro de conexão
- Verifique se o firewall permite conexões SSH
- Verifique se o `SERVER_HOST` está correto
- Teste conexão manual: `ssh root@SEU_SERVIDOR`

### Erro no git pull
- Verifique se o repositório está configurado corretamente
- Verifique se há conflitos locais no servidor

### Erro no Docker build
- Verifique se há espaço em disco: `df -h`
- Limpe imagens antigas: `docker system prune -a`

## Personalizações

### Deploy apenas em tags
Edite `.github/workflows/deploy.yml` e altere:
```yaml
on:
  push:
    tags:
      - 'v*'
```

### Adicionar notificações
Adicione no final do workflow:
```yaml
- name: Notify on success
  if: success()
  run: |
    # Adicionar notificação (Slack, Discord, etc)
```

### Deploy em staging
Crie um workflow separado `.github/workflows/deploy-staging.yml` para deploy em ambiente de staging.

