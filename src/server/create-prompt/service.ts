'use server';

const AGE_LABELS: Record<string, string> = {
    infant: '0-2岁婴幼儿',
    preschool: '3-6岁学龄前儿童',
    early_elementary: '6-8岁小学低年级',
};

const STYLE_LABELS: Record<string, string> = {
    watercolor: '水彩画',
    crayon: '蜡笔画',
    cartoon: '卡通',
    clay_3d: '粘土3D',
    paper_cut: '剪纸',
};

const THEME_LABELS: Record<string, string> = {
    emotional_education: '情感教育',
    cognitive_learning: '认知学习',
    social_behavior: '社会行为',
    natural_science: '自然科学',
    fantasy_adventure: '奇幻冒险',
};

export async function createPrompt(data: {
    child_age: string | null;
    illustration_style: string | null;
    themes: string[];
    story_overview: string;
    central_idea: string;
}) {
    console.log('创建绘本请求:', data);

    const ageLabel = data.child_age ? AGE_LABELS[data.child_age] : null;
    const styleLabel = data.illustration_style ? STYLE_LABELS[data.illustration_style] : null;
    const themeLabels = data.themes.map((t) => THEME_LABELS[t] || t);

    return {
        ...data,
        _meta: {
            age_label: ageLabel,
            style_label: styleLabel,
            theme_labels: themeLabels,
        },
        message: '绘本创建成功',
    };
}
