import z from 'zod';

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
