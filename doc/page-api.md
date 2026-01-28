# 旧代码 → 新代码迁移：页面与接口清单

## 📦 页面列表

### 1. /form (创建绘本表单页面)

**路径**: `src/old/app/(user)/form/page.tsx`

**页面功能**:

- 收集表单数据：child_age, illustration_style, themes, story_overview, central_idea
- 点击"生成我的绘本"后，携带 payload 跳转到 `/show` 页面

**需要调用的接口**:

```
POST /api/beautify-story
  - 功能: 美化故事概述，使其更加生动有趣
  - 请求参数: { storyOverview, childAge, themes }
  - 响应: { success, beautifiedStory, generationTime }
  - 状态: ✅ 已存在
```

```
POST /api/generate-central-idea
  - 功能: 生成或美化中心思想
  - 请求参数: { centralIdea, storyOverview, childAge, themes }
  - 响应: { success, centralIdea, isGenerated, generationTime }
  - 状态: ✅ 已存在
```

---

### 2. /show (绘本生成/编辑页面)

**路径**: `src/old/app/(user)/show/page.tsx`

**页面功能**:

- 生成绘本分镜脚本
- 生成图片并显示
- 支持编辑文字、图片提示词
- 支持添加/复制/删除场景
- 保存绘本到数据库

**两种进入模式**:

#### 模式 A: 新建模式（从 /form 跳转）

**URL**: `/show?payload={encodedFormData}`

**流程**:

```
1. 接收 payload: { child_age, illustration_style, themes, story_overview, central_idea }
2. 调用 POST /api/create-prompt → 生成 scenes[] (text + img_text_prompt)
3. 遍历 scenes，对每个 img_text_prompt 调用 POST /api/generate-ai-children-picture → 生成图片
4. 用户编辑（修改文字/图片提示词/重新生成图片/添加/删除/复制场景）
5. 点击"保存" → POST /api/books → 保存新绘本
6. 保存成功后跳转到 /myLibrary
```

**需要调用的接口**:

```
POST /api/create-prompt
  - 功能: 根据表单数据生成绘本分镜脚本
  - 请求参数: { child_age, illustration_style, themes, story_overview, central_idea }
  - 响应: { success, scenes[], sceneCount, generationTime, metadata }
  - 状态: ✅ 已存在
```

```
POST /api/generate-ai-children-picture
  - 功能: 根据 img_text_prompt 生成 AI 图片
  - 请求参数: { prompt, model, size, sceneIndex? }
  - 响应: { success, imageUrl, generationTime, metadata }
  - 状态: ✅ 已存在
```

```
POST /api/books
  - 功能: 创建新绘本
  - 请求参数:
    {
      child_age: string;
      illustration_style_label: string;
      story_overview: string;
      central_idea: string;
      themes: string[];
      usage: {
        completion_tokens: number;
        prompt_tokens: number;
        total_tokens: number;
      };
      scenes: Array<{
        text: string;
        img_text_prompt: string;
        imageUrl: string | null;
      }>;
    }
  - 响应: { success, id }
  - 状态: 🔨 需要新增
```

---

#### 模式 B: 编辑模式（从 /myLibrary 或 /playbook 跳转）

**URL**: `/show?bookId=123456`

**流程**:

```
1. 从 URL 获取 bookId: 123456
2. 调用 GET /api/books/123456 → 获取绘本数据（包含 scenes）
3. 直接使用已有数据渲染
4. 用户编辑（修改文字/图片提示词/重新生成图片/添加/删除/复制场景）
5. 点击"保存并返回" → PUT /api/books/123456 → 更新绘本
6. 保存成功后跳转到 /myLibrary
```

**需要调用的接口**:

```
GET /api/books/:id
  - 功能: 根据 bookId 获取绘本详情
  - 路径参数: id
  - 响应:
    {
      id: number;
      userId: number;
      child_age: string;
      illustration_style_label: string;
      story_overview: string;
      central_idea: string;
      themes: string[];
      usage: {
        completion_tokens: number;
        prompt_tokens: number;
        total_tokens: number;
      };
      scenes: Array<{
        text: string;
        img_text_prompt: string;
        imageUrl: string | null;
      }>;
      createdAt: string;
      updatedAt: string;
    }
  - 状态: 🔨 需要新增
```

```
PUT /api/books/:id
  - 功能: 更新已有绘本
  - 路径参数: id
  - 请求参数:
    {
      child_age: string;
      illustration_style_label: string;
      story_overview: string;
      central_idea: string;
      themes: string[];
      usage: {
        completion_tokens: number;
        prompt_tokens: number;
        total_tokens: number;
      };
      scenes: Array<{
        text: string;
        img_text_prompt: string;
        imageUrl: string | null;
      }>;
    }
  - 响应: { success }
  - 状态: 🔨 需要新增
```

```
POST /api/generate-ai-children-picture
  - 功能: 重新生成图片（用户编辑图片提示词后）
  - 请求参数: { prompt, model, size, sceneIndex? }
  - 响应: { success, imageUrl, generationTime, metadata }
  - 状态: ✅ 已存在
```

---

### 3. /playbook (绘本阅读/播放页面)

**路径**: `src/old/app/(user)/playbook/page.tsx`

**页面功能**:

- 从 URL 获取 bookId
- 显示绘本内容（图片 + 文字）
- 提供翻页、全屏功能
- 点击"编辑"跳转到 `/show`

**需要调用的接口**:

```
GET /api/books/:id
  - 功能: 根据 bookId 获取绘本详情
  - 路径参数: id
  - 响应: Book 对象（包含 scenes 数组）
  - 状态: 🔨 需要新增
```

**数据流程**:

```
1. 从 URL 获取 bookId: 123456
2. 调用 GET /api/books/123456 获取绘本数据
3. 渲染绘本（显示图片和文字）
4. 支持翻页（上一页/下一页）
5. 支持全屏
6. 点击"编辑" → 跳转 /show?bookId=123456
```

---

### 4. /myLibrary (我的绘本图书馆页面)

**路径**: `src/old/app/(user)/myLibrary/page.tsx`

**页面功能**:

- 显示所有绘本列表
- 支持搜索绘本
- 支持删除绘本
- 支持导出 PDF（选中多本）
- 点击"创建新绘本"跳转到 `/form`
- 点击"阅读"跳转到 `/playbook`
- 点击"编辑"跳转到 `/show`

**需要调用的接口**:

```
GET /api/books
  - 功能: 获取当前用户的绘本列表
  - Query 参数: search? (可选，搜索关键词)
  - 响应: Book[]
  - 状态: 🔨 需要新增
```

```
DELETE /api/books/:id
  - 功能: 删除指定绘本
  - 路径参数: id
  - 响应: { success }
  - 状态: 🔨 需要新增
```

---

## 📊 接口汇总

### ✅ 已存在的接口（来自旧代码后端）

```
POST /api/create-prompt                    - 生成绘本分镜
POST /api/generate-ai-children-picture    - 生成 AI 图片
POST /api/beautify-story                  - 美化故事概述
POST /api/generate-central-idea           - 生成/美化中心思想
```

### 🔨 需要新增的数据库 CRUD 接口

```
GET /api/books                           - 获取绘本列表
GET /api/books/:id                       - 获取绘本详情
POST /api/books                          - 创建绘本
PUT /api/books/:id                       - 更新绘本
DELETE /api/books/:id                    - 删除绘本
```

---

## 📋 页面与接口对照表

| 页面 | 操作 | 需要的接口 | 接口状态 |
| --- | --- | --- | --- |
| **/form** | 美化故事 | POST /api/beautify-story | ✅ 已存在 |
|  | 生成/美化中心思想 | POST /api/generate-central-idea | ✅ 已存在 |
| **/show** (新建模式) | 生成分镜 | POST /api/create-prompt | ✅ 已存在 |
|  | 生成图片 | POST /api/generate-ai-children-picture (多次) | ✅ 已存在 |
|  | 保存绘本 | POST /api/books | 🔨 需新增 |
| **/show** (编辑模式) | 获取绘本 | GET /api/books/:id | 🔨 需新增 |
|  | 重新生成图片 | POST /api/generate-ai-children-picture | ✅ 已存在 |
|  | 更新绘本 | PUT /api/books/:id | 🔨 需新增 |
| **/playbook** | 获取绘本 | GET /api/books/:id | 🔨 需新增 |
| **/myLibrary** | 页面加载 | GET /api/books | 🔨 需新增 |
|  | 搜索绘本 | GET /api/books?search=xxx | 🔨 需新增 |
|  | 删除绘本 | DELETE /api/books/:id | 🔨 需新增 |

---

## 🔄 完整数据流程图

### 新建流程

```
用户填写表单 (/form)
  ↓
POST /api/beautify-story (可选 - 美化故事)
  ↓
POST /api/generate-central-idea (可选 - 生成/美化中心思想)
  ↓
点击"生成" → 跳转 /show?payload=...
  ↓
POST /api/create-prompt (生成分镜 scenes)
  ↓
循环: POST /api/generate-ai-children-picture (生成每个场景的图片)
  ↓
用户编辑 (修改文字/图片提示词/重新生成图片/添加/删除/复制场景)
  ↓
POST /api/books (保存新绘本)
  ↓
跳转 /myLibrary
```

### 编辑流程

```
/myLibrary 或 /playbook 页面
  ↓
点击"编辑" → 跳转 /show?bookId=123456
  ↓
GET /api/books/123456 (获取绘本数据)
  ↓
渲染已有内容
  ↓
用户编辑 (修改文字/图片提示词/重新生成图片/添加/删除/复制场景)
  ↓
PUT /api/books/123456 (更新绘本)
  ↓
跳转 /myLibrary
```

### 阅读流程

```
/myLibrary 页面
  ↓
点击"阅读" → 跳转 /playbook?bookId=123456
  ↓
GET /api/books/123456 (获取绘本数据)
  ↓
渲染并阅读绘本 (支持翻页/全屏)
  ↓
点击"编辑" → 跳转 /show?bookId=123456 (进入编辑流程)
```

---

## 🗄️ 数据库 Schema 设计

```prisma
model Book {
  id                    Int      @id @default(autoincrement())
  userId                Int
  user                  User     @relation(fields: [userId], references: [id])
  childAge              String   @map("child_age")
  illustrationStyle      String   @map("illustration_style")
  storyOverview         String   @map("story_overview")
  centralIdea           String   @map("central_idea")
  themes                String[]
  usagePromptTokens     Int      @map("usage_prompt_tokens") @default(0)
  usageCompletionTokens Int      @map("usage_completion_tokens") @default(0)
  usageTotalTokens      Int      @map("usage_total_tokens") @default(0)
  scenes                Json     @default("[]") // 场景数组以 JSON 形式存储
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@map("books")
}
```

### Scene 数据结构 (存储在 Book.scenes JSON 字段中)

```typescript
{
    text: string; // 绘本文字（给儿童看）
    img_text_prompt: string; // AI 图片生成提示词（英文）
    imageUrl: string | null; // 生成的图片 URL
}
```

---

## 📝 迁移检查清单

### 页面迁移

- [ ] 保留 `/myLibrary` 作为唯一的绘本列表页面
- [ ] 调整 `/show` 页面编辑模式：只接收 `bookId`，调用 `GET /api/books/:id`
- [ ] 调整 `/show` 页面保存逻辑：编辑模式调用 `PUT /api/books/:id`
- [ ] 调整 `/playbook` 页面：调用 `GET /api/books/:id` 获取数据
- [ ] 调整 `/myLibrary` 页面：调用 `GET /api/books` 和 `DELETE /api/books/:id`

### 接口开发

- [ ] 实现 `GET /api/books` - 获取绘本列表（支持搜索）
- [ ] 实现 `GET /api/books/:id` - 获取绘本详情
- [ ] 实现 `POST /api/books` - 创建绘本
- [ ] 实现 `PUT /api/books/:id` - 更新绘本
- [ ] 实现 `DELETE /api/books/:id` - 删除绘本

---

## 📌 重要说明

### 1. URL 参数规范

- **新建模式**: `/show?payload={encodedFormData}` （包含表单数据）
- **编辑模式**: `/show?bookId=123456` （只传 bookId）
- **阅读模式**: `/playbook?bookId=123456` （只传 bookId）

### 2. 数据流程关键点

- **新建模式**: 需要调用 `POST /api/create-prompt` 生成 scenes，然后调用 `POST /api/books` 保存
- **编辑模式**: 不需要调用 `POST /api/create-prompt`，直接调用 `GET /api/books/:id` 获取数据，然后调用 `PUT /api/books/:id` 更新
- **阅读模式**: 只调用 `GET /api/books/:id` 获取数据并展示

### 3. 图片生成流程

- 新建模式：生成所有场景的图片（遍历 scenes）
- 编辑模式：按需重新生成图片（用户点击"重新生成"按钮）
- 每次生成图片都调用 `POST /api/generate-ai-children-picture`

### 4. 数据存储设计

- scenes 数据以 JSON 格式存储在 `Book.scenes` 字段中
- 不需要独立的 Scene 表
- 不需要 UserExportCount 表（导出次数可以存储在 User 模型中或不需要持久化）

### 5. Book 数据结构

```typescript
{
  id: number;
  userId: number;
  child_age: string;                    // "preschool"
  illustration_style_label: string;    // "水彩画风格"
  story_overview: string;               // "小猫分享食物"
  central_idea: string;                 // "学会分享"
  themes: string[];                     // ["emotional_education"]
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
  scenes: Array<{
    text: string;              // "小猫在花园里找到了一篮子美味的食物。"
    img_text_prompt: string;   // "a small chubby white rabbit..."
    imageUrl: string | null;   // "/images/ai-children/1766374356248-m4qa5.png"
  }>;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔗 相关文档

- [API 请求流程](./api-request-flow.md)
- [数据管理](./data-management.md)
- [自定义配置](./customization.md)
- [部署指南](./deployment.md)
