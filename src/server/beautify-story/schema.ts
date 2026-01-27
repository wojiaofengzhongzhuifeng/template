import z from 'zod';

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
