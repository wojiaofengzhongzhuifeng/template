# Count API 接口文档

## 基础信息

- **基础路径**: `/api/counts`
- **认证方式**: 所有接口需要用户认证（Session Token）
- **API 前缀**: `/api`

## 数据模型

### CountItem
```typescript
{
  id: string;              // 唯一标识
  number: number;          // 计数值
  userId: string;          // 所属用户 ID
  createdAt: string;       // 创建时间 (ISO 8601)
  updatedAt: string;       // 更新时间 (ISO 8601)
}
```

---

## API 接口列表

### 1. 获取 Count 列表

获取当前登录用户的所有计数器。

**接口地址**: `GET /api/counts`

**请求头**:
```http
Authorization: Bearer <session_token>
```

**请求参数**: 无

**成功响应** (200 OK):
```json
{
  "ok": true,
  "data": [
    {
      "id": "cm0abc123xyz",
      "number": 10,
      "userId": "cm_user123",
      "createdAt": "2025-01-23T08:45:28.000Z",
      "updatedAt": "2025-01-23T08:45:28.000Z"
    },
    {
      "id": "cm0def456xyz",
      "number": 25,
      "userId": "cm_user123",
      "createdAt": "2025-01-23T09:00:00.000Z",
      "updatedAt": "2025-01-23T09:00:00.000Z"
    }
  ]
}
```

**错误响应**:
- `401 Unauthorized` - 未认证或 token 无效
- `500 Internal Server Error` - 服务器错误

**cURL 示例**:
```bash
curl -X GET http://localhost:3000/api/counts \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

**前端调用示例**:
```typescript
import { countApi } from '@/api/count';

const result = await countApi.list();
if (result.ok) {
  console.log('Count列表:', result.data);
}
```

---

### 2. 获取单个 Count 详情

获取指定 ID 的计数器详情。

**接口地址**: `GET /api/counts/:id`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | Count ID |

**请求头**:
```http
Authorization: Bearer <session_token>
```

**成功响应** (200 OK):
```json
{
  "ok": true,
  "data": {
    "id": "cm0abc123xyz",
    "number": 10,
    "userId": "cm_user123",
    "createdAt": "2025-01-23T08:45:28.000Z",
    "updatedAt": "2025-01-23T08:45:28.000Z"
  }
}
```

**错误响应**:
- `400 Bad Request` - 参数验证失败
- `401 Unauthorized` - 未认证
- `404 Not Found` - Count 不存在
- `500 Internal Server Error` - 服务器错误

**cURL 示例**:
```bash
curl -X GET http://localhost:3000/api/counts/cm0abc123xyz \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

**前端调用示例**:
```typescript
const result = await countApi.detail('cm0abc123xyz');
if (result.ok) {
  console.log('Count详情:', result.data);
}
```

---

### 3. 创建 Count

创建一个新的计数器。

**接口地址**: `POST /api/counts`

**请求头**:
```http
Authorization: Bearer <session_token>
Content-Type: application/json
```

**请求体**:
```json
{
  "number": 100
}
```

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 | 约束 |
|--------|------|------|------|------|
| number | number | 是 | 初始计数值 | 整数 |

**成功响应** (201 Created):
```json
{
  "ok": true,
  "data": {
    "id": "cm0new789xyz",
    "number": 100,
    "userId": "cm_user123",
    "createdAt": "2025-01-23T10:00:00.000Z",
    "updatedAt": "2025-01-23T10:00:00.000Z"
  }
}
```

**错误响应**:
- `400 Bad Request` - 参数验证失败
- `401 Unauthorized` - 未认证
- `500 Internal Server Error` - 服务器错误

**cURL 示例**:
```bash
curl -X POST http://localhost:3000/api/counts \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": 100
  }'
```

**前端调用示例**:
```typescript
const result = await countApi.create({ number: 100 });
if (result.ok) {
  console.log('创建成功:', result.data);
}
```

---

### 4. 更新 Count

更新指定计数器的数值。

**接口地址**: `PATCH /api/counts/:id`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | Count ID |

**请求头**:
```http
Authorization: Bearer <session_token>
Content-Type: application/json
```

**请求体**:
```json
{
  "number": 11
}
```

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 | 约束 |
|--------|------|------|------|------|
| number | number | 是 | 新的计数值 | 整数 |

**成功响应** (200 OK):
```json
{
  "ok": true,
  "data": {
    "id": "cm0abc123xyz",
    "number": 11,
    "userId": "cm_user123",
    "createdAt": "2025-01-23T08:45:28.000Z",
    "updatedAt": "2025-01-23T10:30:00.000Z"
  }
}
```

**错误响应**:
- `400 Bad Request` - 参数验证失败
- `401 Unauthorized` - 未认证
- `404 Not Found` - Count 不存在
- `500 Internal Server Error` - 服务器错误

**cURL 示例**:
```bash
curl -X PATCH http://localhost:3000/api/counts/cm0abc123xyz \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number": 11
  }'
```

**前端调用示例**:
```typescript
// 增加计数
const currentNumber = 10;
const result = await countApi.update('cm0abc123xyz', { number: currentNumber + 1 });
if (result.ok) {
  console.log('更新成功:', result.data);
}
```

---

### 5. 删除 Count

删除指定的计数器。

**接口地址**: `DELETE /api/counts/:id`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | Count ID |

**请求头**:
```http
Authorization: Bearer <session_token>
```

**请求体**: 无

**成功响应** (200 OK):
```json
{
  "message": "删除成功"
}
```

**错误响应**:
- `400 Bad Request` - 参数验证失败
- `401 Unauthorized` - 未认证
- `404 Not Found` - Count 不存在
- `500 Internal Server Error` - 服务器错误

**cURL 示例**:
```bash
curl -X DELETE http://localhost:3000/api/counts/cm0abc123xyz \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

**前端调用示例**:
```typescript
const result = await countApi.delete('cm0abc123xyz');
if (result.ok) {
  console.log('删除成功');
}
```

---

## 通用错误响应格式

### 400/422 验证错误
```json
{
  "ok": false,
  "message": "请求参数验证失败"
}
```

### 401 未认证
```json
{
  "ok": false,
  "message": "未认证或 token 无效"
}
```

### 404 未找到
```json
{
  "ok": false,
  "message": "Count 不存在"
}
```

### 500 服务器错误
```json
{
  "ok": false,
  "message": "操作失败",
  "error": "详细错误信息（开发环境）"
}
```

---

## 完整使用流程示例

### 场景：创建并管理一个计数器

```typescript
import { countApi } from '@/api/count';

// 1. 创建一个初始值为 0 的计数器
const createResult = await countApi.create({ number: 0 });
if (!createResult.ok) {
  console.error('创建失败:', createResult.message);
  return;
}

const countId = createResult.data.id;
console.log('创建成功，ID:', countId);

// 2. 查看计数器详情
const detailResult = await countApi.detail(countId);
if (detailResult.ok) {
  console.log('当前值:', detailResult.data.number);
}

// 3. 增加 1
const currentNumber = detailResult.data.number;
const incrementResult = await countApi.update(countId, { number: currentNumber + 1 });
if (incrementResult.ok) {
  console.log('增加后:', incrementResult.data.number);
}

// 4. 减少 1
const decrementResult = await countApi.update(countId, { number: currentNumber - 1 });
if (decrementResult.ok) {
  console.log('减少后:', decrementResult.data.number);
}

// 5. 获取所有计数器列表
const listResult = await countApi.list();
if (listResult.ok) {
  console.log('所有计数器:', listResult.data);
}

// 6. 删除计数器
const deleteResult = await countApi.delete(countId);
if (deleteResult.ok) {
  console.log('删除成功');
}
```

---

## Postman 导入配置

你可以将以下 JSON 导入到 Postman 中测试接口：

```json
{
  "info": {
    "name": "Count API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": "YOUR_SESSION_TOKEN"
    }
  ],
  "item": [
    {
      "name": "获取列表",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{base_url}}/api/counts"
      }
    },
    {
      "name": "创建 Count",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"number\": 100\n}"
        },
        "url": "{{base_url}}/api/counts"
      }
    },
    {
      "name": "更新 Count",
      "request": {
        "method": "PATCH",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"number\": 101\n}"
        },
        "url": "{{base_url}}/api/counts/:id"
      }
    },
    {
      "name": "删除 Count",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{base_url}}/api/counts/:id"
      }
    }
  ]
}
```

---

## 注意事项

1. **认证要求**: 所有接口都需要有效的用户 session
2. **用户隔离**: 用户只能访问自己创建的 Count
3. **数据类型**: `number` 字段必须是整数
4. **错误处理**: 所有接口都返回统一的 `{ ok: boolean, message?: string, data?: T }` 格式
5. **时间格式**: 所有时间字段使用 ISO 8601 格式（UTC）

---

## 开发调试

### 启动开发服务器
```bash
pnpm dev
```

### 访问 API 文档
- Swagger UI: http://localhost:3000/api/swagger
- Scalar Docs: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/data

### 查看数据库
```bash
pnpm dbo
```
这会打开 Prisma Studio，可以查看和管理数据库中的数据。
