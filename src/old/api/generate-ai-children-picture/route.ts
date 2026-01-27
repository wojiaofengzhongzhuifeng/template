import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Mock 测试图片列表
const MOCK_IMAGES = [
    '/images/ai-children/1766374356248-m4qa5.png',
    '/images/ai-children/1766374506450-uhdyoh.png',
    '/images/ai-children/1766374579725-u3lnyo.png',
    '/images/ai-children/1766539253712-enlwny.png',
    '/images/ai-children/1766561009253-rcpymh.png',
    '/images/ai-children/1766569554612-3xkep.png',
    '/images/ai-children/1766569619677-8ts6gh.png',
];

// 生成 Mock 响应
function getMockResponse(
    prompt: string,
    negativePrompt?: string,
    size?: string,
    sceneIndex?: number,
) {
    // 根据 sceneIndex 返回对应图片，保证顺序稳定
    const index = sceneIndex !== undefined ? sceneIndex : 0;
    const imageUrl = MOCK_IMAGES[index % MOCK_IMAGES.length];

    // 解析尺寸
    let width = 1024;
    let height = 1024;
    if (size && size.includes('x')) {
        const [w, h] = size.split('x').map(Number);
        if (!isNaN(w) && !isNaN(h)) {
            width = w;
            height = h;
        }
    }

    return {
        success: true,
        imageUrl,
        originalUrl: `https://mock-zhipu-url.com${imageUrl}`,
        storagePath: imageUrl.replace('/images/', 'images/'),
        model: 'glm-image',
        generationTime: Math.floor(Math.random() * 3000) + 2000, // 随机 2-5 秒
        metadata: {
            prompt,
            negativePrompt: negativePrompt || '',
            width,
            height,
            steps: 50,
            seed: Math.floor(Math.random() * 1000000),
        },
    };
}

export async function POST(request: NextRequest) {
    try {
        // 1. 解析请求参数
        const body = await request.json();
        const { prompt, negativePrompt, model, size, sceneIndex } = body;

        // 检查是否使用 Mock 数据（忽略大小写和空格）
        if (process.env.USE_MOCK_DATA?.toLowerCase().trim() === 'false') {
            console.log('使用 Mock 数据返回测试图片');

            // Mock 模式下也需要验证 prompt
            if (!prompt || prompt.trim() === '') {
                return NextResponse.json({ error: '请提供图片描述' }, { status: 400 });
            }

            // 模拟一定的延迟（500ms-1500ms）
            await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));

            return NextResponse.json(getMockResponse(prompt, negativePrompt, size, sceneIndex));
        }

        // 2. 参数验证
        if (!prompt || prompt.trim() === '') {
            return NextResponse.json({ error: '请提供图片描述' }, { status: 400 });
        }

        // 3. 检查智谱 API Key
        const zhipuApiKey = process.env.ZHIPU_API_KEY;
        if (!zhipuApiKey || zhipuApiKey.includes('placeholder')) {
            return NextResponse.json({ error: 'Zhipu API Key 未配置' }, { status: 500 });
        }

        // 4. 解析尺寸
        let width = 1024;
        let height = 1024;
        if (size && size.includes('x')) {
            const [w, h] = size.split('x').map(Number);
            if (!isNaN(w) && !isNaN(h)) {
                width = w;
                height = h;
            }
        }

        // 5. 准备智谱 API 请求参数
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

        console.log('正在调用智谱 CogView-4 API:', {
            model: requestBody.model,
            prompt: `${requestBody.prompt.substring(0, 50)}...`,
            size: requestBody.size,
        });

        // 6. 直接调用智谱 API（不使用封装）
        const startTime = Date.now();

        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${zhipuApiKey}`,
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(60000), // 60秒超时
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

            // 根据错误类型返回友好提示
            if (response.status === 401) {
                return NextResponse.json({ error: 'API Key 无效或已过期' }, { status: 401 });
            } else if (response.status === 429) {
                return NextResponse.json({ error: '请求过于频繁，请稍后重试' }, { status: 429 });
            } else if (response.status === 402) {
                return NextResponse.json({ error: '账户余额不足，请充值' }, { status: 402 });
            } else {
                return NextResponse.json(
                    {
                        error: '图片生成失败',
                        details: errorData.error?.message || response.statusText,
                    },
                    { status: response.status },
                );
            }
        }

        const data = await response.json();
        const generationTime = Date.now() - startTime;

        // 8. 提取智谱返回的临时图片 URL
        const zhipuImageUrl = data.data?.[0]?.url || data.image_url || data.image_urls?.[0];

        if (!zhipuImageUrl) {
            console.error('智谱 API 返回数据异常:', data);
            return NextResponse.json({ error: '未获取到生成的图片' }, { status: 500 });
        }

        console.log('智谱图片生成成功，开始下载并保存到本地:', {
            generationTime: `${generationTime}ms`,
            zhipuUrl: `${zhipuImageUrl.substring(0, 50)}...`,
        });

        // 9. 从智谱 URL 下载图片
        let imageBuffer: Buffer;
        try {
            const imageResponse = await fetch(zhipuImageUrl);
            if (!imageResponse.ok) {
                throw new Error(`下载图片失败: HTTP ${imageResponse.status}`);
            }
            imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            console.log('图片下载成功，大小:', imageBuffer.length, 'bytes');
        } catch (downloadError) {
            console.error('下载智谱图片失败:', downloadError);
            return NextResponse.json(
                {
                    error: '下载生成的图片失败',
                    details: downloadError instanceof Error ? downloadError.message : '未知错误',
                },
                { status: 500 },
            );
        }

        // 10. 保存到本地 public/images/ai-children 目录
        try {
            // 生成唯一文件名
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(7);
            const fileName = `${timestamp}-${randomStr}.png`;

            // 确保目录存在
            const imagesDir = path.join(process.cwd(), 'public', 'images', 'ai-children');
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true });
                console.log('创建目录:', imagesDir);
            }

            // 保存文件
            const filePath = path.join(imagesDir, fileName);
            fs.writeFileSync(filePath, imageBuffer);

            // 生成访问URL（相对于 public 目录）
            const publicUrl = `/images/ai-children/${fileName}`;

            console.log('图片保存成功:', {
                filePath,
                publicUrl,
            });

            // 11. 返回本地静态资源 URL
            return NextResponse.json({
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
            });
        } catch (saveError) {
            console.error('保存图片到本地失败:', saveError);

            // 如果保存失败，降级返回智谱临时URL
            return NextResponse.json({
                success: true,
                imageUrl: zhipuImageUrl,
                model: data.model || requestBody.model,
                generationTime,
                warning: '图片保存失败，使用临时URL',
                error: saveError instanceof Error ? saveError.message : '保存失败',
                metadata: {
                    prompt,
                    negativePrompt,
                    width,
                    height,
                    steps: 50,
                    seed: requestBody.seed,
                },
            });
        }
    } catch (error) {
        console.error('生成图片 API 错误:', error);

        if (error instanceof Error && error.name === 'AbortError') {
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
