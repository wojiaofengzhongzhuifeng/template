# 新项目部署清单

使用此模板部署新应用时，按以下步骤操作：

---

## 1. 环境配置

```bash
cp .env.example .env
```

修改 `.env` 中以下属性：

| 属性                   | 说明                                       |
| ---------------------- | ------------------------------------------ |
| `DATABASE_URL`         | 数据库连接字符串（如需修改密码或数据库名） |
| `NEXT_PUBLIC_BASE_URL` | 你的域名，如 `https://example.com`         |
| `SMTP_USER`            | 发件邮箱                                   |
| `SMTP_PASS`            | 邮箱授权码                                 |

---

## 2. 数据库

如需修改数据模型，编辑 `prisma/schema.prisma`，然后执行：

```bash
pnpm dbm   # 迁移
pnpm dbg   # 生成客户端
```

---

## 3. 启动

```bash
# 开发环境
docker compose up -d postgres redis
pnpm dev

# 生产环境
docker compose up -d --build
```
