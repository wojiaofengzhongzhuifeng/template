# 服务器部署指南

本文档介绍如何将应用部署到 Linux 服务器。

---

## 方式一：Docker 容器化部署（推荐）

### 1. 安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 2. 克隆代码

```bash
cd /var/www
git clone <你的仓库地址> app
cd app
```

### 3. 修改配置

编辑 `docker-compose.yml`，修改以下环境变量：

```yaml
environment:
    - NEXT_PUBLIC_BASE_URL=https://你的域名
    - SMTP_USER=你的邮箱
    - SMTP_PASS=你的授权码
```

### 4. 构建并启动

```bash
# 构建并启动所有服务
docker compose up -d --build

# 初始化数据库（首次部署）
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

### 5. 常用命令

| 操作     | 命令                                       |
| -------- | ------------------------------------------ |
| 查看状态 | `docker compose ps`                        |
| 查看日志 | `docker compose logs -f app`               |
| 重启应用 | `docker compose restart app`               |
| 更新部署 | `git pull && docker compose up -d --build` |

---

## 方式二：传统部署（Node.js + PM2）

### 1. 安装依赖

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm
npm install -g pnpm

# PM2
npm install -g pm2
```

### 2. 启动数据库

```bash
docker compose up -d postgres redis
```

### 3. 部署应用

```bash
pnpm install
pnpm dbg
pnpm dbmd
pnpm build
pm2 start npm --name "app" -- start
```

---

## Nginx 配置

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```
