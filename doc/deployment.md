# 服务器部署指南

---

## 一、首次部署（服务器初始化）

> 以下步骤只需在新服务器上执行一次。

### 1. 安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

重新登录使权限生效。

### 2. 配置 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "你的邮箱"
cat ~/.ssh/id_ed25519.pub
```

将公钥添加到 [GitHub SSH 设置](https://github.com/settings/keys)。

### 3. 创建应用目录

```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
```

---

## 二、部署新应用

> 每次部署新应用（app-01、app-02...）执行以下步骤。

### 1. 克隆代码

```bash
cd /var/www
git clone git@github.com:你的用户名/你的仓库.git app-01
cd app-01
```

### 2. 配置环境变量

```bash
cp .env.example .env
nano .env
```

修改以下内容：

| 变量                   | 本地开发                 | Docker 部署             |
| ---------------------- | ------------------------ | ----------------------- |
| `POSTGRES_DB`          | `app-01`                 | `app-01`                |
| `DATABASE_URL`         | `...@localhost:5432/...` | `...@postgres:5432/...` |
| `REDIS_HOST`           | `localhost`              | `redis`                 |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000`  | `http://服务器IP:3001`  |
| `SMTP_USER`            | -                        | 你的邮箱                |
| `SMTP_PASS`            | -                        | 邮箱授权码              |

### 3. 修改端口（避免多应用冲突）

编辑 `docker-compose.yml`，修改端口：

```yaml
ports:
    - '3001:3000' # app-01 用 3001，app-02 用 3002
```

### 4. 启动应用

```bash
docker compose up -d --build
```

> 如果报错 `unknown shorthand flag`，说明 Docker 版本较旧，使用 `docker-compose up -d --build`（带连字符）

### 5. 初始化数据库（首次）

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

---

## 三、常用命令

| 操作     | 命令                                       |
| -------- | ------------------------------------------ |
| 查看状态 | `docker compose ps`                        |
| 查看日志 | `docker compose logs -f app`               |
| 重启应用 | `docker compose restart app`               |
| 更新部署 | `git pull && docker compose up -d --build` |

---

## 四、多应用端口规划

| 应用   | 端口 |
| ------ | ---- |
| app-01 | 3001 |
| app-02 | 3002 |
| app-03 | 3003 |
