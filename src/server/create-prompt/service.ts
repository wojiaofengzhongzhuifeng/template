'use server';

export async function createPrompt(data: {
    child_age: string | null;
    illustration_style: string | null;
    themes: string[];
    story_overview: string;
    central_idea: string;
}) {
    console.log('创建绘本请求:', data);

    return {
        success: true,
        data,
        message: '绘本创建成功',
    };
}
