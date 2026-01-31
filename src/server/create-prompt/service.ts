'use server';

import type { CreatePromptRequest, CreatePromptResponse } from './type';

const AGE_LABELS: Record<string, string> = {
    infant: '0-2岁婴幼儿',
    preschool: '3-6岁学龄前儿童',
    early_elementary: '6-8岁小学低年级',
};

const STYLE_LABELS: Record<string, string> = {
    watercolor: '水彩画风格',
    crayon: '蜡笔画风格',
    cartoon: '卡通动画风格',
    clay_3d: '3D黏土风格',
    paper_cut: '剪纸拼贴风格',
};

const THEME_LABELS: Record<string, string> = {
    emotional_education: '情感教育',
    cognitive_learning: '认知学习',
    social_behavior: '社交行为',
    natural_science: '自然科学',
    fantasy_adventure: '奇幻冒险',
};

const VALID_AGES = ['infant', 'preschool', 'early_elementary'];
const VALID_STYLES = ['watercolor', 'crayon', 'cartoon', 'clay_3d', 'paper_cut'];
const VALID_THEMES = [
    'emotional_education',
    'cognitive_learning',
    'social_behavior',
    'natural_science',
    'fantasy_adventure',
];

const stylePromptMap: Record<string, { style: string; technique: string }> = {
    watercolor: {
        style: 'soft watercolor painting style',
        technique:
            'delicate brush strokes, flowing colors, subtle color blending, transparent washes, soft edges',
    },
    crayon: {
        style: 'children crayon drawing style',
        technique:
            'bold colorful strokes, textured lines, vibrant colors, hand-drawn feel, playful scribbles',
    },
    cartoon: {
        style: 'cute cartoon animation style',
        technique:
            'clean outlines, bright flat colors, expressive characters, smooth gradients, Disney-Pixar inspired',
    },
    clay_3d: {
        style: '3D clay sculpture style, claymation',
        technique:
            'soft rounded shapes, matte textures, sculpted details, stop-motion aesthetic, tactile appearance',
    },
    paper_cut: {
        style: 'paper cut collage art style',
        technique:
            'layered paper textures, geometric shapes, torn edges, handcrafted feel, dimensional layers',
    },
};

export async function createPrompt(data: CreatePromptRequest): Promise<CreatePromptResponse> {
    console.log('创建绘本请求:', data);

    const { child_age, illustration_style, themes, story_overview, central_idea } = data;

    const errors: string[] = [];

    if (!child_age) {
        errors.push('child_age 是必填字段');
    } else if (!VALID_AGES.includes(child_age)) {
        errors.push(`child_age 必须是以下值之一: ${VALID_AGES.join(', ')}`);
    }

    if (!illustration_style) {
        errors.push('illustration_style 是必填字段');
    } else if (!VALID_STYLES.includes(illustration_style)) {
        errors.push(`illustration_style 必须是以下值之一: ${VALID_STYLES.join(', ')}`);
    }

    if (!themes || !Array.isArray(themes) || themes.length === 0) {
        errors.push('themes 是必填字段，且必须是非空数组');
    } else {
        const invalidThemes = themes.filter((t) => !VALID_THEMES.includes(t));
        if (invalidThemes.length > 0) {
            errors.push(
                `无效的主题: ${invalidThemes.join(', ')}。有效值: ${VALID_THEMES.join(', ')}`,
            );
        }
    }

    if (!story_overview || story_overview.trim() === '') {
        errors.push('story_overview 是必填字段');
    }

    if (errors.length > 0) {
        throw new Error(`参数验证失败: ${errors.join('; ')}`);
    }

    const zhipuApiKey = process.env.ZHIPU_API_KEY;
    if (!zhipuApiKey || zhipuApiKey.includes('placeholder')) {
        throw new Error('Zhipu API Key 未配置');
    }

    const ageLabel = child_age ? AGE_LABELS[child_age] : child_age;
    const styleLabel = illustration_style ? STYLE_LABELS[illustration_style] : illustration_style;
    const themeLabels = themes.map((t) => THEME_LABELS[t] || t).join('、');

    const styleInfo = illustration_style
        ? stylePromptMap[illustration_style]
        : stylePromptMap.watercolor;

    const systemPrompt = `你是一位专业的儿童绘本创作专家，同时精通 AI 图像生成（如 Stable Diffusion、DALL-E、Midjourney、CogView）的提示词工程。

你的核心能力：
1. 创作适合不同年龄段儿童的绘本故事
2. 编写专业的 AI 图像生成提示词（prompt），能够精确控制生成图像的风格、构图、角色外观

【重要】img_text_prompt 是用于 AI 图像生成的技术性描述，不是故事文字的翻译！它需要：
- 详细描述画面中的视觉元素
- 包含专业的图像生成关键词
- 确保角色在所有场景中外观一致`;

    const userPrompt = `请根据以下信息创建一个完整的绘本故事分镜脚本。

【基本信息】
- 目标读者：${ageLabel}
- 插画风格：${styleLabel}
- 教育主题：${themeLabels}
- 故事概述：${story_overview}
- 中心思想：${central_idea}

【输出要求】
生成 8-12 个分镜场景，每个场景包含：

1. **text**（绘本文字）
   - 给孩子阅读的故事文字
   - 语言适合${ageLabel}
   - 简洁温暖，富有童趣

2. **img_text_prompt**（AI图像生成提示词）

   ⚠️ 这是用于 AI 生成插画的专业提示词，必须按照以下结构编写：

   **必须包含的要素（按顺序）：**

   a) 【画面主体】主角的完整外观描述（每个场景都要重复，保持一致）
      - 物种/角色类型
      - 体型特征（小巧/圆润等）
      - 颜色和毛发/皮肤特征
      - 眼睛特征（大小、颜色、形状）
      - 服装/配饰（如果有）
      示例：a small chubby white rabbit, fluffy soft fur, big sparkling round eyes with pink pupils, long floppy ears with pink inner, wearing a light blue knitted vest with a small heart button

   b) 【动作姿态】角色正在做什么
      示例：sitting with paws together, head slightly tilted, looking curiously

   c) 【场景环境】背景和环境描述
      示例：in a sunny flower meadow, surrounded by colorful wildflowers, a big oak tree in background

   d) 【情绪氛围】画面传达的情感
      示例：feeling shy but curious, gentle and warm atmosphere

   e) 【构图镜头】视角和构图方式
      选择：wide shot（全景）/ medium shot（中景）/ close-up（特写）/ bird's eye view（俯视）/ low angle（仰视）
      示例：medium shot, centered composition, eye-level view

   f) 【风格关键词】必须包含以下风格描述：
      ${styleInfo.style}, ${styleInfo.technique}

   g) 【质量关键词】结尾添加：
      children's picture book illustration, masterpiece, best quality, highly detailed, 8k

   **完整示例：**
   "a small chubby white rabbit, fluffy soft fur, big sparkling round eyes with pink pupils, long floppy ears with pink inner, wearing a light blue knitted vest with a small heart button, sitting alone under a large oak tree with twisted branches, paws hugging knees, looking at distant animals playing with a shy and longing expression, in a sunny meadow filled with colorful wildflowers and butterflies, soft golden afternoon light filtering through leaves, warm and slightly melancholic atmosphere, medium shot, centered composition, ${styleInfo.style}, ${styleInfo.technique}, children's picture book illustration, masterpiece, best quality, highly detailed"

【角色一致性规则】
- 为每个主要角色设定固定的外观描述
- 在所有场景的 img_text_prompt 中使用完全相同的角色外观描述
- 只改变动作、表情、场景，不改变角色的基本特征

【输出格式】
严格按照 JSON 数组格式输出，不要添加任何额外说明或 markdown 代码块：
[
  {
    "text": "绘本文字内容",
    "img_text_prompt": "完整的AI图像生成提示词"
  }
]`;

    console.log('正在调用智谱 API 生成绘本分镜:', {
        child_age: ageLabel,
        illustration_style: styleLabel,
        themes: themeLabels,
        story_overview: `${story_overview.substring(0, 50)}...`,
    });

    const startTime = Date.now();

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${zhipuApiKey}`,
        },
        body: JSON.stringify({
            model: 'glm-4-flash',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: 4096,
            temperature: 0.8,
            stream: false,
        }),
        signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('智谱 API 错误:', {
            status: response.status,
            body: errorText,
        });

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
            throw new Error(`生成失败: ${errorData.error?.message || response.statusText}`);
        }
    }

    const apiData = await response.json();
    const generationTime = Date.now() - startTime;

    const generatedText = apiData.choices?.[0]?.message?.content;

    if (!generatedText) {
        console.error('智谱 API 返回数据异常:', apiData);
        throw new Error('未获取到生成的内容');
    }

    console.log('智谱 API 返回原始文本:', `${generatedText.substring(0, 200)}...`);

    let scenes: { text: string; img_text_prompt: string }[];
    try {
        let jsonText = generatedText.trim();

        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.slice(7);
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.slice(3);
        }
        if (jsonText.endsWith('```')) {
            jsonText = jsonText.slice(0, -3);
        }
        jsonText = jsonText.trim();

        scenes = JSON.parse(jsonText);

        if (!Array.isArray(scenes)) {
            throw new TypeError('返回的不是数组格式');
        }

        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            if (!scene.text || typeof scene.text !== 'string') {
                throw new Error(`第 ${i + 1} 个场景缺少有效的 text 字段`);
            }
            if (!scene.img_text_prompt || typeof scene.img_text_prompt !== 'string') {
                throw new Error(`第 ${i + 1} 个场景缺少有效的 img_text_prompt 字段`);
            }
        }
    } catch (parseError) {
        console.error('解析生成的 JSON 失败:', parseError);
        console.error('原始文本:', generatedText);
        throw new Error(
            `解析生成的内容失败: ${parseError instanceof Error ? parseError.message : '未知错误'}`,
        );
    }

    console.log('绘本分镜生成成功:', {
        generationTime: `${generationTime}ms`,
        sceneCount: scenes.length,
    });

    return {
        success: true,
        scenes,
        sceneCount: scenes.length,
        generationTime,
        metadata: {
            child_age,
            child_age_label: ageLabel,
            illustration_style,
            illustration_style_label: styleLabel,
            themes,
            themes_label: themeLabels,
            story_overview,
            central_idea: central_idea || null,
            model: apiData.model || 'glm-4-flash',
            usage: apiData.usage,
        },
    };
}
