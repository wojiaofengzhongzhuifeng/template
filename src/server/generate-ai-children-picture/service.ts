import type { GenerateAiChildrenPicture } from './type';

export const generateAiChildrenPicture = async (data: GenerateAiChildrenPicture) => {
    const { prompt, negativePrompt, model, size, sceneIndex } = data;

    const useMockData = process.env.USE_MOCK_GENERATE_PIC?.toLowerCase().trim() === 'true';

    if (useMockData) {
        return generateMockImage(prompt, negativePrompt, size, sceneIndex);
    }

    return generateRealImage(prompt, negativePrompt, model, size);
};

const generateMockImage = async (
    prompt: string,
    negativePrompt: string | undefined,
    size: string | undefined,
    sceneIndex?: number,
) => {
    const MOCK_IMAGES = [
        '/images/ai-children/1766374356248-m4qa5.png',
        '/images/ai-children/1766374506450-uhdyoh.png',
        '/images/ai-children/1766374579725-u3lnyo.png',
        '/images/ai-children/1766539253712-enlwny.png',
        '/images/ai-children/1766561009253-rcpymh.png',
        '/images/ai-children/1766569554612-3xkep.png',
        '/images/ai-children/1766569619677-8ts6gh.png',
    ];

    const index = sceneIndex !== undefined ? sceneIndex : 0;
    const imageUrl = MOCK_IMAGES[index % MOCK_IMAGES.length];

    let width = 1024;
    let height = 1024;
    if (size && size.includes('x')) {
        const [w, h] = size.split('x').map(Number);
        if (!Number.isNaN(w) && !Number.isNaN(h)) {
            width = w;
            height = h;
        }
    }

    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));

    return {
        success: true,
        imageUrl,
        originalUrl: `https://mock-zhipu-url.com${imageUrl}`,
        storagePath: imageUrl.replace('/images/', 'images/'),
        model: 'glm-image',
        generationTime: Math.floor(Math.random() * 3000) + 2000,
        metadata: {
            prompt,
            negativePrompt: negativePrompt || '',
            width,
            height,
            steps: 50,
            seed: Math.floor(Math.random() * 1000000),
        },
    };
};

const generateRealImage = async (
    prompt: string,
    negativePrompt: string | undefined,
    model: string,
    size: string,
) => {
    const zhipuApiKey = process.env.ZHIPU_API_KEY;
    if (!zhipuApiKey || zhipuApiKey.includes('placeholder')) {
        throw new Error('Zhipu API Key 未配置');
    }

    let width = 1024;
    let height = 1024;
    if (size && size.includes('x')) {
        const [w, h] = size.split('x').map(Number);
        if (!Number.isNaN(w) && !Number.isNaN(h)) {
            width = w;
            height = h;
        }
    }

    const requestBody = {
        model: model || 'cogview-4',
        prompt,
        negative_prompt: negativePrompt || '',
        size: `${width}x${height}`,
        steps: 50,
        seed: Math.floor(Math.random() * 1000000),
        quality: 'standard',
        style: 'natural',
    };

    const startTime = Date.now();

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${zhipuApiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch {
            errorData = { error: { message: errorText } };
        }

        const errorMessage = errorData.error?.message || response.statusText;

        if (response.status === 401) {
            throw new Error('API Key 无效或已过期');
        } else if (response.status === 429) {
            throw new Error('请求过于频繁，请稍后重试');
        } else if (response.status === 402) {
            throw new Error('账户余额不足，请充值');
        } else {
            throw new Error(`图片生成失败: ${errorMessage}`);
        }
    }

    const data = await response.json();
    const generationTime = Date.now() - startTime;

    const zhipuImageUrl = data.data?.[0]?.url || data.image_url || data.image_urls?.[0];

    if (!zhipuImageUrl) {
        throw new Error('未获取到生成的图片');
    }

    let imageBuffer: Buffer;
    try {
        const imageResponse = await fetch(zhipuImageUrl);
        if (!imageResponse.ok) {
            throw new Error(`下载图片失败: HTTP ${imageResponse.status}`);
        }
        imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    } catch (downloadError) {
        throw new Error(
            `下载生成的图片失败: ${downloadError instanceof Error ? downloadError.message : '未知错误'}`,
        );
    }

    const fs = await import('node:fs');
    const path = await import('node:path');

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomStr}.png`;

    const imagesDir = path.join(process.cwd(), 'public', 'images', 'ai-children');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }

    const filePath = path.join(imagesDir, fileName);
    fs.writeFileSync(filePath, imageBuffer);

    const publicUrl = `/images/ai-children/${fileName}`;

    return {
        success: true,
        imageUrl: publicUrl,
        originalUrl: zhipuImageUrl,
        storagePath: `images/ai-children/${fileName}`,
        model: data.model || requestBody.model,
        generationTime,
        metadata: {
            prompt,
            negativePrompt,
            width,
            height,
            steps: 50,
            seed: requestBody.seed,
        },
    };
};
