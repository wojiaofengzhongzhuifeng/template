import z from 'zod';

export const createPromptRequestSchema = z
    .object({
        child_age: z.enum(['infant', 'preschool', 'early_elementary']).nullable(),
        illustration_style: z
            .enum(['watercolor', 'crayon', 'cartoon', 'clay_3d', 'paper_cut'])
            .nullable(),
        themes: z.array(
            z.enum([
                'emotional_education',
                'cognitive_learning',
                'social_behavior',
                'natural_science',
                'fantasy_adventure',
            ]),
        ),
        story_overview: z.string().min(1, '故事概述不能为空'),
        central_idea: z.string().min(1, '中心思想不能为空'),
    })
    .meta({
        $id: 'CreatePromptRequest',
        description: '创建绘本请求',
    });

export const createPromptResponseSchema = z
    .object({
        success: z.boolean(),
        data: z.any(),
        message: z.string(),
    })
    .meta({
        $id: 'CreatePromptResponse',
        description: '创建绘本响应',
    });
