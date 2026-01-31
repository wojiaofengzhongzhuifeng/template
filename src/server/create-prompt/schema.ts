import z from 'zod';

export const createPromptRequestExample = {
    child_age: 'preschool',
    illustration_style: 'cartoon',
    themes: ['emotional_education', 'social_behavior'],
    story_overview: '一只小兔子在森林里寻找胡萝卜，帮助朋友的故事',
    central_idea: '通过小兔子的冒险旅程，展现友谊互助和勇敢面对困难的美好品质',
};

export const createPromptResponseExample = {
    success: true,
    data: {
        id: 'prompt-001',
        prompts: [
            {
                sceneIndex: 1,
                description: '阳光明媚的早晨，小兔子跳跳从家里出来，准备去森林探险',
            },
            {
                sceneIndex: 2,
                description: '跳跳在森林里遇到了小松鼠松松，他们成为了好朋友',
            },
        ],
    },
    message: '创建成功',
};

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
