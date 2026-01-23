# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个 **Next.js + Hono** 全栈应用，技术栈包括：
- **前端**: Next.js 16.1.1 + React 19，使用 App Router
- **后端**: Hono 4.11.1 提供 API 层，集成 OpenAPI/Swagger 文档
- **数据库**: PostgreSQL + Prisma 7.2.0 ORM
- **样式**: Tailwind CSS v4，使用新的 `@tailwind` 指令
- **认证**: BetterAuth 1.4.7 用户管理
- **状态管理**: Zustand 客户端状态管理

## 常用开发命令

### 开发与构建
```bash
pnpm dev          # 启动开发服务器（清理 .next，使用 webpack）
pnpm build        # 构建生产版本（standalone 输出）
pnpm start        # 启动生产服务器
```

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

### 代码质量
```bash
pnpm lint         # 运行 ESLint 和 Stylelint（自动修复）
pnpm lint:es      # 仅运行 ESLint
pnpm lint:style   # 仅运行 Stylelint
```

### UI 组件
```bash
pnpm addsc        # 添加新的 shadcn/ui 组件
```

## 架构设计

### 项目结构

```
src/
├── app/                    # Next.js App Router
│   └── (pages)/           # 路由组
├── api/                   # API 客户端层（类型安全的 Hono 客户端）
├── config/                # 配置文件（auth, redis, queue, mail）
├── database/              # 数据库层
│   ├── extensions/        # 自定义 Prisma 扩展
│   ├── migrations/        # 基于时间戳的迁移文件
│   └── schema/            # Prisma schema 定义
│       ├── schema.prisma  # 主 Prisma 配置（指向 models/）
│       └── models/        # 独立的模型文件 (*.prisma)
├── libs/                  # 共享工具函数
├── server/                # Hono API 后端
│   ├── common/            # 共享工具、中间件、schemas
│   ├── user/              # 认证和用户管理
│   ├── post/              # 博客文章操作
│   ├── category/          # 分类管理
│   ├── tag/               # 标签管理
│   └── count/             # 计数器操作
└── styles/                # 全局样式（Tailwind CSS v4）
```

### 后端 API 结构

`src/server/` 中的每个领域文件夹遵循以下模式：
- `schema.ts` - 带有 OpenAPI 元数据的 Zod 验证 schema
- `routes.ts` - Hono 路由定义
- `service.ts` - 业务逻辑层
- `type.ts` - TypeScript 类型定义
- `constants.ts` - 路由路径和常量

**示例**: `src/server/count/` 包含所有计数器相关的后端逻辑。

### API 文档

API 自动生成 OpenAPI 文档：
- Swagger UI: `http://localhost:3000/api/swagger`
- Scalar 文档: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/data`

### 数据库 Schema 组织

**重要**: Prisma 模型被拆分为独立文件，存放在 `src/database/schema/models/`：
- `user.prisma` - User, Session, Account, Verification 模型
- `post.prisma` - 博客文章模型
- `category.prisma` - 分类模型
- `tag.prisma` - 标签模型
- `count.prisma` - 计数器模型

主 schema 文件位于项目根目录的 `prisma/schema.prisma`，它引用这些文件并将客户端生成到 `src/database/generated/`。

添加新模型时：
1. 在 `src/database/schema/models/` 创建新的 `.prisma` 文件
2. 运行 `pnpm dbmc` 创建迁移
3. 运行 `pnpm dbm` 应用迁移
4. 运行 `pnpm dbg` 重新生成 Prisma 客户端

### 前后端通信

API 层使用 Hono 的类型安全客户端：
1. 后端路由定义在 `src/server/*/routes.ts`
2. 路由在 `src/server/main.ts` 中注册
3. 前端在 `src/api/` 中使用 Hono 的 `hc()` 工具创建类型安全客户端

示例：`src/api/count.ts` 为计数器操作提供类型化客户端。

## 核心模式与约定

### 1. 模块化路由设计
每个领域（user, post, category, tag, count）都是自包含的模块，拥有自己的路由、schema、服务和类型。

### 2. Zod Schema 注册表
项目在模块加载时清除 Zod 注册表以修复 Next.js HMR 问题。这在 `src/server/main.ts` 中通过导入 `./common/zod-registry` 处理。

### 3. OpenAPI 集成
所有 API 端点使用 `hono-openapi` 自动生成文档。Zod schema 包含 OpenAPI 元数据以提供完整的 API 文档。

### 4. 认证流程
- BetterAuth 处理用户会话
- `src/server/user/` 中的自定义中间件用于路由保护
- JWT 风格的会话管理，使用 Redis 缓存

### 5. 数据库模式
- 基于用户的数据所有权（实体通过 `userId` 属于用户）
- 自定义 Prisma 扩展用于嵌套操作和截断
- 适当的软删除模式

### 6. 错误处理
- 结构化的错误响应，格式一致
- Zod 验证配合自定义错误处理器
- 正确的 HTTP 状态码

### 7. 环境变量
必需的环境变量：
- `DATABASE_URL` - PostgreSQL 连接字符串
- `NEXT_PUBLIC_BASE_URL` - 应用基础 URL
- `NEXT_PUBLIC_API_PATH` - API 路径前缀
- Redis 配置（用于缓存/队列）
- 邮件服务凭证（阿里云或腾讯云）

## 开发工作流

### 添加新功能

1. **后端**：
   - 在 `src/server/` 创建新文件夹（如 `src/server/myfeature/`）
   - 添加 `schema.ts`, `routes.ts`, `service.ts`, `type.ts`, `constants.ts`
   - 在 `src/server/main.ts` 注册路由

2. **数据库**（如需要）：
   - 在 `src/database/schema/models/myfeature.prisma` 创建模型文件
   - 运行 `pnpm dbmc` → `pnpm dbm` → `pnpm dbg`

3. **前端**：
   - 在 `src/api/myfeature.ts` 创建 API 客户端
   - 在 `src/app/(pages)/myfeature/` 添加页面
   - 如需要，使用 Zustand 进行状态管理

### 代码规范

- 提交前运行 `pnpm lint`
- 遵循现有文件命名约定
- 使用 TypeScript 严格模式（已启用）
- 客户端组件使用 `'use client'` 指令标记
- 使用 Tailwind CSS v4 的 `@tailwind` 指令

## 重要说明

- 项目使用 **webpack** 而非 Turbopack（参见 dev/build 脚本中的 `--webpack` 标志）
- Prisma 客户端生成到 `src/database/generated/`（而非 node_modules）
- Zod schema 必须有唯一 ID 以避免注册表冲突
- API 路由按领域组织和版本化
- 所有数据库操作应通过 service 层
- Redis 与 BullMQ 用于缓存和队列管理
