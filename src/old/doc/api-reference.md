# AI 儿童绘本生成 API 参考文档

本文档说明 `/src/old/api` 目录下的 4 个 AI 儿童绘本生成相关接口。

---

## 概述

所有接口基于智谱 AI API 提供服务：

- **文本生成**：`glm-4-flash` 模型
- **图像生成**：`cogview-4` 模型

### 共同特性

- 统一的错误处理机制
- 请求超时控制（文本 30s，图像 60s）
- 支持参数验证
- 部分接口支持 Mock 模式

---

## 1. generate-central-idea - 生成/美化中心思想

### 基本信息

- **接口路径**：`/api/generate-central-idea`
- **请求方法**：`POST`
- **功能描述**：根据故事概述生成或美化中心思想（核心价值观）

### 请求参数

| 参数名        | 类型     | 必填 | 说明                                              |
| ------------- | -------- | ---- | ------------------------------------------------- |
| storyOverview | string   | 是   | 故事概述                                          |
| centralIdea   | string   | 否   | 中心思想，不传则生成新思想，传入则美化原有思想    |
| childAge      | string   | 否   | 年龄段：`infant`、`preschool`、`early_elementary` |
| themes        | string[] | 否   | 主题数组                                          |

### 接口逻辑

1. **参数验证**：检查 `storyOverview` 是否为空
2. **检查 API Key**：验证 `ZHIPU_API_KEY` 环境变量
3. **判断操作类型**：
    - 如果 `centralIdea` 为空 → 生成新中心思想
    - 如果 `centralIdea` 有值 → 美化现有中心思想
4. **构建 Prompt**：
    - 系统提示：儿童绘本创作专家
    - 用户提示：根据年龄段、主题构建
5. **调用智谱 API**：
    - 模型：`glm-4-flash`
    - max_tokens：200
    - temperature：0.7
6. **清理结果**：移除引号、前缀等
7. **返回结果**

### 响应示例

**成功响应：**

```json
{
    "success": true,
    "centralIdea": "学会分享，快乐加倍",
    "isGenerated": true,
    "generationTime": 2341,
    "metadata": {
        "model": "glm-4-flash",
        "usage": {
            "prompt_tokens": 456,
            "completion_tokens": 28,
            "total_tokens": 484
        }
    }
}
```

**错误响应（400）：**

```json
{
    "error": "故事概述不能为空"
}
```

**错误响应（500）：**

```json
{
    "error": "Zhipu API Key 未配置"
}
```

---

## 2. beautify-story - 美化故事概述

### 基本信息

- **接口路径**：`/api/beautify-story`
- **请求方法**：`POST`
- **功能描述**：优化故事概述，使其更加生动有趣

### 请求参数

| 参数名        | 类型     | 必填 | 说明         |
| ------------- | -------- | ---- | ------------ |
| storyOverview | string   | 是   | 原始故事概述 |
| childAge      | string   | 否   | 年龄段       |
| themes        | string[] | 否   | 主题数组     |

### 接口逻辑

1. **参数验证**：检查 `storyOverview` 是否为空
2. **检查 API Key**
3. **构建 Prompt**：
    - 系统提示：儿童绘本故事编辑
    - 用户提示：包含年龄段、主题、原始概述
    - 要求：保持原意、生动有趣、100-200字
4. **调用智谱 API**：
    - 模型：`glm-4-flash`
    - max_tokens：500
    - temperature：0.7
5. **清理结果**
6. **返回结果**

### 响应示例

**成功响应：**

```json
{
    "success": true,
    "beautifiedStory": "在一个阳光明媚的早晨，小猫在花园里发现了一篮香气扑鼻的美味食物。它看着这些美食，立刻想起了它最好的朋友小狗，于是决定把食物分享给它。",
    "generationTime": 3456,
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

---

## 3. create-prompt - 创建绘本分镜脚本

### 基本信息

- **接口路径**：`/api/create-prompt`
- **请求方法**：`POST`
- **功能描述**：生成完整的绘本分镜脚本，包含绘本文字和 AI 图像生成提示词

### 请求参数

| 参数名             | 类型     | 必填 | 说明               |
| ------------------ | -------- | ---- | ------------------ |
| child_age          | string   | 是   | 儿童年龄段         |
| illustration_style | string   | 是   | 插画风格           |
| themes             | string[] | 是   | 主题数组（可多选） |
| story_overview     | string   | 是   | 故事概述           |
| central_idea       | string   | 否   | 中心思想           |

### 枚举值说明

**年龄段：**

- `infant` - 0-2岁婴幼儿
- `preschool` - 3-6岁学龄前儿童
- `early_elementary` - 6-8岁小学低年级

**插画风格：**

- `watercolor` - 水彩画风格
- `crayon` - 蜡笔画风格
- `cartoon` - 卡通动画风格
- `clay_3d` - 3D黏土风格
- `paper_cut` - 剪纸拼贴风格

**主题：**

- `emotional_education` - 情感教育
- `cognitive_learning` - 认知学习
- `social_behavior` - 社交行为
- `natural_science` - 自然科学
- `fantasy_adventure` - 奇幻冒险

### 接口逻辑

1. **参数验证**：验证所有必填字段及枚举值有效性
2. **检查 API Key**
3. **转换参数为中文标签**
4. **构建复杂的 Prompt**：
    - 包含详细的 AI 图像生成提示词工程指导
    - 要求生成 8-12 个场景
    - 每个场景包含 `text`（绘本文字）和 `img_text_prompt`（AI 图像生成提示词）
    - 强调角色一致性规则
5. **调用智谱 API**：
    - 模型：`glm-4-flash`
    - max_tokens：4096
    - temperature：0.8
    - timeout：120秒
6. **解析 JSON 数组**：移除 markdown 标记
7. **验证数据结构**：检查每个场景的字段
8. **返回结果**

### 响应示例

**成功响应（实际 Mock 数据）：**

```json
{
    "success": true,
    "scenes": [
        {
            "text": "小猫在花园里找到了一篮子美味的食物。123321321",
            "img_text_prompt": "第一条提示词"
        },
        {
            "text": "小猫看着篮子里的食物，想起了它的好朋友小狗。",
            "img_text_prompt": "第二条提示词"
        },
        {
            "text": "小猫决定把食物分成两份，一份给自己，一份给小狗。",
            "img_text_prompt": "第三条提示词"
        },
        {
            "text": "小猫和小狗一起分享了美味的食物，感到非常快乐。",
            "img_text_prompt": "第四条提示词"
        },
        {
            "text": "小猫学会了分享，它感到非常自豪。",
            "img_text_prompt": "第五条提示词"
        },
        {
            "text": "小狗也学会了分享，它把它的玩具给小猫玩。",
            "img_text_prompt": "第六条提示词"
        },
        {
            "text": "小猫和小狗成为了最好的朋友，一起玩耍。",
            "img_text_prompt": "第七条提示词"
        },
        {
            "text": "小猫和小狗一起度过了美好的时光，它们学会了分享的重要性。",
            "img_text_prompt": "第八条提示词"
        }
    ],
    "sceneCount": 8,
    "generationTime": 52447,
    "metadata": {
        "child_age": "infant",
        "child_age_label": "0-2岁婴幼儿",
        "illustration_style": "crayon",
        "illustration_style_label": "蜡笔画风格",
        "themes": ["emotional_education"],
        "themes_label": "情感教育",
        "story_overview": "小猫分享食物",
        "central_idea": "学会分享",
        "model": "glm-4-flash",
        "usage": {
            "completion_tokens": 991,
            "prompt_tokens": 902,
            "total_tokens": 1893
        }
    }
}
```

**请求示例（来自 GET 接口文档）：**

```json
{
    "child_age": "preschool",
    "illustration_style": "watercolor",
    "themes": ["emotional_education", "social_behavior"],
    "story_overview": "一只小兔子因为胆小不敢和其他小动物玩耍，后来在帮助迷路的小鸟过程中找到了勇气和友谊。",
    "central_idea": "勇气不是不害怕，而是在害怕时依然选择去做对的事情。"
}
```

**对应的预期响应（来自 GET 接口文档）：**

```json
{
    "success": true,
    "scenes": [
        {
            "text": "小兔子白白有一身雪白的毛，住在森林边的小山坡上。",
            "img_text_prompt": "A cute white rabbit with fluffy snow-white fur, big round sparkling eyes, and long floppy ears, standing in front of a cozy burrow on a gentle hillside at the edge of a forest. Warm morning sunlight, green grass with tiny flowers, soft watercolor style, warm pastel colors, children's book illustration, high quality."
        },
        {
            "text": "每天，白白都会躲在大树后面，偷偷看着其他小动物们一起玩耍。",
            "img_text_prompt": "A shy white rabbit with big round eyes peeking from behind a large oak tree trunk, watching a group of happy forest animals (a squirrel, a hedgehog, and a deer fawn) playing together in a sunny meadow. The rabbit looks lonely and hesitant. Soft watercolor style, dappled sunlight, warm golden and green tones, children's book illustration, medium shot."
        }
    ],
    "sceneCount": 10,
    "generationTime": 15234
}
```

---

## 4. generate-ai-children-picture - 生成 AI 儿童插画

### 基本信息

- **接口路径**：`/api/generate-ai-children-picture`
- **请求方法**：`POST`
- **功能描述**：根据提示词生成儿童插画图片

### 请求参数

| 参数名         | 类型   | 必填 | 说明                          |
| -------------- | ------ | ---- | ----------------------------- |
| prompt         | string | 是   | 图片描述（AI 图像生成提示词） |
| negativePrompt | string | 否   | 负向提示词                    |
| model          | string | 否   | 模型名称，默认 `cogview-4`    |
| size           | string | 否   | 图片尺寸，默认 `1024x1024`    |
| sceneIndex     | number | 否   | 场景索引（Mock 模式使用）     |

### 接口逻辑

1. **检查 Mock 模式**：
    - 如果 `USE_MOCK_DATA=false`，使用 Mock 数据
    - Mock 模式：返回预设的测试图片，延迟 500-1500ms
2. **参数验证**：检查 `prompt` 是否为空
3. **检查 API Key**
4. **解析尺寸**：默认 1024x1024
5. **调用智谱 CogView-4 API**：
    - API 端点：`https://open.bigmodel.cn/api/paas/v4/images/generations`
    - 请求体包含：model、prompt、negative_prompt、size、steps、seed、quality、style
    - timeout：60秒
6. **处理响应**：
    - 提取智谱返回的临时图片 URL
7. **下载图片**：从智谱 URL 下载图片到内存
8. **保存到本地**：
    - 目录：`public/images/ai-children/`
    - 文件名：`{timestamp}-{random}.png`
9. **返回结果**：
    - 成功：返回本地静态资源 URL
    - 失败（保存失败）：降级返回智谱临时 URL，附带 warning

### Mock 数据说明

**Mock 模式图片列表：**

```
/images/ai-children/1766374356248-m4qa5.png
/images/ai-children/1766374506450-uhdyoh.png
/images/ai-children/1766374579725-u3lnyo.png
/images/ai-children/1766539253712-enlwny.png
/images/ai-children/1766561009253-rcpymh.png
/images/ai-children/1766569554612-3xkep.png
/images/ai-children/1766569619677-8ts6gh.png
```

Mock 模式根据 `sceneIndex` 返回对应图片（保证顺序稳定），随机生成 2-5 秒的生成时间。

### 响应示例

**成功响应（正常模式）：**

```json
{
    "success": true,
    "imageUrl": "/images/ai-children/1704067200000-abc123.png",
    "originalUrl": "https://zhipu-temp-url.com/image.png",
    "storagePath": "images/ai-children/1704067200000-abc123.png",
    "model": "cogview-4",
    "generationTime": 12345,
    "metadata": {
        "prompt": "a cute white rabbit...",
        "negativePrompt": "blurry, low quality",
        "width": 1024,
        "height": 1024,
        "steps": 50,
        "seed": 123456
    }
}
```

**成功响应（Mock 模式）：**

```json
{
    "success": true,
    "imageUrl": "/images/ai-children/1766374356248-m4qa5.png",
    "originalUrl": "https://mock-zhipu-url.com/images/ai-children/1766374356248-m4qa5.png",
    "storagePath": "images/ai-children/1766374356248-m4qa5.png",
    "model": "glm-image",
    "generationTime": 3241,
    "metadata": {
        "prompt": "测试提示词",
        "negativePrompt": "",
        "width": 1024,
        "height": 1024,
        "steps": 50,
        "seed": 987654
    }
}
```

**降级响应（保存失败）：**

```json
{
    "success": true,
    "imageUrl": "https://zhipu-temp-url.com/image.png",
    "model": "cogview-4",
    "generationTime": 12345,
    "warning": "图片保存失败，使用临时URL",
    "error": "No space left on device",
    "metadata": {
        "prompt": "a cute white rabbit...",
        "negativePrompt": "",
        "width": 1024,
        "height": 1024,
        "steps": 50,
        "seed": 123456
    }
}
```

---

## 错误码说明

所有接口使用统一的 HTTP 状态码和错误格式。

### HTTP 状态码

| 状态码 | 说明                 | 示例场景                               |
| ------ | -------------------- | -------------------------------------- |
| 200    | 成功                 | 请求成功完成                           |
| 400    | 参数验证失败         | 缺少必填参数、参数类型错误、枚举值无效 |
| 401    | API Key 无效或已过期 | `ZHIPU_API_KEY` 配置错误或已失效       |
| 402    | 账户余额不足         | 智谱账户余额不足                       |
| 429    | 请求过于频繁         | 触发速率限制                           |
| 500    | 服务器错误           | AI 服务内部错误、参数解析失败          |
| 504    | 请求超时             | 请求超过设定时间（文本 30s、图像 60s） |

### 错误响应格式

**标准错误响应：**

```json
{
    "error": "错误描述信息",
    "details": "详细错误信息（可选）",
    "rawText": "原始文本（仅解析失败时）"
}
```

**参数验证错误示例：**

```json
{
    "error": "参数验证失败",
    "details": [
        "child_age 必须是以下值之一: infant, preschool, early_elementary",
        "themes 是必填字段，且必须是非空数组"
    ]
}
```

**API 错误示例：**

```json
{
    "error": "生成失败",
    "details": "Invalid API key provided"
}
```

---

## 典型调用流程

### 完整的绘本生成流程

1. **创建分镜脚本**

    ```
    POST /api/create-prompt
    ```

    - 输入：故事概述、年龄段、风格、主题
    - 输出：8-12 个场景，每个包含绘本文字和 AI 图像提示词

2. **生成插画**

    ```
    POST /api/generate-ai-children-picture
    ```

    - 对每个场景调用一次
    - 输入：`scenes[].img_text_prompt`
    - 输出：图片 URL

3. **可选：美化内容**

    ```
    POST /api/beautify-story
    POST /api/generate-central-idea
    ```

    - 在创建分镜前，可以先美化故事或生成中心思想

### 示例代码

```javascript
// 1. 创建绘本分镜
const scriptResponse = await fetch('/api/create-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        child_age: 'preschool',
        illustration_style: 'watercolor',
        themes: ['emotional_education'],
        story_overview: '小兔子学会分享',
        central_idea: '分享使人快乐',
    }),
});

const { scenes } = await scriptResponse.json();

// 2. 为每个场景生成插画
const images = await Promise.all(
    scenes.map(async (scene, index) => {
        const response = await fetch('/api/generate-ai-children-picture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: scene.img_text_prompt,
                size: '1024x1024',
                sceneIndex: index,
            }),
        });
        return await response.json();
    }),
);

// 3. 组合绘本
const pictureBook = scenes.map((scene, index) => ({
    text: scene.text,
    image: images[index].imageUrl,
}));
```

---

## 环境变量配置

### 必需环境变量

```env
ZHIPU_API_KEY=your_zhipu_api_key_here
```

### 可选环境变量

```env
# Mock 模式（设为 false 时使用 Mock 数据）
USE_MOCK_DATA=false
```

### API Key 获取

1. 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 创建 API Key
4. 将 Key 配置到项目环境变量中

---

## 注意事项

1. **API Key 安全**：不要将 API Key 提交到版本控制系统
2. **超时设置**：图像生成需要较长时间，建议设置 60 秒超时
3. **Mock 模式**：开发调试时可使用 Mock 模式节省配额
4. **图片存储**：生成的图片保存在 `public/images/ai-children/` 目录
5. **角色一致性**：确保所有场景的角色外观描述一致
6. **配额管理**：注意智谱 API 的调用频率和配额限制

---

## 更新日志

- 2024-01-27：初始版本，包含 4 个接口的完整文档
