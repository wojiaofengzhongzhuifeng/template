import z from 'zod';

export const beautifyStoryRequestExample = {
    storyOverview: '一只小兔子在森林里寻找胡萝卜的故事',
    childAge: 'preschool',
    themes: ['friendship', 'adventure'],
};

export const beautifyStoryResponseExample = {
    success: true,
    beautifiedStory:
        '在一个阳光明媚的早晨，可爱的小兔子跳跳决定去森林里寻找最甜美的胡萝卜。他背上小书包，兴高采烈地踏上了冒险之旅。一路上，跳跳遇到了许多新朋友，有小松鼠松松、小鹿朵朵，还有机灵的小狐狸。大家听说跳跳在找胡萝卜，纷纷伸出援手，帮助他寻找。最终，在朋友们的帮助下，跳跳不仅找到了美味的胡萝卜，还收获了珍贵的友谊。',
    generationTime: 2100,
    metadata: {
        model: 'gpt-4',
        usage: {
            prompt_tokens: 120,
            completion_tokens: 180,
            total_tokens: 300,
        },
    },
};

export const beautifyStoryRequestSchema = z
    .object({
        storyOverview: z.string().min(1, '故事概述不能为空'),
        childAge: z.enum(['infant', 'preschool', 'early_elementary']).optional(),
        themes: z.array(z.string()).optional(),
    })
    .meta({ $id: 'BeautifyStoryRequest', description: '美化故事概述请求' });

export const beautifyStoryResponseSchema = z
    .object({
        success: z.boolean(),
        beautifiedStory: z.string(),
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
    .meta({ $id: 'BeautifyStoryResponse', description: '美化故事概述响应' });
