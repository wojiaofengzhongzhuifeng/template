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
        centralIdea: z.string().optional().meta({
            description:
                '已有的中心思想，如果提供则对其进行美化和优化；如果不提供则根据故事概述自动生成。可选字段，字数建议10-50字',
        }),
        storyOverview: z.string().min(1, '故事概述不能为空').meta({
            description:
                '故事概述，描述故事的主要情节、角色设定和故事走向。用于生成或美化中心思想，字数建议50-200字',
        }),
        childAge: z.enum(['infant', 'preschool', 'early_elementary']).optional().meta({
            description:
                '儿童年龄段，用于调整中心思想的表达方式和深度。可选值：infant（0-2岁婴幼儿）、preschool（3-6岁学龄前儿童）、early_elementary（6-8岁小学低年级）',
        }),
        themes: z.array(z.string()).optional().meta({
            description:
                '故事主题，用于引导中心思想的方向和侧重点。可选值：emotional_education（情感教育）、cognitive_learning（认知学习）、social_behavior（社交行为）、natural_science（自然科学）、fantasy_adventure（奇幻冒险）',
        }),
    })
    .meta({
        $id: 'GenerateCentralIdeaRequest',
        description:
            '生成/美化中心思想请求，根据故事概述生成主题鲜明的中心思想，或对已有中心思想进行优化美化',
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
