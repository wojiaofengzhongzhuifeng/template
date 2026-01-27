# API 请求全链路文档

本文档详细说明从浏览器发起请求到后端处理并返回响应的完整流程，以 `/api/ai/beautify-story` 接口为例。

---

## 目录

- [文档概述](#文档概述)
- [请求流程总览](#请求流程总览)
- [详细请求链路](#详细请求链路)
- [错误处理链路](#错误处理链路)
- [文件职责总结](#文件职责总结)
- [关键技术点说明](#关键技术点说明)

---

## 文档概述

### 接口基础信息

- **接口路径**：`/api/ai/beautify-story`
- **请求方法**：`POST`
- **功能描述**：使用智谱 AI GLM-4-Flash 模型美化儿童故事概述
- **需要认证**：是（BetterAuth）
- **数据库存储**：否

### 技术栈

- **前端**：Next.js 16 + React 19 + Tailwind CSS v4
- **后端**：Hono 4.11.1 + OpenAPI
- **认证**：BetterAuth 1.4.7
- **HTTP 客户端**：Axios 1.13.2
- **参数验证**：Zod 4.2.1
- **外部 API**：智谱 AI GLM-4-Flash

---

## 请求流程总览

### 流程图

```
用户操作
   ↓
前端页面 (page.tsx)
   ↓
API 调用封装 (api/beautify-story.ts)
   ↓
HTTP 客户端 (config/request.ts)
   ↓
Next.js 路由
   ↓
Hono 应用 (server/main.ts)
   ↓
全局中间件 (server/common/middleware.ts)
   ↓
认证中间件 (server/user/middlwares.ts)
   ↓
路由匹配 (server/beautify-story/routes.ts)
   ↓
参数验证 (server/beautify-story/schema.ts)
   ↓
业务逻辑 (server/beautify-story/service.ts)
   ↓
外部 API 调用 (智谱 AI)
   ↓
响应处理 (server/beautify-story/routes.ts)
   ↓
统一响应格式化 (server/common/middleware.ts)
   ↓
返回前端 (page.tsx)
   ↓
UI 更新
```

### 关键节点说明

| 节点         | 职责                 | 文件                             |
| ------------ | -------------------- | -------------------------------- |
| 1. 用户交互  | 点击按钮触发请求     | page.tsx                         |
| 2. API 封装  | 封装 HTTP 请求       | api/beautify-story.ts            |
| 3. HTTP 拦截 | 添加认证头、cookie   | config/request.ts                |
| 4. Hono 入口 | 路由分发、全局中间件 | server/main.ts                   |
| 5. 认证验证  | 验证用户身份         | server/user/middlwares.ts        |
| 6. 路由处理  | 参数验证、业务逻辑   | server/beautify-story/routes.ts  |
| 7. 外部 API  | 调用智谱 GLM 模型    | server/beautify-story/service.ts |
| 8. 响应处理  | 统一响应格式         | server/common/middleware.ts      |

---

## 详细请求链路

### 阶段 1：前端发起请求

#### 文件 1：`/src/app/(pages)/count-number/page.tsx`

**职责**：用户交互界面，触发 API 调用

**关键代码**：

```typescript
'use client';

import { useState } from 'react';
import { beautifyStory } from '@/app/(pages)/count-number/api/beautify-story';

export default function CountNumberPage() {
    const [storyOverview, setStoryOverview] = useState('');
    const [childAge, setChildAge] = useState<'infant' | 'preschool' | 'early_elementary'>(
        'preschool',
    );
    const [selectedThemes, setSelectedThemes] = useState<string[]>(['emotional_education']);
    const [beautifiedStory, setBeautifiedStory] = useState<string | null>(null);
    const [beautifying, setBeautifying] = useState(false);

    const handleBeautify = async () => {
        if (!storyOverview.trim()) {
            setError('故事概述不能为空');
            return;
        }

        try {
            setBeautifying(true);
            setError(null);
            const result = await beautifyStory({
                storyOverview,
                childAge,
                themes: selectedThemes,
            });
            setBeautifiedStory(result.beautifiedStory);
        } catch (err: any) {
            setError(err.message || '美化失败');
            setBeautifiedStory(null);
        } finally {
            setBeautifying(false);
        }
    };

    // UI 渲染...
}
```

**执行流程**：

1. 用户在输入框填写故事概述
2. 选择年龄段和主题
3. 点击"开始美化"按钮
4. 触发 `handleBeautify` 函数
5. 调用 `beautifyStory({ storyOverview, childAge, themes })`
6. 等待响应，设置加载状态 `beautifying = true`
7. 收到响应后，更新状态 `beautifiedStory`
8. 渲染美化结果到页面

---

#### 文件 2：`/src/app/(pages)/count-number/api/beautify-story.ts`

**职责**：封装 HTTP 请求，提供类型安全的 API 调用

**关键代码**：

```typescript
import { http } from '@/config/request';
import type { BeautifyStoryRequest, BeautifyStoryResponse } from '@/server/beautify-story/type';

export async function beautifyStory(data: BeautifyStoryRequest): Promise<BeautifyStoryResponse> {
    const response = await http.post<BeautifyStoryResponse>('/ai/beautify-story', data);
    return response.data;
}
```

**执行流程**：

1. 接收参数 `data: BeautifyStoryRequest`
2. 调用 `http.post()` 发起 POST 请求
3. 请求路径：`/ai/beautify-story`
4. 请求体：JSON 格式
5. 返回类型：`BeautifyStoryResponse`

**类型定义**（来自 `/src/server/beautify-story/type.ts`）：

```typescript
export type BeautifyStoryRequest = z.infer<typeof beautifyStoryRequestSchema>;
export type BeautifyStoryResponse = z.infer<typeof beautifyStoryResponseSchema>;
```

---

### 阶段 2：HTTP 客户端处理

#### 文件 3：`/src/config/request.ts`

**职责**：配置 Axios 实例，添加请求/响应拦截器

**关键代码**：

```typescript
import axios from 'axios';

const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: `${appConfig.baseUrl}${appConfig.apiPath}`,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true, // 自动携带 cookie
    });

    // 请求拦截器
    instance.interceptors.request.use((config: AxiosRequestConfigExt) => {
        if (!config._skipAuth) {
            // better-auth 使用 session cookie，会自动携带
        }

        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now(), // 添加时间戳防缓存
            };
        }

        return config;
    });

    // 响应拦截器
    instance.interceptors.response.use(
        (response) => {
            const { data } = response;
            const { code, message, data: responseData } = data;

            // 业务错误（code >= 1000）
            if (code >= 1000) {
                const errorObj = new Error(message) as any;
                errorObj.code = code;
                errorObj.isBusinessError = true;
                return Promise.reject(errorObj);
            }

            // HTTP 错误（code != 0）
            if (code !== 0) {
                const errorObj = new Error(message) as any;
                errorObj.code = code;
                errorObj.isHttpError = true;
                return Promise.reject(errorObj);
            }

            // 成功：解包 data
            response.data = responseData;
            return response;
        },
        async (error: AxiosError<ApiResponse>) => {
            // 错误处理...
        },
    );

    return instance;
};

export const http = createAxiosInstance();
```

**执行流程**：

1. **请求拦截器**：
    - 设置 `withCredentials: true`，自动携带 session cookie
    - 设置 `Content-Type: application/json`
    - GET 请求添加 `_t` 时间戳防缓存

2. **发起请求**：
    - 完整 URL：`http://localhost:3000/api/ai/beautify-story`
    - 方法：POST
    - 请求头：包含 session cookie
    - 请求体：`{ storyOverview, childAge, themes }`

3. **响应拦截器**：
    - 检查统一响应格式 `{ code, message, data }`
    - 如果是业务错误（code >= 1000），抛出错误
    - 如果是 HTTP 错误（code != 0），抛出错误
    - 如果成功（code === 0），解包 `data` 字段
    - 返回 `responseData` 给调用方

---

### 阶段 3：Next.js 路由到 Hono

Next.js 接收到 `/api` 路径的请求，转发到 Hono 应用处理。

---

### 阶段 4：Hono 全局中间件

#### 文件 4：`/src/server/main.ts`

**职责**：Hono 应用入口，注册全局中间件和路由

**关键代码**：

```typescript
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { globalErrorHandler, unifiedResponseMiddleware } from './common/middleware';

const serverRPC = beforeServer().then(() => {
    const app = createHonoApp().basePath('/api');

    // 注册全局中间件（按顺序执行）
    app.use(prettyJSON()); // 1. 美化 JSON 输出
    app.use(unifiedResponseMiddleware); // 2. 统一响应格式化
    app.onError(globalErrorHandler); // 3. 全局错误处理

    app.get('/', (c) => c.text('3R Blog API'));
    app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

    const routes = app
        .use(
            '*',
            cors({
                origin: '*',
                allowHeaders: ['Content-Type', 'Authorization'],
                exposeHeaders: ['Content-Length'],
                maxAge: 600,
                credentials: true,
            }),
        )
        .route(tagPath, tagRoutes)
        .route(categoryPath, categoryRoutes)
        .route(postPath, postRoutes)
        .route(countPath, countRoutes)
        .route(authPath, authRoutes)
        .route(beautifyStoryPath, beautifyStoryRoutes); // ✨ 注册 beautify-story 路由

    // OpenAPI 文档路由
    app.get('/data', openAPIRouteHandler(app, { ... }));
    app.get('/swagger', swaggerUI({ url: '/api/data' }));
    app.get('/docs', Scalar({ ... }));

    return { app, routes };
});
```

**执行流程**：

1. **接收请求**：Hono 接收到 `/api/ai/beautify-story` 的 POST 请求

2. **执行全局中间件**（按顺序）：

    **中间件 1：`prettyJSON()`**
    - 美化 JSON 输出格式
    - 增加缩进，提升可读性

    **中间件 2：`unifiedResponseMiddleware`**
    - 文件：`/src/server/common/middleware.ts`
    - 职责：自动将响应包装成统一格式
    - 详见"阶段 11"

    **中间件 3：`globalErrorHandler`**
    - 捕获所有未处理的异常
    - 返回统一错误格式

3. **CORS 配置**：
    - 允许跨域请求
    - 允许携带凭证 `credentials: true`
    - 允许的请求头：`Content-Type`, `Authorization`

4. **路由匹配**：
    - 遍历所有路由
    - 匹配到 `beautifyStoryPath = '/ai/beautify-story'`
    - 转发到 `beautifyStoryRoutes` 处理

---

### 阶段 5：认证中间件

#### 文件 5：`/src/server/user/middlwares.ts`

**职责**：验证用户身份，提取用户信息

**关键代码**：

```typescript
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { isNil } from 'lodash';
import { auth } from '@/libs/auth';
import { ErrorCode } from '../common/constants';
import { createErrorResult } from '../common/error';

export const AuthProtectedMiddleware = createMiddleware(async (c, next) => {
    // 1. 获取用户会话
    let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null;
    try {
        session = await auth.api.getSession({ headers: c.req.raw.headers });
    } catch (error) {
        c.set('user', null);
        c.set('session', null);
        throw new HTTPException(500, {
            res: new Response(
                JSON.stringify(createErrorResult('服务器错误', error, ErrorCode.SERVER_ERROR)),
            ),
        });
    }

    // 2. 验证用户是否存在
    if (isNil(session?.user)) {
        c.set('user', null);
        c.set('session', null);
        throw new HTTPException(401, {
            res: new Response(
                JSON.stringify(createErrorResult('用户未认证', undefined, ErrorCode.UNAUTHORIZED)),
            ),
        });
    }

    // 3. 存入上下文
    c.set('user', session.user);
    c.set('session', session.session);

    // 4. 继续执行
    await next();
});
```

**执行流程**：

1. **获取会话**：
    - 从请求头中提取 session cookie
    - 调用 `auth.api.getSession()` 验证
    - BetterAuth 库负责解析和验证

2. **验证用户**：
    - 检查 `session.user` 是否存在
    - 如果不存在，返回 401 错误

3. **错误处理**：
    - 认证失败：返回 401，消息 "用户未认证"
    - 服务器错误：返回 500，消息 "服务器错误"

4. **存入上下文**：
    - `c.set('user', session.user)` - 用户信息
    - `c.set('session', session.session)` - 会话信息

5. **继续执行**：
    - 调用 `await next()` 继续执行下一个中间件或路由处理器

---

### 阶段 6：路由匹配和参数验证

#### 文件 6：`/src/server/beautify-story/routes.ts`

**职责**：定义路由、参数验证、调用业务逻辑

**关键代码**：

```typescript
import { describeRoute, validator as zValidator } from 'hono-openapi';
import type { auth } from '@/libs/auth';
import { createHonoApp } from '../common/app';
import {
    createServerErrorResponse,
    createSuccessResponse,
    createUnauthorizedErrorResponse,
    createValidatorErrorResponse,
} from '../common/response';
import { AuthProtectedMiddleware } from '../user/middlwares';
import { beautifyStoryRequestSchema, beautifyStoryResponseSchema } from './schema';
import { beautifyStory } from './service';

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

interface Env {
    Variables: {
        user: NonNullable<AuthSession>['user'];
        session: NonNullable<AuthSession>['session'];
    };
}

const app = createHonoApp<Env>();

export const beautifyStoryTags = ['AI 儿童绘本'];

export const beautifyStoryRoutes = app.post(
    '/',
    describeRoute({
        tags: beautifyStoryTags,
        summary: '美化故事概述',
        description: '优化故事概述，使其更加生动有趣',
        responses: {
            ...createSuccessResponse(beautifyStoryResponseSchema),
            ...createUnauthorizedErrorResponse(),
            ...createValidatorErrorResponse(),
            ...createServerErrorResponse('美化失败'),
        },
    }),
    zValidator('json', beautifyStoryRequestSchema), // ✨ 参数验证
    AuthProtectedMiddleware, // ✨ 认证中间件
    async (c) => {
        // ✨ 路由处理器
        try {
            const data = c.req.valid('json'); // 获取验证后的数据
            const result = await beautifyStory(data); // 调用业务逻辑
            return c.json(result, 200); // 返回结果
        } catch (error) {
            return c.json(
                {
                    error: error instanceof Error ? error.message : '未知错误',
                    data: null,
                },
                500,
            );
        }
    },
);
```

**执行流程**：

1. **路由匹配**：
    - 匹配路径：`/`
    - 匹配方法：`POST`
    - 完整路径：`/ai/beautify-story/`

2. **参数验证**：
    - 使用 `zValidator('json', beautifyStoryRequestSchema)`
    - Schema 定义：`/src/server/beautify-story/schema.ts`
    - 验证规则：
        - `storyOverview`：必填字符串
        - `childAge`：可选枚举
        - `themes`：可选数组
    - 验证失败：返回 400 错误
    - 验证成功：继续执行

3. **认证中间件**：
    - 执行 `AuthProtectedMiddleware`
    - 验证用户身份
    - 未认证：返回 401 错误

4. **路由处理器**：
    - `const data = c.req.valid('json')` - 获取验证后的数据
    - `const result = await beautifyStory(data)` - 调用业务逻辑
    - `return c.json(result, 200)` - 返回结果
    - `catch (error)` - 捕获错误，返回 500

---

#### 文件 7：`/src/server/beautify-story/schema.ts`

**职责**：定义 Zod 验证规则

**关键代码**：

```typescript
import z from 'zod';

// 请求 schema
export const beautifyStoryRequestSchema = z
    .object({
        storyOverview: z.string().min(1, '故事概述不能为空'),
        childAge: z.enum(['infant', 'preschool', 'early_elementary']).optional(),
        themes: z.array(z.string()).optional(),
    })
    .meta({ $id: 'BeautifyStoryRequest', description: '美化故事概述请求' });

// 响应 schema
export const beautifyStoryResponseSchema = z
    .object({
        success: z.boolean(),
        beautifiedStory: z.string(),
        generationTime: z.number(),
        metadata: z.object({
            model: z.string(),
            usage: z.object({
                prompt_tokens: z.number(),
                completion_tokens: z.number(),
                total_tokens: z.number(),
            }),
        }),
    })
    .meta({ $id: 'BeautifyStoryResponse', description: '美化故事概述响应' });
```

**执行流程**：

1. **接收请求体**：JSON 格式
2. **验证参数**：
    - `storyOverview`：必须存在，且非空字符串
    - `childAge`：可选，必须是枚举值之一
    - `themes`：可选，必须是字符串数组
3. **验证失败**：返回 400 错误，包含详细错误信息
4. **验证成功**：继续执行

---

### 阶段 7：业务逻辑处理

#### 文件 8：`/src/server/beautify-story/service.ts`

**职责**：调用智谱 API，处理业务逻辑

**关键代码**：

```typescript
'use server';

// 年龄段映射
const AGE_LABELS: Record<string, string> = {
    infant: '0-2岁婴幼儿',
    preschool: '3-6岁学龄前儿童',
    early_elementary: '6-8岁小学低年级',
};

// 主题映射
const THEME_LABELS: Record<string, string> = {
    emotional_education: '情感教育',
    cognitive_learning: '认知学习',
    social_behavior: '社会行为',
    natural_science: '自然科学',
    fantasy_adventure: '奇幻冒险',
};

export async function beautifyStory(data: {
    storyOverview: string;
    childAge?: string;
    themes?: string[];
}) {
    const { storyOverview, childAge, themes } = data;

    // 1. 转换参数为中文标签
    const ageLabel = childAge ? AGE_LABELS[childAge] || childAge : '';
    const themeLabelsStr = themes ? themes.map((t) => THEME_LABELS[t] || t).join('、') : '';

    // 2. 构建 Prompt
    const systemPrompt = `你是一位专业的儿童绘本故事编辑，擅长优化和美化故事概述，让故事更加生动有趣、适合儿童阅读。`;

    const userPrompt = `请帮我美化以下故事概述，使其更加生动、有趣、富有想象力，同时保持原意不变。

${ageLabel ? `目标读者：${ageLabel}\n` : ''}${themeLabelsStr ? `主题：${themeLabelsStr}\n` : ''}
原始故事概述：
${storyOverview}

要求：
1. 保持故事的核心情节和主要角色不变
2. 使用更生动、更具画面感的语言描述
3. 添加适当的细节，让故事更加丰富
4. 语言适合儿童理解，富有童趣
5. 长度控制在 100-200 字左右
6. 直接返回美化后的故事概述，不要添加任何解释或标记`;

    // 3. 调用智谱 API
    console.log('正在调用智谱 API 美化故事概述');

    const startTime = Date.now();

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'glm-4-flash',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: 500,
            temperature: 0.7,
            stream: false,
        }),
        signal: AbortSignal.timeout(30000),
    });

    // 4. 处理响应
    if (!response.ok) {
        const errorText = await response.text();
        console.error('智谱 API 错误:', { status: response.status, body: errorText });

        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch {
            errorData = { error: { message: errorText } };
        }

        if (response.status === 401) {
            throw new Error('API Key 无效或已过期');
        } else if (response.status === 429) {
            throw new Error('请求过于频繁，请稍后重试');
        } else if (response.status === 402) {
            throw new Error('账户余额不足，请充值');
        } else {
            throw new Error(errorData.error?.message || response.statusText);
        }
    }

    const responseData = await response.json();
    const generationTime = Date.now() - startTime;

    const beautifiedText = responseData.choices?.[0]?.message?.content;

    if (!beautifiedText) {
        console.error('智谱 API 返回数据异常:', responseData);
        throw new Error('未获取到美化后的内容');
    }

    // 5. 清理文本
    let cleanedText = beautifiedText.trim();

    if (
        (cleanedText.startsWith('"') && cleanedText.endsWith('"')) ||
        (cleanedText.startsWith("'") && cleanedText.endsWith("'"))
    ) {
        cleanedText = cleanedText.slice(1, -1);
    }

    console.log('故事概述美化成功:', {
        generationTime: `${generationTime}ms`,
        originalLength: storyOverview.length,
        beautifiedLength: cleanedText.length,
    });

    // 6. 返回结果
    return {
        success: true,
        beautifiedStory: cleanedText,
        generationTime,
        metadata: {
            model: responseData.model || 'glm-4-flash',
            usage: responseData.usage,
        },
    };
}
```

**执行流程**：

1. **参数转换**：
    - `childAge` → `ageLabel`（中文标签）
    - `themes` → `themeLabelsStr`（中文标签，用"、"连接）

2. **构建 Prompt**：
    - `systemPrompt`：角色设定
    - `userPrompt`：具体任务要求，包含年龄、主题、故事概述

3. **调用智谱 API**：
    - 端点：`https://open.bigmodel.cn/api/paas/v4/chat/completions`
    - 模型：`glm-4-flash`
    - max_tokens：500
    - temperature：0.7
    - 超时：30 秒
    - 认证：`Authorization: Bearer ${process.env.ZHIPU_API_KEY}`

4. **错误处理**：
    - 401：API Key 无效或已过期
    - 429：请求过于频繁
    - 402：账户余额不足
    - 其他：返回具体错误信息

5. **响应处理**：
    - 提取 `choices[0].message.content`
    - 检查是否为空
    - 清理引号和多余字符

6. **返回结果**：
    - `success: true`
    - `beautifiedStory: cleanedText`
    - `generationTime: 耗时(ms)`
    - `metadata: { model, usage }`

---

### 阶段 8：响应处理

#### 文件 6 续：`/src/server/beautify-story/routes.ts`（路由处理器）

**成功响应**：

```typescript
return c.json(result, 200);
```

**原始响应格式**：

```json
{
    "success": true,
    "beautifiedStory": "在一个阳光明媚的早晨，小猫在花园里发现了一篮香气扑鼻的美味食物...",
    "generationTime": 2341,
    "metadata": {
        "model": "glm-4-flash",
        "usage": {
            "prompt_tokens": 389,
            "completion_tokens": 156,
            "total_tokens": 545
        }
    }
}
```

**错误响应**：

```typescript
catch (error) {
    return c.json(
        {
            error: error instanceof Error ? error.message : '未知错误',
            data: null,
        },
        500,
    );
}
```

---

### 阶段 9：统一响应格式化

#### 文件 9：`/src/server/common/middleware.ts`

**职责**：统一响应格式，自动包装响应数据

**关键代码**：

```typescript
export const unifiedResponseMiddleware = async (c: Context, next: Next) => {
    await next();

    const contentType = c.res.headers.get('Content-Type');
    if (!contentType?.includes('application/json')) return;

    const clonedRes = c.res.clone();
    let originalResponse;
    try {
        originalResponse = await clonedRes.json();
    } catch {
        return;
    }

    // 检查是否已经是统一格式
    if (isObject(originalResponse) && 'code' in originalResponse && 'data' in originalResponse) {
        return;
    }

    const status = c.res.status;

    if (status >= 400) {
        // 错误响应：包装成统一格式
        c.res = new Response(
            JSON.stringify({
                code: status,
                message: originalResponse?.message || '请求失败',
                data: null,
            }),
            { status, headers: c.res.headers },
        );
        return;
    }

    // 成功响应：包装成统一格式
    c.res = new Response(
        JSON.stringify({
            code: ErrorCode.SUCCESS,
            message: 'success',
            data: originalResponse,
        }),
        { status, headers: c.res.headers },
    );
};
```

**执行流程**：

1. **等待下一个中间件执行完成**：`await next()`

2. **检查响应内容类型**：
    - 不是 JSON：直接返回
    - 是 JSON：继续处理

3. **检查是否已经是统一格式**：
    - 统一格式包含 `{ code, message, data }`
    - 如果是，不处理，直接返回

4. **包装成功响应**：
    - 原始响应：`{ success: true, beautifiedStory: ... }`
    - 包装后：
        ```json
        {
          "code": 0,
          "message": "success",
          "data": {
            "success": true,
            "beautifiedStory": "在一个阳光明媚的早晨...",
            "generationTime": 2341,
            "metadata": { ... }
          }
        }
        ```

5. **包装错误响应**（如果有）：
    - 原始响应：`{ error: "美化失败", data: null }`
    - 包装后：
        ```json
        {
            "code": 500,
            "message": "美化失败",
            "data": null
        }
        ```

---

### 阶段 10：返回前端

#### 文件 3 续：`/src/config/request.ts`（响应拦截器）

**响应拦截器处理**：

```typescript
instance.interceptors.response.use(
    (response) => {
        const { data } = response;
        const { code, message, data: responseData } = data;

        // 业务错误（code >= 1000）
        if (code >= 1000) {
            const errorObj = new Error(message) as any;
            errorObj.code = code;
            errorObj.isBusinessError = true;
            return Promise.reject(errorObj);
        }

        // HTTP 错误（code != 0）
        if (code !== 0) {
            const errorObj = new Error(message) as any;
            errorObj.code = code;
            errorObj.isHttpError = true;
            return Promise.reject(errorObj);
        }

        // 成功：解包 data
        response.data = responseData;
        return response;
    },
    async (error: AxiosError<ApiResponse>) => {
        // 错误处理...
    },
);
```

**执行流程**：

1. **接收统一格式响应**：

    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "success": true,
        "beautifiedStory": "在一个阳光明媚的早晨...",
        "generationTime": 2341,
        "metadata": { ... }
      }
    }
    ```

2. **检查 code**：
    - `code === 0`：成功
    - `code >= 1000`：业务错误
    - `code !== 0`：HTTP 错误

3. **解包数据**：
    - `code === 0`：提取 `data` 字段，赋值给 `response.data`
    - 最终返回：`{ success: true, beautifiedStory: ..., generationTime: 2341, metadata: { ... } }`

---

#### 文件 1 续：`/src/app/(pages)/count-number/page.tsx`（UI 更新）

**更新状态**：

```typescript
try {
    setBeautifying(true);
    setError(null);
    const result = await beautifyStory({
        storyOverview,
        childAge,
        themes: selectedThemes,
    });
    setBeautifiedStory(result.beautifiedStory); // ✨ 更新状态
} catch (err: any) {
    setError(err.message || '美化失败');
    setBeautifiedStory(null);
} finally {
    setBeautifying(false);
}
```

**渲染结果**：

```tsx
{
    beautifiedStory && (
        <div className="mt-4 p-4 bg-zinc-700/30 border border-zinc-600 rounded-lg">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">美化结果</h3>
            <p className="text-white leading-relaxed">{beautifiedStory}</p>
        </div>
    );
}
```

---

## 错误处理链路

### 错误类型及处理方式

| 错误类型 | HTTP 状态码 | 触发位置 | 响应格式 |
| --- | --- | --- | --- |
| 参数验证失败 | 400 | Zod 验证器 | `{ error: "故事概述不能为空", data: null }` |
| 未认证 | 401 | AuthProtectedMiddleware | `{ error: "用户未认证", data: null }` |
| API Key 错误 | 401 | 智谱 API | `{ error: "API Key 无效或已过期", data: null }` |
| 账户余额不足 | 402 | 智谱 API | `{ error: "账户余额不足，请充值", data: null }` |
| 请求过于频繁 | 429 | 智谱 API | `{ error: "请求过于频繁，请稍后重试", data: null }` |
| 服务器错误 | 500 | 业务逻辑 | `{ error: "服务器内部错误", data: null }` |
| 请求超时 | 504 | 超时设置 | `{ error: "请求超时，请重试", data: null }` |

### 错误处理流程

```
发生错误
   ↓
全局错误处理 (globalErrorHandler)
   ↓
记录日志: console.error('[API Error]', error)
   ↓
判断错误类型:
   - HTTPException → 返回 HTTPException.getResponse()
   - 其他错误 → 返回 createBusinessError()
   ↓
统一响应格式化 (unifiedResponseMiddleware)
   ↓
包装成统一格式: { code, message, data }
   ↓
返回前端
   ↓
显示错误信息到 UI
```

---

## 文件职责总结

| 文件路径                                             | 职责         | 说明                   |
| ---------------------------------------------------- | ------------ | ---------------------- |
| `src/app/(pages)/count-number/page.tsx`              | 用户交互界面 | 触发请求，显示结果     |
| `src/app/(pages)/count-number/api/beautify-story.ts` | API 调用封装 | 封装 HTTP 请求         |
| `src/config/request.ts`                              | HTTP 客户端  | Axios 实例配置、拦截器 |
| `src/server/main.ts`                                 | 应用入口     | 路由注册、全局中间件   |
| `src/server/beautify-story/constants.ts`             | 路径常量     | 定义 API 路径          |
| `src/server/beautify-story/routes.ts`                | 路由定义     | 接口处理逻辑           |
| `src/server/beautify-story/schema.ts`                | 参数验证     | Zod 验证规则           |
| `src/server/beautify-story/type.ts`                  | 类型定义     | TypeScript 类型        |
| `src/server/beautify-story/service.ts`               | 业务逻辑     | 调用智谱 API           |
| `src/server/user/middlwares.ts`                      | 认证中间件   | 验证用户身份           |
| `src/server/common/middleware.ts`                    | 全局中间件   | 响应格式化、错误处理   |

---

## 关键技术点说明

### 1. Hono 框架

**特点**：

- 轻量级、高性能的 Web 框架
- 支持中间件模式
- 类型安全的路由定义
- 与 Next.js 集成

**中间件执行顺序**：

```
请求 → 全局中间件 → 认证中间件 → 参数验证 → 路由处理器 → 响应
```

### 2. BetterAuth 认证

**特点**：

- 基于 session 的认证
- 自动管理 cookie
- 支持多种认证方式

**认证流程**：

1. 用户登录 → 获取 session cookie
2. 后续请求自动携带 cookie
3. 服务端验证 cookie → 提取用户信息
4. 存入 context → 供后续使用

### 3. Zod 参数验证

**特点**：

- 类型安全的验证
- 自动生成 TypeScript 类型
- 支持复杂的验证规则
- 与 Hono 集成

**验证流程**：

1. 定义 schema
2. 使用 `zValidator()` 中间件
3. 自动验证请求体
4. 验证失败 → 返回 400
5. 验证成功 → 继续执行

### 4. Axios 请求拦截

**特点**：

- 统一的请求配置
- 自动携带认证信息
- 统一的错误处理
- 类型安全的响应

**拦截器类型**：

- 请求拦截器：添加请求头、防缓存
- 响应拦截器：解包数据、统一错误格式

### 5. 统一响应格式

**格式**：

```typescript
interface ApiResponse<T> {
    code: number; // 0 = 成功, 其他 = 错误码
    message: string; // "success" 或错误信息
    data: T; // 响应数据
}
```

**优点**：

- 前端统一处理
- 自动错误处理
- 清晰的成功/失败判断

### 6. OpenAPI 文档

**特点**：

- 自动生成 API 文档
- 支持多种查看器
- 类型安全的响应

**访问地址**：

- Swagger UI: `http://localhost:3000/api/swagger`
- Scalar: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/data`

---

## 数据流向图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户操作                               │
│  点击"开始美化"按钮，填写故事概述、年龄段、主题               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  前端: page.tsx                                             │
│  handleBeautify() → beautifyStory({ ... })                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  API 封装: api/beautify-story.ts                            │
│  http.post<BeautifyStoryResponse>('/ai/beautify-story', data) │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  HTTP 客户端: config/request.ts                              │
│  请求拦截器: 添加 cookie、Content-Type、时间戳                 │
│  POST /api/ai/beautify-story                                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  Next.js 路由 → Hono 应用                                    │
│  接收请求，转发到 Hono                                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  Hono 全局中间件: server/main.ts                             │
│  1. prettyJSON()                                             │
│  2. unifiedResponseMiddleware                                 │
│  3. globalErrorHandler                                       │
│  4. CORS                                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  认证中间件: server/user/middlwares.ts                       │
│  1. 获取 session cookie                                       │
│  2. 验证用户身份                                             │
│  3. 存入 context                                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  路由匹配: server/beautify-story/routes.ts                     │
│  匹配: POST /ai/beautify-story                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  参数验证: server/beautify-story/schema.ts                    │
│  1. 验证 storyOverview（必填）                               │
│  2. 验证 childAge（可选，枚举）                               │
│  3. 验证 themes（可选，数组）                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  业务逻辑: server/beautify-story/service.ts                   │
│  1. 转换参数为中文标签                                        │
│  2. 构建系统提示词                                             │
│  3. 构建用户提示词                                             │
│  4. 调用智谱 API                                              │
│  5. 清理响应文本                                               │
│  6. 返回结果                                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  外部 API: 智谱 AI GLM-4-Flash                                │
│  https://open.bigmodel.cn/api/paas/v4/chat/completions         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  响应处理: server/beautify-story/routes.ts                     │
│  1. 接收智谱 API 响应                                         │
│  2. 返回 JSON 格式                                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  统一响应格式化: server/common/middleware.ts                  │
│  1. 检查是否已包装                                             │
│  2. 包装成 { code, message, data } 格式                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  HTTP 响应拦截器: config/request.ts                            │
│  1. 检查 code                                                │
│  2. 解包 data 字段                                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  前端: page.tsx                                              │
│  1. 接收 beautifiedStory                                      │
│  2. 更新状态 setBeautifiedStory(result.beautifiedStory)        │
│  3. 渲染 UI 显示结果                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 总结

本文档详细说明了从浏览器发起 `/api/ai/beautify-story` 请求到后端处理并返回响应的完整流程。

### 关键要点

1. **清晰的文件职责分工**：每个文件都有明确的职责
2. **中间件层层过滤**：全局中间件 → 认证中间件 → 路由处理器
3. **类型安全**：全程使用 TypeScript 类型检查
4. **统一响应格式**：所有接口返回相同格式的响应
5. **完善的错误处理**：每个环节都有错误处理机制

### 涉及的文件数量

- 前端文件：2 个
- 后端文件：7 个
- 配置文件：1 个
- **总计：10 个文件**

---

## 更新日志

- 2025-01-27：初始版本，完成 beautify-story 接口的请求链路文档
