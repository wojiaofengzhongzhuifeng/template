import z from 'zod';

export const createPromptRequestExample = {
    child_age: 'preschool',
    illustration_style: 'cartoon',
    themes: ['emotional_education', 'social_behavior'],
    story_overview: '一只小兔子在森林里寻找胡萝卜，帮助朋友的故事',
    central_idea: '通过小兔子的冒险旅程，展现友谊互助和勇敢面对困难的美好品质',
};

export const storySceneSchema = z
    .object({
        text: z.string().meta({ description: '绘本文字内容' }),
        img_text_prompt: z.string().meta({ description: 'AI 图像生成提示词' }),
    })
    .meta({ $id: 'StoryScene', description: '故事场景' });

export const createPromptResponseExample = {
    success: true,
    scenes: [
        {
            text: '小猫在花园里找到了一篮子美味的食物。',
            img_text_prompt:
                "A small chubby white rabbit, fluffy soft fur, big sparkling round eyes with pink pupils, long floppy ears with pink inner, wearing a light blue knitted vest with a small heart button, sitting alone under a large oak tree with twisted branches, paws hugging knees, looking at distant animals playing with a shy and longing expression, in a sunny meadow filled with colorful wildflowers and butterflies, soft golden afternoon light filtering through leaves, warm and slightly melancholic atmosphere, medium shot, centered composition, cute cartoon animation style, clean outlines, bright flat colors, expressive characters, smooth gradients, Disney-Pixar inspired, children's picture book illustration, masterpiece, best quality, highly detailed, 8k",
        },
        {
            text: '小猫看着篮子里的食物，想起了它的好朋友小狗。',
            img_text_prompt:
                "A small chubby white rabbit, fluffy soft fur, big sparkling round eyes with pink pupils, long floppy ears with pink inner, wearing a light blue knitted vest with a small heart button, holding a woven basket filled with fresh vegetables, looking at a small friendly brown puppy in the distance, in a sunny garden with blooming flowers, soft warm afternoon light, cute cartoon animation style, children's picture book illustration, masterpiece, best quality, highly detailed",
        },
    ],
    sceneCount: 8,
    generationTime: 52447,
    metadata: {
        child_age: 'infant',
        child_age_label: '0-2岁婴幼儿',
        illustration_style: 'crayon',
        illustration_style_label: '蜡笔画风格',
        themes: ['emotional_education'],
        themes_label: '情感教育',
        story_overview: '小猫分享食物',
        central_idea: '学会分享',
        model: 'glm-4-flash',
        usage: {
            prompt_tokens: 902,
            completion_tokens: 991,
            total_tokens: 1893,
        },
    },
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
        scenes: z.array(storySceneSchema),
        sceneCount: z.number(),
        generationTime: z.number(),
        metadata: z
            .object({
                child_age: z.string().nullable(),
                child_age_label: z.string().nullable(),
                illustration_style: z.string().nullable(),
                illustration_style_label: z.string().nullable(),
                themes: z.array(z.string()),
                themes_label: z.string(),
                story_overview: z.string(),
                central_idea: z.string().nullable(),
                model: z.string(),
                usage: z
                    .object({
                        prompt_tokens: z.number(),
                        completion_tokens: z.number(),
                        total_tokens: z.number(),
                    })
                    .optional(),
            })
            .meta({ description: '元数据' }),
    })
    .meta({
        $id: 'CreatePromptResponse',
        description: '创建绘本响应',
    });
