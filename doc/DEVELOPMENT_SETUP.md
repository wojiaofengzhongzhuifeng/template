# 开发环境搭建指南

本文档详细说明了如何在新的开发机上快速搭建项目开发环境。

---

## 📋 目录

- [环境要求](#环境要求)
- [软件安装](#软件安装)
- [数据库和缓存安装](#数据库和缓存安装)
- [项目初始化](#项目初始化)
- [启动开发服务器](#启动开发服务器)
- [验证环境](#验证环境)
- [常见问题](#常见问题)

---

## 🔧 环境要求

| 依赖       | 最低版本 | 推荐版本 | 说明              |
| ---------- | -------- | -------- | ----------------- |
| Node.js    | 20.0.0   | 20.x LTS | JavaScript 运行时 |
| pnpm       | 8.0.0    | 9.x      | 包管理器（推荐）  |
| PostgreSQL | 16       | 16.x     | 数据库            |
| Redis      | 7        | 7.x      | 缓存和队列        |
| Git        | 2.0.0    | 最新版   | 版本控制工具      |

---

## 💻 软件安装

### 1. 安装 Node.js

**macOS（推荐使用 Homebrew）**：

```bash
# 安装 Homebrew（如果尚未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js LTS
brew install node

# 验证安装
node -v  # 应显示 v20.x.x
npm -v
```

**Ubuntu/Debian**：

```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v
npm -v
```

**Windows**：

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载并安装 LTS 版本（推荐 20.x）
3. 验证安装：打开命令提示符，运行 `node -v`

### 2. 安装 pnpm

```bash
# 使用 npm 全局安装
npm install -g pnpm

# 验证安装
pnpm -v  # 应显示 9.x.x
```

### 3. 安装 Git

**macOS**：

```bash
# Xcode 命令行工具包含 Git
xcode-select --install

# 或使用 Homebrew
brew install git
```

**Ubuntu/Debian**：

```bash
sudo apt update
sudo apt install -y git

# 验证安装
git --version
```

**Windows**：

1. 访问 [Git 官网](https://git-scm.com/downloads)
2. 下载并安装 Windows 版本
3. 安装时选择 "Use Git from the Windows Command Prompt"

---

## 🐳 安装数据库和缓存（推荐使用 Docker）

### 1. 安装 Docker

**macOS**：

```bash
# 下载并安装 Docker Desktop for Mac
# 访问 https://www.docker.com/products/docker-desktop/

# 或使用 Homebrew 安装命令行版本
brew install --cask docker

# 验证安装
docker --version
docker-compose --version
```

**Ubuntu/Debian**：

```bash
# 卸载旧版本
sudo apt remove docker docker-engine docker.io containerd runc

# 安装依赖
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置 Docker 仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到 docker 组（避免每次使用 sudo）
sudo usermod -aG docker $USER

# 验证安装
docker --version
docker compose version
```

**Windows**：

1. 访问 [Docker 官网](https://www.docker.com/products/docker-desktop/)
2. 下载并安装 Docker Desktop for Windows
3. 确保 WSL 2 已启用
4. 重启电脑
5. 打开 PowerShell 或命令提示符，验证安装：

```bash
docker --version
docker compose version
```

### 2. 创建 Docker Compose 配置

在项目根目录创建 `docker-compose.dev.yml` 文件：

```yaml
version: '3.8'

services:
    # PostgreSQL 数据库
    postgres:
        image: postgres:16-alpine
        container_name: next-hono-postgres-dev
        restart: unless-stopped
        environment:
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: postgres123
            POSTGRES_DB: app-01
        ports:
            - '5432:5432'
        volumes:
            - postgres_dev_data:/var/lib/postgresql/data
        healthcheck:
            test: ['CMD-SHELL', 'pg_isready -U postgres']
            interval: 10s
            timeout: 5s
            retries: 5
        networks:
            - dev-network

    # Redis 缓存和队列
    redis:
        image: redis:7-alpine
        container_name: next-hono-redis-dev
        restart: unless-stopped
        command: redis-server --appendonly yes
        ports:
            - '6379:6379'
        volumes:
            - redis_dev_data:/data
        healthcheck:
            test: ['CMD', 'redis-cli', 'ping']
            interval: 10s
            timeout: 5s
            retries: 5
        networks:
            - dev-network

volumes:
    postgres_dev_data:
        driver: local
    redis_dev_data:
        driver: local

networks:
    dev-network:
        driver: bridge
```

### 3. 启动 Docker 服务

```bash
# 启动 PostgreSQL 和 Redis 服务
docker-compose -f docker-compose.dev.yml up -d

# 查看服务状态
docker-compose -f docker-compose.dev.yml ps

# 查看服务日志
docker-compose -f docker-compose.dev.yml logs -f
```

### 4. 验证服务运行

```bash
# 验证 PostgreSQL
docker exec -it next-hono-postgres-dev psql -U postgres -d app-01 -c "SELECT version();"

# 验证 Redis
docker exec -it next-hono-redis-dev redis-cli ping
# 应返回 PONG

# 查看 PostgreSQL 日志
docker-compose -f docker-compose.dev.yml logs postgres

# 查看 Redis 日志
docker-compose -f docker-compose.dev.yml logs redis
```

### 5. Docker 服务管理

```bash
# 停止服务
docker-compose -f docker-compose.dev.yml stop

# 启动服务
docker-compose -f docker-compose.dev.yml start

# 重启服务
docker-compose -f docker-compose.dev.yml restart

# 停止并删除容器
docker-compose -f docker-compose.dev.yml down

# 停止并删除容器和数据卷（慎用！）
docker-compose -f docker-compose.dev.yml down -v

# 查看所有容器
docker ps -a

# 查看所有镜像
docker images

# 清理未使用的资源
docker system prune
```

### 6. 进入容器进行调试

```bash
# 进入 PostgreSQL 容器
docker exec -it next-hono-postgres-dev psql -U postgres -d app-01

# 在容器内执行 SQL 命令
\dt  # 查看所有表
\q   # 退出

# 进入 Redis 容器
docker exec -it next-hono-redis-dev redis-cli

# 在容器内执行 Redis 命令
ping  # 应返回 PONG
keys *  # 查看所有键
exit  # 退出
```

---

## 🚀 项目初始化

### 1. 克隆项目

```bash
# 克隆项目仓库
git clone <your-repo-url>
cd next-hono-template

# 或使用 SSH（如果配置了 SSH 密钥）
git clone git@github.com:username/repo.git
cd next-hono-template
```

### 2. 安装项目依赖

```bash
# 安装所有依赖
pnpm install

# 验证依赖安装
pnpm list --depth=0
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
```

编辑 `.env` 文件，配置以下关键变量：

```env
# 数据库配置（Docker 开发环境）
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/app-01"

# Redis 配置（Docker 开发环境）
REDIS_HOST="localhost"
REDIS_PORT="6379"

# 应用配置
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_API_PATH="/api"

# 智谱 AI API Key（从 https://open.bigmodel.cn/ 获取）
ZHIPU_API_KEY="your-zhipu-api-key"

# 邮件配置（用于发送验证码，可选）
SMTP_HOST="smtp.qq.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="your-email@qq.com"
SMTP_PASS="your-smtp-authorization-code"
```

**注意事项**：

- `DATABASE_URL` 中的 `postgres` 是 Docker 容器内的 PostgreSQL 用户名，`postgres123` 是密码（可在 `docker-compose.dev.yml` 中修改）
- Docker 已将 PostgreSQL 的 5432 端口映射到主机的 5432 端口，所以使用 `localhost:5432` 连接
- `ZHIPU_API_KEY` 需要在智谱 AI 平台注册并申请
- QQ 邮箱需要在设置中生成授权码（不是登录密码）

### 4. 确认数据库创建

**使用 Docker Compose 自动创建数据库**：

如果 `docker-compose.dev.yml` 配置正确，PostgreSQL 容器启动时会自动创建 `app-01` 数据库（`POSTGRES_DB` 环境变量指定）。

**手动验证数据库**：

```bash
# 使用 Docker 命令验证
docker exec -it next-hono-postgres-dev psql -U postgres -d app-01 -c "SELECT current_database();"

# 应输出：current_database
# ------------------
#  app-01
```

### 5. 运行数据库迁移

```bash
# 创建迁移文件（首次搭建可跳过）
pnpm dbmc

# 运行迁移
pnpm dbm

# 生成 Prisma 客户端
pnpm dbg

# 可选：填充测试数据
pnpm dbs

# 一次性执行所有操作
pnpm dball
```

验证迁移：

```bash
# 查看数据库表
psql -U postgres -d app-01 -c "\dt"

# 应看到 User、Count 等表
```

---

## ▶️ 启动开发服务器

### 1. 启动 Docker 服务（数据库和 Redis）

确保 Docker Desktop 或 Docker Engine 正在运行，然后启动数据库和 Redis 服务：

```bash
# 启动开发环境的 Docker 服务
docker-compose -f docker-compose.dev.yml up -d

# 查看服务状态
docker-compose -f docker-compose.dev.yml ps

# 应看到类似输出：
# NAME                          STATUS         PORTS
# next-hono-postgres-dev        Up 10 seconds  0.0.0.0:5432->5432/tcp
# next-hono-redis-dev            Up 10 seconds  0.0.0.0:6379->6379/tcp

# 查看服务日志（可选）
docker-compose -f docker-compose.dev.yml logs -f
```

### 2. 启动开发服务器

```bash
# 启动开发服务器
pnpm dev

# 应看到类似输出：
# ✓ Ready in 3.5s
# ○ Local:        http://localhost:3000
# ○ Network:      http://192.168.x.x:3000
```

### 3. 访问应用

打开浏览器，访问以下地址：

- **应用主页**: http://localhost:3000
- **API 文档（Scalar）**: http://localhost:3000/api/docs
- **Swagger UI**: http://localhost:3000/api/swagger
- **OpenAPI JSON**: http://localhost:3000/api/data
- **Prisma Studio**: 运行 `pnpm dbo` 后访问 http://localhost:5555

---

## ✅ 验证环境

### 1. 验证所有服务运行

```bash
# 检查 Node.js
node -v

# 检查 pnpm
pnpm -v

# 检查 PostgreSQL
psql --version

# 检查 Redis
redis-cli ping

# 检查 Git
git --version
```

### 2. 验证数据库连接

```bash
# 使用 Docker 命令验证
docker exec -it next-hono-postgres-dev psql -U postgres -d app-01 -c "\dt"

# 应看到以下表（迁移后）：
# - User
# - Session
# - Account
# - Count
# - ...

# 退出
\q
```

### 3. 验证 Redis 连接

```bash
# 使用 Docker 命令验证
docker exec -it next-hono-redis-dev redis-cli ping

# 应返回：PONG

# 查看所有键（可选）
docker exec -it next-hono-redis-dev redis-cli keys *

# 退出
exit
```

### 4. 验证应用运行

```bash
# 访问健康检查端点
curl http://localhost:3000/api/health

# 应返回：{"status":"ok"}
```

### 5. 运行测试和代码检查

```bash
# 运行 ESLint
pnpm lint

# 运行类型检查
pnpm typecheck

# 如果有测试，运行测试
pnpm test
```

---

## 🐛 常见问题

### 1. 端口被占用

**问题**：

```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决**：

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# 或修改 .env 文件中的 PORT
PORT=3001
```

### 2. 数据库连接失败

**问题**：

```
Error: connection refused at localhost:5432
```

**解决**：

```bash
# 检查 Docker 容器是否运行
docker ps | grep postgres

# 如果没有运行，启动 Docker 服务
docker-compose -f docker-compose.dev.yml up -d

# 检查 PostgreSQL 日志
docker logs next-hono-postgres-dev

# 检查端口映射
docker ps --filter name=postgres

# 确认 .env 中的 DATABASE_URL 配置正确
# DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/app-01"
```

### 3. Redis 连接失败

**问题**：

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**解决**：

```bash
# 检查 Redis 容器是否运行
docker ps | grep redis

# 如果没有运行，启动 Docker 服务
docker-compose -f docker-compose.dev.yml up -d

# 检查 Redis 日志
docker logs next-hono-redis-dev

# 测试连接
docker exec -it next-hono-redis-dev redis-cli ping
# 应返回 PONG
```

### 4. pnpm install 失败

**问题**：

```
Error: Cannot find module '.../node_modules/...'
```

**解决**：

```bash
# 清理缓存和重新安装
rm -rf node_modules
rm -rf .next
rm -rf pnpm-lock.yaml
pnpm install

# 如果仍有问题，更新 pnpm
npm install -g pnpm@latest
```

### 5. 数据库迁移失败

**问题**：

```
Error: P3006
Migration failed to apply
```

**解决**：

```bash
# 重置数据库（慎用！会删除所有数据）
pnpm dbmr

# 或手动删除数据库后重新创建
psql -U postgres -c "DROP DATABASE \"app-01\";"
psql -U postgres -c "CREATE DATABASE \"app-01\";"
pnpm dbm
pnpm dbg
```

### 6. Prisma 客户端未生成

**问题**：

```
Error: @prisma/client did not initialize yet
```

**解决**：

```bash
# 生成 Prisma 客户端
pnpm dbg

# 如果仍失败，清理后重新生成
rm -rf src/database/generated
pnpm dbg
```

### 7. 邮件验证码发送失败

**问题**：用户注册时无法发送验证码

**解决**：

- 检查 `.env` 中的 SMTP 配置
- QQ 邮箱需要在设置中生成授权码（不是登录密码）
- 测试 SMTP 连接：

```bash
# macOS/Linux
telnet smtp.qq.com 465

# Windows（使用 PowerShell）
Test-NetConnection -ComputerName smtp.qq.com -Port 465
```

### 8. AI 接口调用失败

**问题**：

```
Error: Zhipu API Key 未配置 或 余额不足
```

**解决**：

- 在 `.env` 中配置有效的 `ZHIPU_API_KEY`
- 登录 https://open.bigmodel.cn/ 检查账户余额
- 检查网络是否可以访问 `https://open.bigmodel.cn`

---

## 📚 快速命令参考

| 命令         | 说明                                 |
| ------------ | ------------------------------------ |
| `pnpm dev`   | 启动开发服务器                       |
| `pnpm build` | 构建生产版本                         |
| `pnpm lint`  | 运行 ESLint 和 Stylelint（自动修复） |
| `pnpm dbg`   | 生成 Prisma 客户端                   |
| `pnpm dbm`   | 运行数据库迁移                       |
| `pnpm dbs`   | 填充测试数据                         |
| `pnpm dbo`   | 打开 Prisma Studio（数据库图形界面） |
| `pnpm dball` | 依次运行迁移 + 生成客户端 + 种子数据 |

---

## 🔗 相关文档

- [部署指南](./DEPLOYMENT.md)
- [后端接口创建指南](./backend-api-creation-guide.md)
- [数据管理架构文档](./data-management.md)
- [React 业务组件开发指南](./react-component-development-guide.md)

---

## 📞 技术支持

如遇到其他问题，请：

1. 检查上述常见问题排查
2. 查看项目 Issue 页面
3. 联系项目维护者
4. 提供详细的错误日志和环境信息

---

## ✨ 快速开始清单

完成以下步骤后，开发环境即可正常运行：

- [ ] Node.js 20.x 已安装
- [ ] pnpm 9.x 已安装
- [ ] Docker 已安装并运行
- [ ] `docker-compose.dev.yml` 已创建
- [ ] Docker 服务已启动（`docker-compose -f docker-compose.dev.yml up -d`）
- [ ] 项目已克隆到本地
- [ ] 项目依赖已安装（`pnpm install`）
- [ ] 环境变量已配置（`.env` 文件）
- [ ] 数据库已通过 Docker 创建（`app-01`）
- [ ] 数据库迁移已运行（`pnpm dbm`）
- [ ] Prisma 客户端已生成（`pnpm dbg`）
- [ ] 开发服务器已启动（`pnpm dev`）
- [ ] 应用可访问（http://localhost:3000）
- [ ] API 文档可访问（http://localhost:3000/api/docs）
- [ ] PostgreSQL 容器运行正常（`docker ps | grep postgres`）
- [ ] Redis 容器运行正常（`docker ps | grep redis`）
