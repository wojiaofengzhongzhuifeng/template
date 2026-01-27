import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

// 年龄段映射
const AGE_LABELS: Record<string, string> = {
    infant: '0-2岁婴幼儿',
    preschool: '3-6岁学龄前儿童',
    early_elementary: '6-8岁小学低年级',
};

// 插画风格映射
const STYLE_LABELS: Record<string, string> = {
    watercolor: '水彩画风格',
    crayon: '蜡笔画风格',
    cartoon: '卡通动画风格',
    clay_3d: '3D黏土风格',
    paper_cut: '剪纸拼贴风格',
};

// 主题映射
const THEME_LABELS: Record<string, string> = {
    emotional_education: '情感教育',
    cognitive_learning: '认知学习',
    social_behavior: '社交行为',
    natural_science: '自然科学',
    fantasy_adventure: '奇幻冒险',
};

// 有效的枚举值
const VALID_AGES = ['infant', 'preschool', 'early_elementary'];
const VALID_STYLES = ['watercolor', 'crayon', 'cartoon', 'clay_3d', 'paper_cut'];
const VALID_THEMES = [
    'emotional_education',
    'cognitive_learning',
    'social_behavior',
    'natural_science',
    'fantasy_adventure',
];

// 请求体类型
interface CreatePromptRequest {
    child_age: string;
    illustration_style: string;
    themes: string[];
    story_overview: string;
    central_idea?: string;
}

// 响应场景类型
interface StoryScene {
    text: string;
    img_text_prompt: string;
}

// Mock 测试数据
const _MOCK_RESPONSE = {
    success: true,
    scenes: [
        {
            text: '小猫在花园里找到了一篮子美味的食物。123321321',
            img_text_prompt: '第一条提示词',
        },
        {
            text: '小猫看着篮子里的食物，想起了它的好朋友小狗。',
            img_text_prompt: '第二条提示词',
        },
        {
            text: '小猫决定把食物分成两份，一份给自己，一份给小狗。',
            img_text_prompt: '第三条提示词',
        },
        {
            text: '小猫和小狗一起分享了美味的食物，感到非常快乐。',
            img_text_prompt: '第四条提示词',
        },
        {
            text: '小猫学会了分享，它感到非常自豪。',
            img_text_prompt: '第五条提示词',
        },
        {
            text: '小狗也学会了分享，它把它的玩具给小猫玩。',
            img_text_prompt: '第六条提示词',
        },
        {
            text: '小猫和小狗成为了最好的朋友，一起玩耍。',
            img_text_prompt: '第七条提示词',
        },
        {
            text: '小猫和小狗一起度过了美好的时光，它们学会了分享的重要性。',
            img_text_prompt: '第八条提示词',
        },
    ],
    sceneCount: 8,
    generationTime: 52447,
    metadata: {
        child_age: 'infant',
        child_age_label: '0-2岁婴幼儿',
        illustration_style: 'crayon',
        illustration_style_label: '蜡笔画风格',
        themes: ['emotional_education'],
        themes_label: '情感教育',
        story_overview: '小猫分享食物',
        central_idea: '学会分享',
        model: 'glm-4-flash',
        usage: {
            completion_tokens: 991,
            prompt_tokens: 902,
            total_tokens: 1893,
        },
    },
};

export async function POST(request: NextRequest) {
    try {
        console.log(
            'process.env.USE_MOCK_DATA',
            process.env.USE_MOCK_DATA,
            typeof process.env.USE_MOCK_DATA,
        );
        // 检查是否使用 Mock 数据（忽略大小写和空格）
        // if (process.env.USE_MOCK_DATA?.toLowerCase().trim() === 'true') {
        //   console.log('使用 Mock 数据返回测试响应');
        //   return NextResponse.json(MOCK_RESPONSE);
        // }

        // 1. 解析请求参数
        const body: CreatePromptRequest = await request.json();
        const { child_age, illustration_style, themes, story_overview, central_idea } = body;

        // 2. 参数验证
        const errors: string[] = [];

        // 验证 child_age
        if (!child_age) {
            errors.push('child_age 是必填字段');
        } else if (!VALID_AGES.includes(child_age)) {
            errors.push(`child_age 必须是以下值之一: ${VALID_AGES.join(', ')}`);
        }

        // 验证 illustration_style
        if (!illustration_style) {
            errors.push('illustration_style 是必填字段');
        } else if (!VALID_STYLES.includes(illustration_style)) {
            errors.push(`illustration_style 必须是以下值之一: ${VALID_STYLES.join(', ')}`);
        }

        // 验证 themes
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

        // 验证 story_overview
        if (!story_overview || story_overview.trim() === '') {
            errors.push('story_overview 是必填字段');
        }

        if (errors.length > 0) {
            return NextResponse.json({ error: '参数验证失败', details: errors }, { status: 400 });
        }

        // 3. 检查智谱 API Key
        const zhipuApiKey = process.env.ZHIPU_API_KEY;
        if (!zhipuApiKey || zhipuApiKey.includes('placeholder')) {
            return NextResponse.json({ error: 'Zhipu API Key 未配置' }, { status: 500 });
        }

        // 4. 转换参数为中文标签
        const ageLabel = AGE_LABELS[child_age] || child_age;
        const styleLabel = STYLE_LABELS[illustration_style] || illustration_style;
        const themeLabels = themes.map((t) => THEME_LABELS[t] || t).join('、');

        // 5. 插画风格的英文描述和技术关键词
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

        const styleInfo = stylePromptMap[illustration_style] || stylePromptMap.watercolor;

        // 6. 构建 Prompt
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
- 中心思想：${central_idea || '（请根据故事提炼）'}

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
      示例：in a sunny flower meadow, surrounded by colorful wildflowers, a big oak tree in the background
   
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

        // 6. 调用智谱 API
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
            signal: AbortSignal.timeout(120000), // 120秒超时（生成较长内容需要更多时间）
        });

        // 7. 处理响应
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
                return NextResponse.json({ error: 'API Key 无效或已过期' }, { status: 401 });
            } else if (response.status === 429) {
                return NextResponse.json({ error: '请求过于频繁，请稍后重试' }, { status: 429 });
            } else if (response.status === 402) {
                return NextResponse.json({ error: '账户余额不足，请充值' }, { status: 402 });
            } else {
                return NextResponse.json(
                    {
                        error: '生成失败',
                        details: errorData.error?.message || response.statusText,
                    },
                    { status: response.status },
                );
            }
        }

        const data = await response.json();
        const generationTime = Date.now() - startTime;

        // 8. 提取生成的文本
        const generatedText = data.choices?.[0]?.message?.content;

        if (!generatedText) {
            console.error('智谱 API 返回数据异常:', data);
            return NextResponse.json({ error: '未获取到生成的内容' }, { status: 500 });
        }

        console.log('智谱 API 返回原始文本:', `${generatedText.substring(0, 200)}...`);

        // 9. 解析 JSON 数组
        let scenes: StoryScene[];
        try {
            // 尝试直接解析
            let jsonText = generatedText.trim();

            // 移除可能的 markdown 代码块标记
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

            // 验证数据结构
            if (!Array.isArray(scenes)) {
                throw new TypeError('返回的不是数组格式');
            }

            // 验证每个场景的字段
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

            return NextResponse.json(
                {
                    error: '解析生成的内容失败',
                    details: parseError instanceof Error ? parseError.message : '未知错误',
                    rawText: generatedText,
                },
                { status: 500 },
            );
        }

        console.log('绘本分镜生成成功:', {
            generationTime: `${generationTime}ms`,
            sceneCount: scenes.length,
        });

        // 10. 返回结果
        return NextResponse.json({
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
                model: data.model || 'glm-4-flash',
                usage: data.usage,
            },
        });
    } catch (error) {
        console.error('创建绘本分镜 API 错误:', error);

        if (error instanceof Error && error.name === 'TimeoutError') {
            return NextResponse.json({ error: '请求超时，请重试' }, { status: 504 });
        }

        return NextResponse.json(
            {
                error: '服务器内部错误',
                details: error instanceof Error ? error.message : '未知错误',
            },
            { status: 500 },
        );
    }
}

// GET 方法：返回接口说明和参数要求
export async function GET() {
    return NextResponse.json({
        name: 'create-prompt',
        description: '创建儿童绘本分镜脚本',
        method: 'POST',
        parameters: {
            child_age: {
                type: 'string',
                required: true,
                description: '儿童年龄段',
                options: [
                    { value: 'infant', label: '0-2岁婴幼儿' },
                    { value: 'preschool', label: '3-6岁学龄前儿童' },
                    { value: 'early_elementary', label: '6-8岁小学低年级' },
                ],
            },
            illustration_style: {
                type: 'string',
                required: true,
                description: '插画风格',
                options: [
                    { value: 'watercolor', label: '水彩画风格' },
                    { value: 'crayon', label: '蜡笔画风格' },
                    { value: 'cartoon', label: '卡通动画风格' },
                    { value: 'clay_3d', label: '3D黏土风格' },
                    { value: 'paper_cut', label: '剪纸拼贴风格' },
                ],
            },
            themes: {
                type: 'array',
                required: true,
                description: '绘本主题（可多选）',
                options: [
                    { value: 'emotional_education', label: '情感教育' },
                    { value: 'cognitive_learning', label: '认知学习' },
                    { value: 'social_behavior', label: '社交行为' },
                    { value: 'natural_science', label: '自然科学' },
                    { value: 'fantasy_adventure', label: '奇幻冒险' },
                ],
            },
            story_overview: {
                type: 'string',
                required: true,
                description: '故事概述，描述故事的主要情节和角色',
            },
            central_idea: {
                type: 'string',
                required: false,
                description: '中心思想，故事想要传达的核心价值观或道理',
            },
        },
        response: {
            success: 'boolean',
            scenes: [
                {
                    text: '绘本页面上显示的故事文字（给孩子阅读）',
                    img_text_prompt:
                        '用于AI生成插画的详细英文描述（包含角色外观、动作、场景、风格等）',
                },
            ],
            sceneCount: 'number',
            generationTime: 'number (ms)',
            metadata: 'object',
        },
        fieldExplanation: {
            text: {
                description: '绘本文字内容',
                purpose: '显示在绘本页面上，供孩子阅读',
                example: '小兔子白白坐在大树下，看着远处玩耍的小伙伴们。',
            },
            img_text_prompt: {
                description: 'AI图像生成提示词',
                purpose: '用于调用图像生成API（如智谱CogView、DALL-E等）生成对应的插画',
                note: '这不是text的翻译，而是详细的视觉描述',
                includes: [
                    '角色外观特征',
                    '动作姿态',
                    '场景环境',
                    '情绪氛围',
                    '色彩基调',
                    '插画风格',
                    '构图视角',
                ],
                example:
                    "A cute white rabbit with big round eyes and long floppy ears, wearing a small blue vest, sitting alone under a big oak tree in a meadow full of colorful wildflowers. The rabbit looks shy and hesitant, watching other animals playing in the distance. Soft watercolor style, warm pastel colors, gentle sunlight filtering through leaves, children's book illustration, high quality.",
            },
        },
        example: {
            request: {
                child_age: 'preschool',
                illustration_style: 'watercolor',
                themes: ['emotional_education', 'social_behavior'],
                story_overview:
                    '一只小兔子因为胆小不敢和其他小动物玩耍，后来在帮助迷路的小鸟过程中找到了勇气和友谊。',
                central_idea: '勇气不是不害怕，而是在害怕时依然选择去做对的事情。',
            },
            response: {
                success: true,
                scenes: [
                    {
                        text: '小兔子白白有一身雪白的毛，住在森林边的小山坡上。',
                        img_text_prompt:
                            "A cute white rabbit with fluffy snow-white fur, big round sparkling eyes, and long floppy ears, standing in front of a cozy burrow on a gentle hillside at the edge of a forest. Warm morning sunlight, green grass with tiny flowers, soft watercolor style, warm pastel colors, children's book illustration, high quality.",
                    },
                    {
                        text: '每天，白白都会躲在大树后面，偷偷看着其他小动物们一起玩耍。',
                        img_text_prompt:
                            "A shy white rabbit with big round eyes peeking from behind a large oak tree trunk, watching a group of happy forest animals (a squirrel, a hedgehog, and a deer fawn) playing together in a sunny meadow. The rabbit looks lonely and hesitant. Soft watercolor style, dappled sunlight, warm golden and green tones, children's book illustration, medium shot.",
                    },
                ],
                sceneCount: 10,
                generationTime: 15234,
            },
        },
    });
}
