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
        storyOverview: z.string().min(1, '故事概述不能为空').meta({
            description:
                '故事概述，需要美化的原始故事文本。可以是简单的故事大纲、片段或完整的草稿内容',
        }),
        childAge: z.enum(['infant', 'preschool', 'early_elementary']).optional().meta({
            description:
                '儿童年龄段，用于调整美化后故事的语言难度和表现方式。可选值：infant（0-2岁婴幼儿）、preschool（3-6岁学龄前儿童）、early_elementary（6-8岁小学低年级）',
        }),
        themes: z.array(z.string()).optional().meta({
            description:
                '故事主题，用于引导美化方向。可选值：emotional_education（情感教育）、cognitive_learning（认知学习）、social_behavior（社交行为）、natural_science（自然科学）、fantasy_adventure（奇幻冒险）',
        }),
    })
    .meta({
        $id: 'BeautifyStoryRequest',
        description: '美化故事概述请求，将简单的故事概述优化为生动有趣、适合儿童阅读的绘本故事文本',
    });

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
