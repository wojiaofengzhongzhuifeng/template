'use server';

const AGE_LABELS: Record<string, string> = {
    infant: '0-2岁婴幼儿',
    preschool: '3-6岁学龄前儿童',
    early_elementary: '6-8岁小学低年级',
};

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

    const ageLabel = childAge ? AGE_LABELS[childAge] || childAge : '';
    const themeLabelsStr = themes ? themes.map((t) => THEME_LABELS[t] || t).join('、') : '';

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
