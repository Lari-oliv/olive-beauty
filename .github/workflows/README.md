# GitHub Actions - Deploy Automático

Este workflow faz deploy automático para produção quando há push na branch `main`.

## Configuração

### 1. Criar chave SSH no servidor

```bash
# No servidor, gerar chave SSH (se ainda não tiver)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Adicionar chave pública ao authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Ver chave privada (copiar para GitHub Secrets)
cat ~/.ssh/github_actions
```

### 2. Configurar Secrets no GitHub

No repositório GitHub, vá em **Settings > Secrets and variables > Actions** e adicione:

- **`SSH_PRIVATE_KEY`**: Chave privada SSH gerada acima
- **`SERVER_HOST`**: IP ou domínio do servidor (ex: `srv873973.hostgator.com.br` ou IP)
- **`SERVER_USER`**: Usuário SSH (geralmente `root`)

### 3. Configurar Git no servidor (se necessário)

```bash
# No servidor
cd /var/www/olive-beauty
git remote -v  # Verificar remotes

# Se necessário, configurar:
git remote set-url origin https://github.com/SEU_USUARIO/olive-beauty.git
# ou
git remote set-url origin git@github.com:SEU_USUARIO/olive-beauty.git
```

### 4. Testar deploy manual

Você pode executar o workflow manualmente em **Actions > Deploy to Production > Run workflow**.

## Como funciona

1. **Trigger**: Push na branch `main` ou execução manual
2. **Checkout**: Baixa o código do repositório
3. **SSH**: Conecta no servidor via SSH
4. **Deploy**: 
   - Atualiza código via `git pull`
   - Faz rebuild das imagens Docker
   - Executa migrações do banco
   - Reinicia containers
5. **Health Check**: Verifica se a API está respondendo

## Personalização

Você pode ajustar o workflow em `.github/workflows/deploy.yml` para:
- Adicionar notificações (Slack, Discord, Email)
- Executar testes antes do deploy
- Fazer deploy apenas em tags específicas
- Adicionar rollback automático em caso de falha

