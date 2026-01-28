import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyOverview, childAge, themes } = body;

    // 参数验证
    if (!storyOverview || storyOverview.trim() === '') {
      return NextResponse.json({ error: '故事概述不能为空' }, { status: 400 });
    }

    // 检查智谱 API Key
    const zhipuApiKey = process.env.ZHIPU_API_KEY;
    if (!zhipuApiKey || zhipuApiKey.includes('placeholder')) {
      return NextResponse.json(
        { error: 'Zhipu API Key 未配置' },
        { status: 500 }
      );
    }

    // 年龄段映射
    const ageLabels: Record<string, string> = {
      infant: '0-2岁婴幼儿',
      preschool: '3-6岁学龄前儿童',
      early_elementary: '6-8岁小学低年级',
    };

    // 主题映射
    const themeLabels: Record<string, string> = {
      emotional_education: '情感教育',
      cognitive_learning: '认知学习',
      social_behavior: '社会行为',
      natural_science: '自然科学',
      fantasy_adventure: '奇幻冒险',
    };

    const ageLabel = childAge ? ageLabels[childAge] || childAge : '';
    const themeLabelsStr = themes
      ? themes.map((t: string) => themeLabels[t] || t).join('、')
      : '';

    // 构建 Prompt
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

    // 调用智谱 API
    const startTime = Date.now();

    const response = await fetch(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
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
          max_tokens: 500,
          temperature: 0.7,
          stream: false,
        }),
        signal: AbortSignal.timeout(30000), // 30秒超时
      }
    );

    // 处理响应
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
        return NextResponse.json(
          { error: 'API Key 无效或已过期' },
          { status: 401 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: '请求过于频繁，请稍后重试' },
          { status: 429 }
        );
      } else if (response.status === 402) {
        return NextResponse.json(
          { error: '账户余额不足，请充值' },
          { status: 402 }
        );
      } else {
        return NextResponse.json(
          {
            error: '美化失败',
            details: errorData.error?.message || response.statusText,
          },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    const generationTime = Date.now() - startTime;

    // 提取生成的文本
    const beautifiedText = data.choices?.[0]?.message?.content;

    if (!beautifiedText) {
      console.error('智谱 API 返回数据异常:', data);
      return NextResponse.json(
        { error: '未获取到美化后的内容' },
        { status: 500 }
      );
    }

    // 清理可能的 markdown 格式或多余内容
    let cleanedText = beautifiedText.trim();

    // 移除可能的引号
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

    // 返回结果
    return NextResponse.json({
      success: true,
      beautifiedStory: cleanedText,
      generationTime: generationTime,
      metadata: {
        model: data.model || 'glm-4-flash',
        usage: data.usage,
      },
    });
  } catch (error) {
    console.error('美化故事概述 API 错误:', error);

    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ error: '请求超时，请重试' }, { status: 504 });
    }

    return NextResponse.json(
      {
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
