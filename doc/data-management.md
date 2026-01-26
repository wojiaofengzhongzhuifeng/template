# 数据管理架构文档

本文档详细说明了项目中的数据管理、数据请求、错误处理、数据初始化和数据加载（loading）的实现方式。

## 目录

- [概述](#概述)
- [数据管理](#数据管理)
- [数据请求](#数据请求)
- [错误处理](#错误处理)
- [数据初始化](#数据初始化)
- [数据 Loading](#数据-loading)
- [最佳实践](#最佳实践)

---

## 概述

项目采用分层架构，清晰分离了：

- **客户端组件**：React 组件，处理用户交互
- **状态管理**：Zustand Store，管理组件间共享状态
- **数据请求层**：Axios 客户端（浏览器端）+ Hono 客户端（服务端组件）
- **业务逻辑层**：Service 层，处理数据库操作
- **API 路由层**：Hono 路由，处理 HTTP 请求和响应

---

## 数据管理

### Zustand Store 使用方式

项目使用最简单的 Zustand `create()` 方式创建状态管理：

```typescript
import { create } from 'zustand';

interface CountStore {
    counts: CountItem[] | null | undefined;
    setCounts: (value: CountItem[] | undefined) => void;
}

export const useCountStore = create<CountStore>((set) => ({
    counts: null,
    setCounts: (value) => set({ counts: value }),
}));
```

**实际使用的 Store 示例**：

- `src/app/(pages)/count-number/store/count.ts` - 计数器列表状态
- `src/app/(pages)/(home-page)/store/home.ts` - 首页数据状态
- `src/components/toast/store.ts` - Toast 消息状态

### Store 状态约定

项目使用三值约定表示数据状态：

```typescript
interface DataState<T> {
    data: T[] | null | undefined;
    // null   - 初始状态/加载中
    // []     - 空列表
    // [... ] - 有数据
    // undefined - 加载失败
}
```

**示例**：

```typescript
// src/app/(pages)/count-number/store/count.ts
interface CountStore {
    counts: CountItem[] | null | undefined;
    setCounts: (value: CountItem[] | undefined) => void;
}
```

---

## 数据请求

项目根据使用场景采用两种数据请求方式：

### 1. 客户端组件 - Axios HTTP 请求

**配置文件**：`src/config/request.ts`

```typescript
import { http } from '@/config/request';

// GET 请求（自动添加时间戳防缓存）
export async function getCountList(): Promise<CountItem[]> {
    const { data } = await http.get<CountItem[]>('/counts');
    return data;
}

// POST 请求
export async function createCount(data: { number: number }): Promise<CountItem> {
    const response = await http.post<CountItem>('/counts', data);
    return response.data;
}
```

**Axios 实例特性**：

- **自动携带 session cookie**（BetterAuth 认证）
- **GET 请求自动添加 `_t` 时间戳**，防止缓存
- **统一错误拦截器**，处理所有 HTTP 错误
- **超时设置**：30 秒
- **withCredentials**: `true`

### 2. 服务端组件 - Hono 类型安全客户端

**工具文件**：`src/libs/hono.ts`

```typescript
import { buildClient, fetchApi } from '@/libs/hono';

// 创建类型安全的 API 客户端
export const countClient = buildClient<CountApiType>(countPath);

// 封装 API 调用（自动解包统一响应格式）
export const countApi = {
    list: async () => fetchApi(countClient, async (c) => c.index.$get()),
    detail: async (id: string) =>
        fetchApi(countClient, async (c) => c[':id'].$get({ param: { id } })),
    create: async (data: CountCreate) =>
        fetchApi(countClient, async (c) => c.index.$post({ json: data })),
};
```

**特性**：

- **类型安全**：完整的 TypeScript 类型推断
- **服务端内部调用**：无 HTTP 开销
- **自动解包**：统一处理 `{ code, message, data }` 格式
- **自动错误处理**：业务错误和 HTTP 错误统一处理

### 请求函数组织

每个页面模块的请求函数存放在 `src/app/(pages)/(模块)/api/`：

```
src/app/(pages)/(count-number)/
├── api/
│   └── count.ts          # Axios 请求函数
├── hook/
│   └── use-*.ts          # useRequest Hooks
└── store/
    └── count.ts          # Zustand Store
```

---

## 错误处理

项目实现了三层错误处理机制：

### 1. 后端错误处理（Hono 路由层）

**错误类型**：

```typescript
// src/server/common/error.ts
export const createBusinessError = (code: ErrorCode, message: string) => ({
    code, // 业务错误码（>= 1000）
    message, // 错误消息
    data: null,
});

export const createErrorResult = (
    title: string,
    error?: any,
    code: ErrorCode = ErrorCode.SERVER_ERROR,
) => ({
    code,
    message: `${title}:${error.message}`,
    data: null,
});
```

**路由中的错误处理**：

```typescript
// src/server/count/routes.ts
.get('/:id', async (c) => {
    try {
        const result = await queryCountItem(id, user.id);
        if (!isNil(result)) return c.json(result, 200);
        // 业务错误：数据不存在
        return c.json(createBusinessError(ErrorCode.COUNT_NOT_FOUND, 'Count 不存在'), 200);
    } catch (error) {
        // 服务器错误
        return c.json(createErrorResult('查询 Count 失败', error), 500);
    }
})
```

**响应格式**：

```typescript
// 成功：200
{ code: 0, message: "成功", data: {...} }

// 业务错误：200
{ code: 1001, message: "Count 不存在", data: null }

// HTTP 错误：400/401/404/500
{ code: 400, message: "请求数据验证失败", data: null }
```

### 2. Axios 拦截器错误处理

**请求拦截器**：

```typescript
// src/config/request.ts (请求拦截器)
instance.interceptors.request.use((config) => {
    if (!config._skipAuth) {
        // better-auth 使用 session cookie，会自动携带
    }

    if (config.method === 'get') {
        // 添加时间戳防止缓存
        config.params = { ...config.params, _t: Date.now() };
    }
    return config;
});
```

**响应拦截器**：

```typescript
// src/config/request.ts (响应拦截器)
instance.interceptors.response.use(
    (response) => {
        const { code, message, data: responseData } = response.data;

        // 业务错误（code >= 1000）
        if (code >= 1000) {
            const errorObj = new Error(message) as any;
            errorObj.code = code;
            errorObj.isBusinessError = true;
            errorObj.response = response;
            return Promise.reject(errorObj);
        }

        // HTTP 错误（code != 0）
        if (code !== 0) {
            const errorObj = new Error(message) as any;
            errorObj.code = code;
            errorObj.isHttpError = true;
            errorObj.response = response;
            return Promise.reject(errorObj);
        }

        // 成功：解包 data
        response.data = responseData;
        return response;
    },
    async (error: AxiosError<ApiResponse>) => {
        const { response, status } = error;

        if (response) {
            // HTTP 状态码错误
            const errorObj = new Error(message) as any;
            errorObj.status = status;
            errorObj.code = status;
            errorObj.isHttpError = true;
            errorObj.data = data;
            errorObj.response = response;
            return Promise.reject(errorObj);
        }

        // 网络错误
        if (error.code === 'ECONNABORTED') {
            const errorObj = new Error('请求超时，请稍后重试') as any;
            errorObj.isNetworkError = true;
            return Promise.reject(errorObj);
        }

        if (!window.navigator.onLine) {
            const errorObj = new Error('网络连接失败，请检查网络') as any;
            errorObj.isNetworkError = true;
            return Promise.reject(errorObj);
        }

        // 其他错误
        const errorObj = new Error('请求失败，请稍后重试') as any;
        errorObj.isNetworkError = true;
        return Promise.reject(errorObj);
    },
);
```

**错误对象类型**：

```typescript
interface ErrorWithMeta extends Error {
    code?: number; // 错误码
    status?: number; // HTTP 状态码
    isBusinessError?: boolean; // 是否业务错误（>= 1000）
    isHttpError?: boolean; // 是否 HTTP 错误（1-999）
    isNetworkError?: boolean; // 是否网络错误
    response?: AxiosResponse; // 完整响应对象
    data?: any; // 响应数据
}
```

### 3. useRequest Hook 错误处理

**Hook 定义**：`src/hooks/use-request.ts`

```typescript
export interface UseRequestOptions<TData, TParams extends any[]> {
    manual?: boolean;
    defaultParams?: TParams;
    onSuccess?: (data: TData, params: TParams) => void;
    onError?: (error: Error, params: TParams) => void;
}

export function useRequest<TData, TParams extends any[]>(
    service: (...args: TParams) => Promise<TData>,
    options: UseRequestOptions<TData, TParams> = {},
): UseRequestResult<TData, TParams>;
```

**错误处理示例**：

```typescript
const { run, loading, error } = useRequest(getCountList, {
    manual: true,
    onSuccess: (data) => {
        setCounts(data);
    },
    onError: (error) => {
        // error.code: 业务错误码 / HTTP 状态码
        // error.isBusinessError: 是否业务错误
        // error.isHttpError: 是否 HTTP 错误
        // error.isNetworkError: 是否网络错误
        setCounts(undefined);
    },
});
```

---

## 数据初始化

### 客户端组件 - useEffect + useRequest

**方式 1：自动执行（manual: false）**

```typescript
const { data, loading, error } = useRequest(getCountList, {
    manual: false, // 组件挂载时自动执行
});
```

**方式 2：手动执行（manual: true）**

```typescript
export function useGetCountList() {
    const { setCounts } = useCountStore();
    const { run, loading } = useRequest(getCountList, {
        manual: true,
        onSuccess: (data) => setCounts(data),
        onError: () => setCounts(undefined),
    });

    useEffect(() => {
        run();
    }, [run]);

    return { loading, refresh: run };
}

// 在页面中使用
export default function HomePage() {
    useGetPublicCountNumberList(); // 自动初始化
    const { countList } = useHomeStore();
    // ...
}
```

### 服务端组件 - 直接调用 API

```typescript
// 在服务端组件中直接调用（Next.js Server Components）
import { countApi } from '@/api/count';

export default async function ServerComponent() {
    // 服务端渲染时获取数据，无 HTTP 开销
    const counts = await countApi.publicList();
    return <div>{/* 渲染数据 */}</div>;
}
```

---

## 数据 Loading

### Loading 状态管理

**useRequest Hook 提供的 loading 状态**：

```typescript
const { data, loading, error, run } = useRequest(getCountList);
```

**loading 状态规则**：

- `manual: false`：初始状态为 `true`，请求完成后变为 `false`
- `manual: true`：初始状态为 `false`，调用 `run()` 时变为 `true`

### 在组件中显示 Loading

**方式 1：基于 loading 状态**

```typescript
const { loading } = useGetCountList();

return (
    <div>
        {loading ? (
            <div>加载中...</div>
        ) : (
            <div>{/* 数据列表 */}</div>
        )}
    </div>
);
```

**方式 2：基于数据状态（三值约定）**

```typescript
const { counts } = useCountStore();

return (
    <div>
        {counts === null ? (
            <div>加载中...</div>
        ) : counts === undefined ? (
            <div>加载失败，请刷新重试</div>
        ) : counts.length === 0 ? (
            <div>暂无数据</div>
        ) : (
            <ul>
                {counts.map((item) => (
                    <li key={item.id}>{/* ... */}</li>
                ))}
            </ul>
        )}
    </div>
);
```

**示例**：`src/app/(pages)/count-number/page.tsx`

```typescript
return (
    <div>
        {counts === null ? (
            <div className="p-6 text-center text-zinc-400">加载中...</div>
        ) : counts === undefined ? (
            <div className="p-6 text-center text-red-400">加载失败，请刷新重试</div>
        ) : counts.length === 0 ? (
            <div className="p-6 text-center text-zinc-400">暂无数据</div>
        ) : (
            <ul>{counts.map(...)}</ul>
        )}
    </div>
);
```

### 刷新数据

**提供 refresh 函数**：

```typescript
export function useGetCountList() {
    const { run, loading } = useRequest(getCountList, { manual: true });
    return { loading, refresh: run };
}

// 在组件中使用
const { refresh } = useGetCountList();

// 手动刷新
const handleCreate = async () => {
    await createCount({ number: 10 });
    refresh(); // 刷新列表
};
```

---

## 最佳实践

### 1. 选择合适的数据请求方式

| 场景               | 使用方式                        |
| ------------------ | ------------------------------- |
| 客户端组件         | Axios (`src/config/request.ts`) |
| 服务端组件         | Hono 客户端 (`src/api/*.ts`)    |
| 表单提交、按钮点击 | Axios + useRequest              |
| 初始化加载数据     | useEffect + useRequest          |

### 2. 状态管理约定

```typescript
// 推荐：三值约定
interface DataState<T> {
    data: T[] | null | undefined;
    // null   - 初始状态
    // [... ] - 有数据
    // undefined - 错误状态
}

// 不推荐：仅使用 loading
interface DataState<T> {
    data: T[] | null;
    loading: boolean;
    error: Error | null;
}
```

### 3. 错误处理优先级

```typescript
try {
    // 1. 业务逻辑错误（优先级最高）
    if (!result) {
        return c.json(createBusinessError(ErrorCode.NOT_FOUND, '数据不存在'), 200);
    }

    // 2. 数据库操作
    return c.json(result, 200);
} catch (error) {
    // 3. 服务器错误（兜底）
    return c.json(createErrorResult('操作失败', error), 500);
}
```

### 4. 组件数据流

```typescript
// ✅ 推荐模式
export function useMyData() {
    const { setData } = useMyStore();
    const { run, loading } = useRequest(fetchData, {
        manual: true,
        onSuccess: (data) => setData(data),
        onError: () => setData(undefined),
    });

    useEffect(() => {
        run();
    }, [run]);

    return { loading, refresh: run };
}

export default function MyComponent() {
    useMyData();  // 自动初始化
    const { data } = useMyStore();
    return <div>{/* 渲染 data */}</div>;
}
```

### 5. 错误提示

```typescript
// 组件级别错误提示
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
    try {
        await createCount({ number: 10 });
    } catch (err: any) {
        setError(err.message || '操作失败');
        setTimeout(() => setError(null), 3000);
    }
};

return (
    <div>
        {error && (
            <div className="error-banner">{error}</div>
        )}
        <button onClick={handleAction}>提交</button>
    </div>
);
```

---

## 相关文件

| 文件                            | 说明                    |
| ------------------------------- | ----------------------- |
| `src/config/request.ts`         | Axios HTTP 客户端配置   |
| `src/libs/hono.ts`              | Hono 类型安全客户端工具 |
| `src/hooks/use-request.ts`      | 数据请求 Hook           |
| `src/libs/store.ts`             | Zustand Store 工具函数  |
| `src/server/common/error.ts`    | 后端错误处理工具        |
| `src/server/common/response.ts` | 后端响应格式工具        |

---

## 总结

项目实现了完整的数据管理架构：

1. **数据管理**：使用 Zustand 封装多个工具函数，支持不同场景的状态管理
2. **数据请求**：根据组件类型（客户端/服务端）选择合适的请求方式
3. **错误处理**：三层错误处理机制（后端路由、Axios 拦截器、useRequest Hook）
4. **数据初始化**：通过 useEffect + useRequest 或直接在服务端组件中调用
5. **数据 Loading**：基于 loading 状态或数据状态（三值约定）显示加载状态

这种架构清晰、类型安全、易于维护，适合中大型 Next.js 项目。
