import z from 'zod';

export const generateAiChildrenPictureRequestExample = {
    prompt: '一只可爱的小兔子在森林里寻找胡萝卜，卡通风格，色彩鲜艳，适合儿童绘本',
    model: 'cogview-3-flash',
    size: '1280x1280',
    quality: 'hd',
    sceneIndex: 0,
};

export const generateAiChildrenPictureResponseExample = {
    success: true,
    imageUrl: 'https://example.com/images/rabbit-carrot-1280x1280.jpg',
    originalUrl: 'https://api.zhipuai.com/v4/images/abc123',
    storagePath: '/uploads/2024/01/rabbit-carrot.jpg',
    model: 'cogview-3-flash',
    generationTime: 3500,
    warning: null,
    error: null,
    metadata: {
        prompt: '一只可爱的小兔子在森林里寻找胡萝卜，卡通风格，色彩鲜艳，适合儿童绘本',
        width: 1280,
        height: 1280,
        quality: 'hd',
    },
};

export const generateAiChildrenPictureSchema = z
    .object({
        prompt: z.string().min(1).meta({
            description:
                '图片描述，详细的画面描述文本，包含角色、场景、动作、风格等信息。建议使用英文描述以获得更好的效果，支持中文。描述越详细，生成效果越好',
        }),
        model: z
            .enum(['glm-image', 'cogview-4-250304', 'cogview-4', 'cogview-3-flash'])
            .default('cogview-3-flash')
            .meta({
                description:
                    'AI 模型名称，选择使用的图像生成模型。可选值：glm-image（通用图像模型）、cogview-4-250304（CogView-4 最新版）、cogview-4（CogView-4 标准版）、cogview-3-flash（CogView-3 快速版，默认）',
            }),
        size: z.string().default('1280x1280').meta({
            description:
                '图片尺寸，格式为 宽x高。常用尺寸：1280x1280（正方形）、1920x1080（横版）、1080x1920（竖版），默认为 1280x1280',
        }),
        quality: z.enum(['hd', 'standard']).default('hd').meta({
            description:
                '图片质量，决定生成图片的精细度。可选值：hd（高清，生成更清晰的图片）、standard（标准，生成速度更快，默认）',
        }),
        sceneIndex: z.number().int().optional().meta({
            description:
                '场景索引，用于标识或追踪不同的图片生成请求，可用于 Mock 测试模式。可选字段',
        }),
    })
    .meta({
        $id: 'GenerateAiChildrenPicture',
        description: '生成 AI 儿童绘本图片请求，使用智谱 CogView 模型生成儿童绘本风格的插画',
    });

export const generateAiChildrenPictureResponseSchema = z
    .object({
        success: z.boolean().meta({ description: '是否成功' }),
        imageUrl: z.string().meta({ description: '生成的图片 URL' }),
        originalUrl: z.string().meta({ description: '原始智谱 API 返回的 URL' }),
        storagePath: z.string().optional().meta({ description: '本地存储路径' }),
        model: z.string().meta({ description: '使用的模型名称' }),
        generationTime: z.number().meta({ description: '生成耗时（毫秒）' }),
        warning: z.string().optional().meta({ description: '警告信息' }),
        error: z.string().optional().meta({ description: '错误信息' }),
        metadata: z
            .object({
                prompt: z.string(),
                width: z.number(),
                height: z.number(),
                quality: z.string(),
            })
            .meta({ description: '元数据' }),
    })
    .meta({ $id: 'GenerateAiChildrenPictureResponse', description: '生成 AI 儿童绘本图片响应' });
