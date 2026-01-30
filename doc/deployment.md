# Next.js + Hono 项目部署指南

## 📋 项目概述

这是一个基于 Next.js 16 + Hono 4 的全栈应用，技术栈包括：

- **前端**: Next.js 16.1.1 + React 19，使用 App Router
- **后端**: Hono 4.11.1 提供 API 层，集成 OpenAPI/Swagger 文档
- **数据库**: PostgreSQL 16 + Prisma 7.2.0 ORM
- **缓存**: Redis 7（用于缓存和队列）
- **认证**: BetterAuth 1.4.7 用户管理
- **样式**: Tailwind CSS v4
- **包管理器**: pnpm

## 🔧 环境要求

| 依赖           | 版本要求  | 说明              |
| -------------- | --------- | ----------------- |
| Node.js        | >= 20.0.0 | 推荐使用 LTS 版本 |
| pnpm           | >= 8.0.0  | 包管理器          |
| Docker         | >= 20.0.0 | Docker 部署需要   |
| Docker Compose | >= 2.0.0  | Docker 部署需要   |

---

## 🚀 方式一：本地开发（推荐用于开发）

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd next-hono-template
```

### 2. 安装依赖

```bash
# 安装 pnpm（如果尚未安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

修改 `.env` 文件中的关键配置：

```env
# 数据库配置
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/app-01"

# Redis 配置
REDIS_HOST="localhost"
REDIS_PORT="6379"

# 应用配置
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_API_PATH="/api"

# 智谱 AI API Key
ZHIPU_API_KEY="your-zhipu-api-key"

# 邮件配置（用于发送验证码）
SMTP_HOST="smtp.qq.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="your-email@qq.com"
SMTP_PASS="your-smtp-password"
```

### 4. 安装 PostgreSQL 和 Redis

**macOS**:

```bash
# 使用 Homebrew
brew install postgresql@16 redis
brew services start postgresql@16
brew services start redis
```

**Ubuntu/Debian**:

```bash
sudo apt update
sudo apt install -y postgresql-16 redis-server
sudo systemctl start postgresql
sudo systemctl start redis
```

**Windows**:

- 下载并安装 PostgreSQL: https://www.postgresql.org/download/
- 下载并安装 Redis: https://redis.io/docs/install/install-redis/

### 5. 初始化数据库

```bash
# 创建数据库
createdb -U postgres app-01

# 运行迁移
pnpm dbm

# 生成 Prisma 客户端
pnpm dbg

# 可选：填充测试数据
pnpm dbs
```

### 6. 启动开发服务器

```bash
pnpm dev
```

访问应用：

- 应用主页: http://localhost:3000
- API 文档: http://localhost:3000/api/docs
- Swagger UI: http://localhost:3000/api/swagger

---

## 🐳 方式二：Docker 部署（推荐用于生产）

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd next-hono-template
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

修改 `.env` 文件：

```env
# Docker 环境下的数据库配置（注意：主机名改为 postgres）
DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/app-01"

# Docker 环境下的 Redis 配置（注意：主机名改为 redis）
REDIS_HOST="redis"
REDIS_PORT="6379"

# 应用配置（将端口改为 3001）
NEXT_PUBLIC_BASE_URL="http://localhost:3001"
NEXT_PUBLIC_API_PATH="/api"

# 智谱 AI API Key
ZHIPU_API_KEY="your-zhipu-api-key"

# 邮件配置
SMTP_HOST="smtp.qq.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="your-email@qq.com"
SMTP_PASS="your-smtp-password"
```

### 3. 启动 Docker Compose

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止所有服务
docker-compose down

# 停止并删除数据卷（慎用）
docker-compose down -v
```

### 4. 初始化数据库

```bash
# 等待 PostgreSQL 容器健康后，在容器外运行迁移
docker-compose exec app pnpm dbm

# 生成 Prisma 客户端
docker-compose exec app pnpm dbg

# 可选：填充测试数据
docker-compose exec app pnpm dbs
```

### 5. 访问应用

- 应用主页: http://localhost:3001
- API 文档: http://localhost:3001/api/docs
- Swagger UI: http://localhost:3001/api/swagger

---

## 📝 常用命令

### 数据库操作

```bash
pnpm dbg          # 生成 Prisma 客户端（开发环境）
pnpm dbp          # 推送 schema 变更到数据库
pnpm dbmc         # 创建新迁移
pnpm dbm          # 运行迁移（开发环境）
pnpm dbmr         # 强制重置迁移
pnpm dbmd         # 部署迁移（生产环境）
pnpm dbs          # 使用测试数据种子数据库
pnpm dbo          # 打开 Prisma Studio
pnpm dball        # 依次运行迁移 + 生成客户端 + 种子数据
```

### 开发与构建

```bash
pnpm dev          # 启动开发服务器（清理 .next，使用 webpack）
pnpm build        # 构建生产版本（standalone 输出）
pnpm start        # 启动生产服务器
```

### 代码质量

```bash
pnpm lint         # 运行 ESLint 和 Stylelint（自动修复）
pnpm lint:es      # 仅运行 ESLint
pnpm lint:style   # 仅运行 Stylelint
pnpm typecheck    # TypeScript 类型检查
```

---

## 🔐 API 文档

项目提供两种 API 文档方式：

### 1. Scalar 文档（推荐，现代化界面）

访问: `http://localhost:3000/api/docs`

特点：

- 现代化 UI 设计
- 支持深色模式
- 内置接口测试功能
- 自动携带登录凭证

### 2. Swagger UI

访问: `http://localhost:3000/api/swagger`

特点：

- 经典的 Swagger 界面
- 完整的 API 文档
- 支持 Try it out 功能

### 3. OpenAPI JSON

访问: `http://localhost:3000/api/data`

用途：

- 导出 OpenAPI 规范
- 集成到其他工具
- 自动生成客户端代码

---

## 🌐 Docker 部署到服务器

### 1. 准备服务器环境

确保服务器已安装：

- Docker >= 20.0.0
- Docker Compose >= 2.0.0

### 2. 上传项目文件

```bash
# 方式一：使用 git
git clone <your-repo-url>
cd next-hono-template

# 方式二：使用 scp/rsync
scp -r ./next-hono-template user@server:/path/to/app
```

### 3. 修改服务器环境变量

修改 `.env` 文件，将 `NEXT_PUBLIC_BASE_URL` 改为服务器 IP 或域名：

```env
NEXT_PUBLIC_BASE_URL="http://your-server-ip:3001"
# 或使用域名
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### 4. 启动服务

```bash
docker-compose up -d --build
```

### 5. 配置反向代理（可选）

使用 Nginx 反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. 配置 HTTPS（推荐）

使用 Let's Encrypt 和 Certbot：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 🐛 常见问题

### 1. 端口冲突

**问题**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决**:

```bash
# 查找占用端口的进程
lsof -ti:3000
# 杀死进程
kill -9 $(lsof -ti:3000)

# 或修改 .env 中的 PORT
PORT=3001
```

### 2. 数据库连接失败

**问题**: `Error: connection refused at localhost:5432`

**解决**:

- 本地开发：确保 PostgreSQL 已启动
- Docker 部署：确保 `DATABASE_URL` 中的主机名是 `postgres` 而不是 `localhost`

### 3. Prisma 客户端未生成

**问题**: `Error: @prisma/client did not initialize yet`

**解决**:

```bash
pnpm dbg
```

### 4. Docker 容器启动失败

**问题**: 容器无法启动或立即退出

**解决**:

```bash
# 查看容器日志
docker-compose logs app
docker-compose logs postgres
docker-compose logs redis

# 检查环境变量配置
docker-compose config
```

### 5. 邮件验证码发送失败

**问题**: 用户注册时无法发送验证码

**解决**:

- 检查 `.env` 中的 SMTP 配置
- 确认邮箱已开启 SMTP 服务
- QQ邮箱需要在设置中生成授权码（不是登录密码）
- 测试 SMTP 连接：

```bash
telnet smtp.qq.com 465
```

### 6. AI 接口调用失败

**问题**: `Error: Zhipu API Key 未配置` 或 `余额不足`

**解决**:

- 在 `.env` 中配置有效的 `ZHIPU_API_KEY`
- 登录 https://open.bigmodel.cn/ 检查账户余额
- 检查网络是否可以访问 `https://open.bigmodel.cn`

### 7. 需要登录的接口返回 401

**问题**: API 返回 `{"code": 401, "message": "用户未认证"}`

**解决**:

- 先调用登录接口：`POST /api/auth/sign-in/username`
- 登录成功后，Cookie 会自动保存到浏览器
- 使用 Postman 测试时，需要手动设置 Cookie 头：

```http
Cookie: better-auth.session_token=your-session-token
```

---

## 📊 监控与日志

### Docker 日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis

# 查看最近 100 行日志
docker-compose logs --tail=100 app
```

### Prisma Studio

```bash
# 本地开发
pnpm dbo

# Docker 环境
docker-compose exec app pnpm dbo
```

访问: `http://localhost:5555`

---

## 🔄 数据备份与恢复

### PostgreSQL 备份

```bash
# Docker 环境
docker-compose exec postgres pg_dump -U postgres app-01 > backup.sql

# 本地开发
pg_dump -U postgres app-01 > backup.sql
```

### PostgreSQL 恢复

```bash
# Docker 环境
docker-compose exec -T postgres psql -U postgres app-01 < backup.sql

# 本地开发
psql -U postgres app-01 < backup.sql
```

### Redis 备份

```bash
# Docker 环境
docker-compose exec redis redis-cli SAVE
docker cp app-01-redis:/data/dump.rdb ./dump.rdb
```

---

## 📚 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [Hono 文档](https://hono.dev/)
- [Prisma 文档](https://www.prisma.io/docs)
- [BetterAuth 文档](https://www.better-auth.com/)
- [Docker 文档](https://docs.docker.com/)
- [智谱 AI 文档](https://open.bigmodel.cn/dev/api)

---

## 📞 技术支持

如遇到问题，请检查：

1. Docker 日志: `docker-compose logs`
2. 应用日志: 终端输出
3. API 文档: http://localhost:3000/api/docs

或联系项目维护者。

---

## 📝 更新日志

### v1.0.0 (当前版本)

- 初始版本发布
- 集成 Next.js + Hono 全栈架构
- 完整的用户认证系统
- AI 儿童绘本生成功能
- OpenAPI/Swagger 自动文档生成
- Docker 一键部署支持
