# React 业务组件开发指南

本文档详细说明了 React 业务组件的开发规范、文件组织结构和最佳实践。

## 目录

- [文件结构规范](#文件结构规范)
- [组件开发约定](#组件开发约定)
- [状态管理](#状态管理)
- [数据获取](#数据获取)
- [代码组织](#代码组织)
- [ESLint 规则](#eslint-规则)
- [最佳实践](#最佳实践)

---

## 文件结构规范

### 页面级组件目录结构

每个功能模块（路由组）应遵循以下目录结构：

```
src/app/(pages)/(功能模块)/
├── page.tsx                    # 页面主组件
├── components/                 # 该页面专用的子组件
│   ├── ComponentA/
│   │   ├── index.tsx
│   │   └── style.tsx
│   └── ComponentB/
│       ├── index.tsx
│       └── style.tsx
├── api/                        # Axios 请求函数（客户端组件用）
│   └── *.ts                    # 如: getBookList.ts, createBook.ts
├── hooks/                      # 数据获取和业务逻辑 hooks
│   ├── useBookList.ts
│   ├── useBookDetail.ts
│   └── useBookActions.ts
├── store/                      # Zustand 状态管理
│   └── book.ts
└── types/                      # 类型定义
    └── index.ts
```

### 目录命名规范

| 目录类型   | 命名规则                     | 示例                                 |
| ---------- | ---------------------------- | ------------------------------------ |
| 路由组     | `(功能模块)`                 | `(book-library)`, `(user-profile)`   |
| 功能页面   | `kebab-case`                 | `book-library`, `count-number`       |
| 子组件目录 | `PascalCase` 或 `kebab-case` | `BookCard`, `scene-editor`           |
| Hook 文件  | `use*.ts`                    | `useBookList.ts`, `useBookDetail.ts` |
| Store 文件 | `*.ts`                       | `book.ts`, `user.ts`                 |

---

## 组件开发约定

### 1. 文件命名

**组件文件命名**：

- 主组件：`index.tsx`
- 样式组件：`style.tsx`（包含 styled components）
- 类型组件：`type.ts`

**Hook 文件命名**：

- 统一使用 `use` 前缀：`useBookList.ts`, `useUserDetail.ts`

**Store 文件命名**：

- 与模块同名：`book.ts`, `user.ts`

### 2. 组件导出规范

```typescript
// components/ComponentA/index.tsx
export default function ComponentA() {
    // ...
}

// page.tsx 中导入
import { ComponentA } from './components/ComponentA';
```

### 3. TypeScript 类型定义

```typescript
// types/index.ts
export interface Book {
    id: number;
    title: string;
    createdAt: string;
}

export interface BookListParams {
    page: number;
    pageSize: number;
}
```

---

## 组件开发约定

### 1. 组件结构

每个组件应遵循以下结构：

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 导入类型
import type { Book } from './types';

// 导入 Hook
import { useBookList } from '../hooks/useBookList';

// 导入子组件
import { BookCard } from '../components/BookCard';

// 导入状态管理
import { useBookStore } from '../store/book';

export default function BookListPage() {
    // 1. 使用自定义 hooks 获取数据（不在组件中直接使用 useEffect）
    const { data, loading, refresh } = useBookList();

    // 2. 使用 Store 管理组件状态
    const { selectedBook, setSelectedBook } = useBookStore();

    // 3. 事件处理函数
    const handleSelectBook = (book: Book) => {
        setSelectedBook(book);
    };

    const handleDeleteBook = async (id: number) => {
        // 调用 API
        await deleteBook(id);
        refresh();
    };

    // 4. 渲染
    if (loading) {
        return <div>加载中...</div>;
    }

    return (
        <div>
            {/* 使用子组件 */}
            {data.map((book) => (
                <BookCard
                    key={book.id}
                    book={book}
                    onSelect={handleSelectBook}
                    onDelete={handleDeleteBook}
                />
            ))}
        </div>
    );
}
```

### 2. 组件职责分离

**组件应遵循单一职责原则**：

| 组件类型 | 职责 | 示例 |
| --- | --- | --- |
| **页面组件** (`page.tsx`) | 路由容器，组合子组件，管理页面级状态 | `BookListPage.tsx` |
| **业务组件** (`components/`) | 展示逻辑，用户交互 | `BookCard.tsx`, `SceneEditor.tsx` |
| **Hook** (`hooks/`) | 数据获取、副作用封装 | `useBookList.ts` |
| **Store** (`store/`) | 全局/模块级状态管理 | `book.ts` |

### 3. 不要在组件中直接使用 useEffect

❌ **不推荐**：

```typescript
export default function BookListPage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);

    // 禁止：在组件中直接使用 useEffect
    useEffect(() => {
        async function fetchBooks() {
            setLoading(true);
            const data = await getBookList();
            setBooks(data);
            setLoading(false);
        }
        fetchBooks();
    }, []);

    return <div>{/* ... */}</div>;
}
```

✅ **推荐**：封装到自定义 Hook

```typescript
// hooks/useBookList.ts
export function useBookList() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchBooks = async () => {
        setLoading(true);
        const data = await getBookList();
        setBooks(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    return { books, loading, refresh: fetchBooks };
}

// page.tsx
export default function BookListPage() {
    const { books, loading, refresh } = useBookList();

    return <div>{/* ... */}</div>;
}
```

**ESLint 规则强制**：项目配置了 `no-restricted-syntax` 规则，禁止在组件中直接使用 `useEffect`（排除 `hooks/`、`_hooks/`、`/api/` 目录）。

---

## 状态管理

### 1. 何时使用 Zustand Store

**需要使用 Store 的场景**：

- 跨组件共享状态（如：当前选中项、用户信息）
- 需要持久化的状态
- 复杂的业务状态逻辑

**不需要 Store 的场景**：

- 组件内部状态（使用 `useState`）
- 一次性获取数据（使用 Hook）
- 简单的表单状态

### 2. Store 定义规范

```typescript
// store/book.ts
import { create } from 'zustand';

interface BookStore {
    selectedBook: Book | null;
    setSelectedBook: (book: Book | null) => void;
}

export const useBookStore = create<BookStore>((set) => ({
    selectedBook: null,
    setSelectedBook: (book) => set({ selectedBook: book }),
}));
```

### 3. 状态三值约定

项目推荐使用三值约定表示数据状态：

```typescript
interface DataState<T> {
    data: T[] | null; // null = 初始状态
    loading: boolean; // loading = 加载中
    error: Error | null; // Error | null = 加载失败
}
```

**渲染逻辑**：

```typescript
const { books, loading, error } = useBookStore();

return (
    <div>
        {loading ? (
            <div>加载中...</div>
        ) : error ? (
            <div>加载失败: {error.message}</div>
        ) : books.length === 0 ? (
            <div>暂无数据</div>
        ) : (
            <ul>
                {books.map((book) => <li key={book.id}>{book.title}</li>)}
            </ul>
        )}
    </div>
);
```

---

## 数据获取

### 1. 选择合适的数据获取方式

| 场景         | 使用方式                        | 说明                       |
| ------------ | ------------------------------- | -------------------------- |
| 客户端组件   | Axios (`src/config/request.ts`) | 需要携带认证 cookie        |
| 服务端组件   | Hono 客户端 (`src/api/*.ts`)    | 无 HTTP 开销，直接内部调用 |
| 自动加载数据 | `useEffect` + `useRequest`      | 组件挂载时自动获取         |
| 手动触发     | `useRequest({ manual: true })`  | 用户点击等操作触发         |

### 2. 客户端组件数据获取

**API 请求函数**（`src/app/(pages)/(模块)/api/*.ts`）：

```typescript
// api/getBookList.ts
import { http } from '@/config/request';

export async function getBookList(): Promise<Book[]> {
    const { data } = await http.get<Book[]>('/books');
    return data;
}

export async function createBook(data: BookCreate): Promise<Book> {
    const response = await http.post<Book>('/books', data);
    return response.data;
}
```

**Hook 封装**（`src/app/(pages)/(模块)/hooks/useBookList.ts`）：

```typescript
import { http } from '@/config/request';
import { useRequest } from '@/hooks/use-request';
import { getBookList } from '../api/getBookList';

export function useBookList() {
    const { data, loading, error, run } = useRequest(getBookList, {
        manual: false, // 自动执行
        onSuccess: (data) => {
            console.log('数据获取成功', data);
        },
        onError: (error) => {
            console.error('数据获取失败', error);
        },
    });

    return { books: data, loading, error, refresh: run };
}
```

### 3. 服务端组件数据获取

**服务端组件无需 HTTP 请求**：

```typescript
// page.tsx (服务端组件)
import { bookApi } from '@/api/book';

export default async function ServerComponent() {
    // 直接调用 API，无 HTTP 开销
    const books = await bookApi.list();

    return <div>{/* 渲染数据 */}</div>;
}
```

---

## 代码组织

### 1. 导入顺序

```typescript
// 1. React 相关
import { useState, useEffect } from 'react';

// 2. Next.js 相关
import { useRouter } from 'next/navigation';

// 3. 类型定义
import type { Book } from './types';

// 4. 第三方库
import { clsx } from 'clsx';

// 5. 项目内部模块
import { getBookList } from '../api/getBookList';
import { useBookStore } from '../store/book';
import { BookCard } from '../components/BookCard';
```

### 2. 组件内部顺序

```typescript
export default function ComponentName() {
    // 1. Hooks（useState、useEffect 等）
    const [state, setState] = useState();
    const { data, loading } = useCustomHook();

    // 2. Context（useRouter、useParams 等）
    const router = useRouter();
    const params = useParams();

    // 3. 计算属性
    const filteredData = data.filter(...);

    // 4. 事件处理函数
    const handleClick = () => {
        // ...
    };

    // 5. 渲染
    return (
        <div>
            {/* ... */}
        </div>
    );
}
```

### 3. 样式组织

**推荐方式 1：使用 Tailwind CSS**

```typescript
export default function Component() {
    return (
        <div className="p-4 bg-white rounded-lg shadow">
            {/* ... */}
        </div>
    );
}
```

**推荐方式 2：使用 styled-components（复杂组件）**

```typescript
// style.tsx
import styled from 'styled-components';

export const Container = styled.div`
    padding: 1rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h1`
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
`;

// index.tsx
export default function Component() {
    return (
        <Container>
            <Title>标题</Title>
        </Container>
    );
}
```

---

## ESLint 规则

### 1. 禁止在组件中直接使用 useEffect

**规则名称**：`no-restricted-syntax`

**规则描述**：禁止在 React 组件中直接使用 `useEffect`，鼓励开发者封装到自定义 hooks 中。

**违反示例**：

```typescript
// ❌ 组件中直接使用 useEffect（会报错）
export default function BookListPage() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetchBooks().then(setBooks);
    }, []);

    return <div>{/* ... */}</div>;
}
```

**正确做法**：

```typescript
// ✅ 封装到自定义 Hook
// hooks/useBookList.ts
export function useBookList() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetchBooks().then(setBooks);
    }, []);

    return { books };
}

// page.tsx
export default function BookListPage() {
    const { books } = useBookList();

    return <div>{/* ... */}</div>;
}
```

**允许使用 `useEffect` 的位置**：

- `hooks/` 目录下的文件
- `_hooks/` 目录下的文件
- `api/` 目录下的文件

### 2. 其他 ESLint 规则

项目还配置了以下重要规则：

| 规则                               | 级别  | 说明                         |
| ---------------------------------- | ----- | ---------------------------- |
| `no-restricted-syntax`             | error | 禁止在组件中使用 `useEffect` |
| `unused-imports/no-unused-imports` | error | 移除未使用的导入             |
| `@next/next`                       | -     | Next.js 最佳实践             |
| `react-hooks/rules-of-hooks`       | -     | React Hooks 规则检查         |

---

## 最佳实践

### 1. 组件拆分原则

- **保持组件简洁**：单个组件文件不超过 300 行
- **单一职责**：每个组件只负责一个功能
- **可复用性**：通用组件提取到 `src/components/`

### 2. 性能优化

```typescript
import { useMemo, useCallback } from 'react';

export default function Component({ items }: { items: Item[] }) {
    // 使用 useMemo 缓存计算结果
    const sortedItems = useMemo(
        () => items.sort((a, b) => a.id - b.id),
        [items],
    );

    // 使用 useCallback 缓存事件处理函数
    const handleClick = useCallback((item: Item) => {
        console.log(item);
    }, []);

    return (
        <div>
            {sortedItems.map((item) => (
                <ItemCard key={item.id} item={item} onClick={handleClick} />
            ))}
        </div>
    );
}
```

### 3. 错误处理

```typescript
import { useRequest } from '@/hooks/use-request';

export function useBookList() {
    const { data, loading, error, run } = useRequest(getBookList, {
        onError: (error) => {
            // 根据错误类型处理
            if (error.isBusinessError) {
                console.error('业务错误', error.code);
            } else if (error.isHttpError) {
                console.error('HTTP 错误', error.status);
            } else if (error.isNetworkError) {
                console.error('网络错误');
            }
        },
    });

    return { books: data, loading, error, refresh: run };
}
```

### 4. TypeScript 类型安全

```typescript
// 使用 interface 定义 Props
interface BookCardProps {
    book: Book;
    onSelect: (book: Book) => void;
    onDelete?: (id: number) => void;
}

export function BookCard({ book, onSelect, onDelete }: BookCardProps) {
    return <div>{/* ... */}</div>;
}
```

### 5. 代码注释

```typescript
/**
 * 获取绘本列表
 * @param page - 页码
 * @param pageSize - 每页数量
 * @returns 绘本列表
 */
export async function getBookList(page: number, pageSize: number): Promise<Book[]> {
    // ...
}
```

---

## 相关文档

- [后端接口创建指南](./backend-api-creation-guide.md)
- [数据管理架构文档](./data-management.md)
- [API 请求流程](./api-request-flow.md)
- [自定义配置](./customization.md)

---

## 文件清单示例

创建一个完整的图书管理页面需要以下文件：

```
src/app/(pages)/(book-library)/
├── page.tsx                      # 页面主组件
├── components/
│   ├── BookCard/
│   │   ├── index.tsx
│   │   └── style.tsx
│   └── SceneEditor/
│       ├── index.tsx
│       └── style.tsx
├── api/
│   ├── getBookList.ts
│   ├── getBookDetail.ts
│   ├── createBook.ts
│   ├── updateBook.ts
│   └── deleteBook.ts
├── hooks/
│   ├── useBookList.ts
│   ├── useBookDetail.ts
│   └── useBookActions.ts
├── store/
│   └── book.ts
└── types/
    └── index.ts
```

---

## 快速开始

### 创建新页面的步骤

1. **创建目录结构**：在 `src/app/(pages)/(功能模块)/` 下创建必要目录
2. **定义类型**：在 `types/index.ts` 中定义接口
3. **创建 API 函数**：在 `api/` 中创建 Axios 请求函数
4. **封装 Hooks**：在 `hooks/` 中创建数据获取 hooks（包含 useEffect）
5. **创建 Store**（可选）：如需要跨组件共享状态，在 `store/` 中创建
6. **开发页面组件**：在 `page.tsx` 中组合所有模块
7. **测试**：运行 `pnpm lint` 确保符合代码规范
