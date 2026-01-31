import z from 'zod';

export const generateCentralIdeaRequestExample = {
    centralIdea: '',
    storyOverview: '一只小兔子在森林里寻找胡萝卜的故事',
    childAge: 'preschool',
    themes: ['friendship', 'adventure'],
};

export const generateCentralIdeaResponseExample = {
    success: true,
    centralIdea:
        '友谊与勇气的力量：通过小兔子在森林中寻找胡萝卜的冒险旅程，展现友谊互助和勇敢面对困难的美好品质。',
    isGenerated: true,
    generationTime: 1250,
    metadata: {
        model: 'gpt-4',
        usage: {
            prompt_tokens: 150,
            completion_tokens: 50,
            total_tokens: 200,
        },
    },
};

export const generateCentralIdeaRequestSchema = z
    .object({
        centralIdea: z.string().optional(),
        storyOverview: z.string().min(1, '故事概述不能为空'),
        childAge: z.enum(['infant', 'preschool', 'early_elementary']).optional(),
        themes: z.array(z.string()).optional(),
    })
    .meta({
        $id: 'GenerateCentralIdeaRequest',
        description: '生成/美化中心思想请求',
    });

export const generateCentralIdeaResponseSchema = z
    .object({
        success: z.boolean(),
        centralIdea: z.string(),
        isGenerated: z.boolean(),
        generationTime: z.number(),
        metadata: z.object({
            model: z.string(),
            usage: z.object({
                prompt_tokens: z.number(),
                completion_tokens: z.number(),
                total_tokens: z.number(),
            }),
        }),
    })
    .meta({
        $id: 'GenerateCentralIdeaResponse',
        description: '生成/美化中心思想响应',
    });
