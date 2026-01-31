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
        prompt: z.string().min(1).meta({ description: '图片描述' }),
        model: z
            .enum(['glm-image', 'cogview-4-250304', 'cogview-4', 'cogview-3-flash'])
            .default('cogview-3-flash')
            .meta({ description: 'AI 模型名称' }),
        size: z.string().default('1280x1280').meta({ description: '图片尺寸，格式：宽x高' }),
        quality: z
            .enum(['hd', 'standard'])
            .default('hd')
            .meta({ description: '图片质量（hd=高清，standard=标准）' }),
        sceneIndex: z.number().int().optional().meta({ description: '场景索引（用于 Mock 模式）' }),
    })
    .meta({ $id: 'GenerateAiChildrenPicture', description: '生成 AI 儿童绘本图片请求' });

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
