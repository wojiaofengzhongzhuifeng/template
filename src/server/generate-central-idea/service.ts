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

export async function generateCentralIdea(data: {
    centralIdea?: string;
    storyOverview: string;
    childAge?: string;
    themes?: string[];
}) {
    const { centralIdea, storyOverview, childAge, themes } = data;

    const ageLabel = childAge ? AGE_LABELS[childAge] || childAge : '';
    const themeLabelsStr = themes ? themes.map((t) => THEME_LABELS[t] || t).join('、') : '';

    const isGenerating = !centralIdea || centralIdea.trim() === '';

    const systemPrompt = `你是一位专业的儿童绘本编辑，擅长创作和优化绘本的中心思想，确保教育意义和趣味性的平衡。`;

    let userPrompt: string;
    const isGenerated = isGenerating;

    if (isGenerating) {
        userPrompt = `请根据以下故事概述，生成一个简洁、富有教育意义的中心思想。

${ageLabel ? `目标读者：${ageLabel}\n` : ''}${themeLabelsStr ? `主题：${themeLabelsStr}\n` : ''}故事概述：
${storyOverview}

要求：
1. 中心思想要简洁明了，8-15个字
2. 突出故事的核心教育意义
3. 语言适合儿童理解，富有童趣
4. 体现积极向上的价值观
5. 直接返回中心思想，不要添加任何解释或标记`;
    } else {
        userPrompt = `请帮我美化以下中心思想，使其更加精炼、生动、富有教育意义。

${ageLabel ? `目标读者：${ageLabel}\n` : ''}${themeLabelsStr ? `主题：${themeLabelsStr}\n` : ''}故事概述：
${storyOverview}

原始中心思想：
${centralIdea}

要求：
1. 保持原有的核心教育意义不变
2. 使用更生动、更具感染力的语言
3. 语言精炼，控制在8-15个字
4. 适合儿童理解，富有童趣
5. 直接返回美化后的中心思想，不要添加任何解释或标记`;
    }

    console.log('正在调用智谱 API 生成/美化中心思想');

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
            max_tokens: 100,
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

    const ideaText = responseData.choices?.[0]?.message?.content;

    if (!ideaText) {
        console.error('智谱 API 返回数据异常:', responseData);
        throw new Error('未获取到生成/美化的中心思想');
    }

    let cleanedText = ideaText.trim();

    if (
        (cleanedText.startsWith('"') && cleanedText.endsWith('"')) ||
        (cleanedText.startsWith("'") && cleanedText.endsWith("'"))
    ) {
        cleanedText = cleanedText.slice(1, -1);
    }

    console.log('中心思想生成/美化成功:', {
        isGenerated,
        generationTime: `${generationTime}ms`,
        originalLength: isGenerating ? 0 : centralIdea!.length,
        newLength: cleanedText.length,
    });

    return {
        success: true,
        centralIdea: cleanedText,
        isGenerated,
        generationTime,
        metadata: {
            model: responseData.model || 'glm-4-flash',
            usage: responseData.usage,
        },
    };
}
