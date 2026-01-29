# 后端接口创建指南

本文档以 `count` 接口为例，详细说明如何创建完整的后端 API 接口。

## 目录结构概览

创建一个后端接口需要在以下目录中创建/修改文件：

```
src/
├── database/schema/models/       # 数据库模型定义
│   └── count.prisma
├── server/                      # 后端实现
│   └── count/
│       ├── constants.ts         # 路由路径常量
│       ├── schema.ts            # Zod 验证 schema
│       ├── type.ts              # TypeScript 类型定义
│       ├── service.ts           # 业务逻辑层
│       └── routes.ts            # Hono 路由定义
├── api/                         # 前端 API 客户端
│   └── count.ts                 # 类型安全的 Hono 客户端
└── server/
    └── main.ts                  # 注册路由到主应用
```

## 创建步骤详解

### 步骤 1：定义数据库模型

在 `src/database/schema/models/count.prisma` 中定义 Prisma 模型：

```prisma
model Count {
    id        String   @id @default(uuid())
    number    Int      @default(0)
    isPublic  Boolean  @default(false) @map("is_public")
    userId    String
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    createdAt DateTime @default(now())
    updatedAt DateTime @default(now()) @updatedAt

    @@map("count")
}
```

**注意事项**：

- 使用 `@map` 映射数据库列名（如 `isPublic` → `is_public`）
- 包含 `userId` 关联用户（数据所有权）
- 添加 `createdAt` 和 `updatedAt` 时间戳
- 使用 `@relation` 关联 User 模型

**数据库操作**：

```bash
pnpm dbmc    # 创建迁移文件
pnpm dbm     # 运行迁移
pnpm dbg     # 重新生成 Prisma 客户端
```

---

### 步骤 2：创建常量文件

在 `src/server/count/constants.ts` 中定义路由路径：

```typescript
export const countPath = '/counts';
```

---

### 步骤 3：定义验证 Schema

在 `src/server/count/schema.ts` 中定义 Zod 验证 schema：

```typescript
import z from 'zod';

/**
 * Count ID 请求参数
 */
export const countIdParamsSchema = z.object({
    id: z.string().meta({ description: 'Count ID' }),
});

/**
 * Count 创建请求数据结构
 */
export const countCreateSchema = z
    .object({
        number: z.number().int().default(0).meta({ description: '计数值' }),
        isPublic: z.boolean().default(false).meta({ description: '是否公开' }),
    })
    .meta({ $id: 'CountCreate', description: '创建 Count 请求数据' });

/**
 * Count 更新请求数据结构
 */
export const countUpdateSchema = z
    .object({
        number: z.number().int().optional().meta({ description: '计数值' }),
        isPublic: z.boolean().optional().meta({ description: '是否公开' }),
    })
    .meta({ $id: 'CountUpdate', description: '更新 Count 请求数据' });

/**
 * Count 响应数据结构
 */
export const countSchema = z
    .object({
        id: z.string(),
        number: z.number().int(),
        isPublic: z.boolean(),
        userId: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .meta({ $id: 'Count', description: 'Count 详情数据' });

/**
 * Count 列表响应数据结构
 */
export const countListSchema = z
    .array(countSchema)
    .meta({ $id: 'CountList', description: 'Count 列表数据' });
```

**注意事项**：

- 每个 schema 必须有唯一的 `$id`（用于 OpenAPI 文档生成）
- 使用 `.meta()` 添加 OpenAPI 描述信息
- 更新字段使用 `.optional()` 标记可选
- 创建字段使用 `.default()` 设置默认值

---

### 步骤 4：定义 TypeScript 类型

在 `src/server/count/type.ts` 中从 Zod schema 推断类型：

```typescript
import type { z } from 'zod';

import type { countRoutes } from './routes';
import type {
    countCreateSchema,
    countIdParamsSchema,
    countListSchema,
    countSchema,
    countUpdateSchema,
} from './schema';

/**
 * Count ID 请求参数类型
 */
export type CountIdParams = z.infer<typeof countIdParamsSchema>;

/**
 * Count 创建请求类型
 */
export type CountCreate = z.infer<typeof countCreateSchema>;

/**
 * Count 更新请求类型
 */
export type CountUpdate = z.infer<typeof countUpdateSchema>;

/**
 * Count 响应数据类型
 */
export type CountItem = z.infer<typeof countSchema>;

/**
 * Count 列表响应数据类型
 */
export type CountList = z.infer<typeof countListSchema>;

/**
 * Count API 类型
 */
export type CountApiType = typeof countRoutes;
```

---

### 步骤 5：实现业务逻辑

在 `src/server/count/service.ts` 中实现数据库操作：

```typescript
'use server';

import db from '@/libs/db/client';

/**
 * 查询用户的 Count 列表
 */
export const queryCountList = async (userId: string) => {
    return await db.count.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
};

/**
 * 查询公开的 Count 列表
 */
export const queryPublicCountList = async () => {
    return await db.count.findMany({
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
    });
};

/**
 * 查询单个 Count
 */
export const queryCountItem = async (id: string, userId: string) => {
    return await db.count.findFirst({
        where: { id, userId },
    });
};

/**
 * 创建 Count
 */
export const createCount = async (
    userId: string,
    number: number = 0,
    isPublic: boolean = false,
) => {
    return await db.count.create({
        data: { userId, number, isPublic },
    });
};

/**
 * 更新 Count
 */
export const updateCount = async (
    id: string,
    userId: string,
    data: { number?: number; isPublic?: boolean },
) => {
    return await db.count.updateMany({
        where: { id, userId },
        data,
    });
};

/**
 * 删除 Count
 */
export const deleteCount = async (id: string, userId: string) => {
    return await db.count.deleteMany({
        where: { id, userId },
    });
};
```

**注意事项**：

- 使用 `'use server'` 指令标记服务端操作
- 所有数据库操作都应基于 `userId`（数据所有权）
- 更新和删除操作使用 `updateMany` 和 `deleteMany`（配合 `userId` 防止越权）

---

### 步骤 6：定义路由

在 `src/server/count/routes.ts` 中定义 Hono 路由：

```typescript
import { describeRoute, validator as zValidator } from 'hono-openapi';
import { isNil } from 'lodash';

import type { auth } from '@/libs/auth';

import { createHonoApp } from '../common/app';
import { ErrorCode } from '../common/constants';
import {
    createBusinessError,
    createErrorResult,
    defaultValidatorErrorHandler,
} from '../common/error';
import {
    createNotFoundErrorResponse,
    createServerErrorResponse,
    createSuccessResponse,
    createUnauthorizedErrorResponse,
    createValidatorErrorResponse,
} from '../common/response';
import { AuthProtectedMiddleware } from '../user/middlwares';
import {
    countCreateSchema,
    countIdParamsSchema,
    countListSchema,
    countSchema,
    countUpdateSchema,
} from './schema';
import {
    createCount,
    deleteCount,
    queryCountItem,
    queryCountList,
    queryPublicCountList,
    updateCount,
} from './service';

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
interface Env {
    Variables: {
        user: NonNullable<AuthSession>['user'];
        session: NonNullable<AuthSession>['session'];
    };
}

const app = createHonoApp<Env>();

export const countTags = ['计数操作'];

export const countRoutes = app
    // 公开的 count 列表
    .get(
        '/public',
        describeRoute({
            tags: countTags,
            summary: '公开 Count 列表查询',
            description: '查询所有公开的 Count（无需登录）',
            responses: {
                ...createSuccessResponse(countListSchema),
                ...createServerErrorResponse('查询公开 Count 列表失败'),
            },
        }),
        async (c) => {
            try {
                const result = await queryPublicCountList();
                return c.json(result, 200);
            } catch (error) {
                return c.json(createErrorResult('查询公开 Count 列表失败', error), 500);
            }
        },
    )
    // 获取用户的 count 列表
    .get(
        '/',
        describeRoute({
            tags: countTags,
            summary: 'Count 列表查询',
            description: '查询当前用户的所有 Count',
            responses: {
                ...createSuccessResponse(countListSchema),
                ...createUnauthorizedErrorResponse(),
                ...createServerErrorResponse('查询 Count 列表失败'),
            },
        }),
        AuthProtectedMiddleware,
        async (c) => {
            try {
                const user = c.get('user');
                const result = await queryCountList(user.id);
                return c.json(result, 200);
            } catch (error) {
                return c.json(createErrorResult('查询 Count 列表失败', error), 500);
            }
        },
    )
    // 获取单个 count
    .get(
        '/:id',
        describeRoute({
            tags: countTags,
            summary: 'Count 详情查询',
            description: '查询单个 Count 的详细信息',
            responses: {
                ...createSuccessResponse(countSchema),
                ...createValidatorErrorResponse(),
                ...createUnauthorizedErrorResponse(),
                ...createNotFoundErrorResponse('Count 不存在'),
                ...createServerErrorResponse('查询 Count 失败'),
            },
        }),
        zValidator('param', countIdParamsSchema, defaultValidatorErrorHandler),
        AuthProtectedMiddleware,
        async (c) => {
            try {
                const { id } = c.req.valid('param');
                const user = c.get('user');
                const result = await queryCountItem(id, user.id);
                if (!isNil(result)) return c.json(result, 200);
                return c.json(createBusinessError(ErrorCode.COUNT_NOT_FOUND, 'Count 不存在'), 200);
            } catch (error) {
                return c.json(createErrorResult('查询 Count 失败', error), 500);
            }
        },
    )
    // 创建 count
    .post(
        '/',
        describeRoute({
            tags: countTags,
            summary: '创建 Count',
            description: '创建一个新的 Count',
            responses: {
                ...createSuccessResponse(countSchema),
                ...createValidatorErrorResponse(),
                ...createUnauthorizedErrorResponse(),
                ...createServerErrorResponse('创建 Count 失败'),
            },
        }),
        zValidator('json', countCreateSchema, defaultValidatorErrorHandler),
        AuthProtectedMiddleware,
        async (c) => {
            try {
                const { number, isPublic } = c.req.valid('json');
                const user = c.get('user');
                const result = await createCount(user.id, number, isPublic);
                return c.json(result, 201);
            } catch (error) {
                return c.json(createErrorResult('创建 Count 失败'), 500);
            }
        },
    )
    // 更新 count
    .patch(
        '/:id',
        describeRoute({
            tags: countTags,
            summary: '更新 Count',
            description: '更新 Count 的数值',
            responses: {
                ...createSuccessResponse(countSchema),
                ...createValidatorErrorResponse(),
                ...createUnauthorizedErrorResponse(),
                ...createNotFoundErrorResponse('Count 不存在'),
                ...createServerErrorResponse('更新 Count 失败'),
            },
        }),
        zValidator('param', countIdParamsSchema, defaultValidatorErrorHandler),
        zValidator('json', countUpdateSchema, defaultValidatorErrorHandler),
        AuthProtectedMiddleware,
        async (c) => {
            try {
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                const user = c.get('user');
                const updateResult = await updateCount(id, user.id, data);
                if (updateResult.count === 0) {
                    return c.json(
                        createBusinessError(ErrorCode.COUNT_NOT_FOUND, 'Count 不存在'),
                        200,
                    );
                }
                const result = await queryCountItem(id, user.id);
                return c.json(result, 200);
            } catch (error) {
                return c.json(createErrorResult('更新 Count 失败', error), 500);
            }
        },
    )
    // 删除 count
    .delete(
        '/:id',
        describeRoute({
            tags: countTags,
            summary: '删除 Count',
            description: '删除一个 Count',
            responses: {
                200: {
                    description: '删除成功',
                },
                ...createUnauthorizedErrorResponse(),
                ...createNotFoundErrorResponse('Count 不存在'),
                ...createServerErrorResponse('删除 Count 失败'),
            },
        }),
        zValidator('param', countIdParamsSchema, defaultValidatorErrorHandler),
        AuthProtectedMiddleware,
        async (c) => {
            try {
                const { id } = c.req.valid('param');
                const user = c.get('user');
                const deleteResult = await deleteCount(id, user.id);
                if (deleteResult.count === 0) {
                    return c.json(
                        createBusinessError(ErrorCode.COUNT_NOT_FOUND, 'Count 不存在'),
                        200,
                    );
                }
                return c.json({ message: '删除成功' }, 200);
            } catch (error) {
                return c.json(createErrorResult('删除 Count 失败', error), 500);
            }
        },
    );
```

**路由结构说明**：

| HTTP 方法 | 路径      | 描述         | 认证 | 验证                                        |
| --------- | --------- | ------------ | ---- | ------------------------------------------- |
| GET       | `/public` | 查询公开列表 | 否   | 无                                          |
| GET       | `/`       | 查询用户列表 | 是   | 无                                          |
| GET       | `/:id`    | 查询详情     | 是   | `countIdParamsSchema`                       |
| POST      | `/`       | 创建         | 是   | `countCreateSchema`                         |
| PATCH     | `/:id`    | 更新         | 是   | `countIdParamsSchema` + `countUpdateSchema` |
| DELETE    | `/:id`    | 删除         | 是   | `countIdParamsSchema`                       |

**注意事项**：

- 使用 `describeRoute` 添加 OpenAPI 文档
- 使用 `zValidator` 进行参数验证
- 需要认证的路由添加 `AuthProtectedMiddleware`
- 路径参数使用 `:id` 格式
- 正确设置 HTTP 状态码（201 创建成功）

---

### 步骤 7：注册路由

在 `src/server/main.ts` 中注册路由：

```typescript
import { countPath } from './count/constants';
import { countRoutes } from './count/routes';

const routes = app.route(countPath, countRoutes);
```

---

### 步骤 8：创建前端 API 客户端

在 `src/api/count.ts` 中创建类型安全的 Hono 客户端：

```typescript
import type { CountApiType, CountCreate, CountUpdate } from '@/server/count/type';

import { buildClient, fetchApi } from '@/libs/hono';
import { countPath } from '@/server/count/constants';

export const countClient = buildClient<CountApiType>(countPath);

export const countApi = {
    list: async () => fetchApi(countClient, async (c) => c.index.$get()),
    publicList: async () => fetchApi(countClient, async (c) => c.public.$get()),
    detail: async (id: string) =>
        fetchApi(countClient, async (c) => c[':id'].$get({ param: { id } })),
    create: async (data: CountCreate) =>
        fetchApi(countClient, async (c) => c.index.$post({ json: data })),
    update: async (id: string, data: CountUpdate) =>
        fetchApi(countClient, async (c) => c[':id'].$patch({ param: { id }, json: data })),
    delete: async (id: string) =>
        fetchApi(countClient, async (c) => c[':id'].$delete({ param: { id } })),
};
```

**使用方式**：

```typescript
// 服务端组件（直接调用，无 HTTP 开销）
import { countApi } from '@/api/count';
const data = await countApi.list();

// 客户端组件（通过 axios，参考其他页面示例）
// 在 src/app/(pages)/(count)/api/ 创建 axios 请求函数
// 在 src/app/(pages)/(count)/hook/ 创建数据获取 hook
```

---

## API 文档访问

接口创建完成后，可以通过以下方式访问自动生成的 API 文档：

- **Swagger UI**: http://localhost:3000/api/swagger
- **Scalar 文档**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/data

---

## 完整文件清单

创建一个完整的后端接口需要创建/修改以下文件：

| 文件                                      | 说明                |
| ----------------------------------------- | ------------------- |
| `src/database/schema/models/count.prisma` | 数据库模型定义      |
| `src/server/count/constants.ts`           | 路由路径常量        |
| `src/server/count/schema.ts`              | Zod 验证 schema     |
| `src/server/count/type.ts`                | TypeScript 类型定义 |
| `src/server/count/service.ts`             | 业务逻辑层          |
| `src/server/count/routes.ts`              | Hono 路由定义       |
| `src/server/main.ts`                      | 注册路由（修改）    |
| `src/api/count.ts`                        | 前端 API 客户端     |

---

## 最佳实践

1. **数据所有权**：所有数据库操作都应基于 `userId`，防止越权访问
2. **错误处理**：使用统一的错误响应格式（`createErrorResult`、`createBusinessError`）
3. **验证优先**：所有请求参数都应通过 Zod schema 验证
4. **类型安全**：使用 Hono 的类型安全客户端，避免前后端类型不一致
5. **文档完整**：所有 API 端点都应包含 OpenAPI 元数据（`describeRoute`）
6. **中间件使用**：需要认证的路由统一使用 `AuthProtectedMiddleware`

---

## 错误码定义

在 `src/server/common/constants.ts` 中添加新的错误码：

```typescript
export enum ErrorCode {
    COUNT_NOT_FOUND = 'COUNT_NOT_FOUND',
    // ... 其他错误码
}
```
