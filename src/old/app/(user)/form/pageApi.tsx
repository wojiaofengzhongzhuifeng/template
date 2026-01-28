// 表单数据类型定义
export interface FormData {
    child_age: 'infant' | 'preschool' | 'early_elementary' | null;
    illustration_style: 'watercolor' | 'crayon' | 'cartoon' | 'clay_3d' | 'paper_cut' | null;
    themes: (
        | 'emotional_education'
        | 'cognitive_learning'
        | 'social_behavior'
        | 'natural_science'
        | 'fantasy_adventure'
    )[];
    story_overview: string;
    central_idea: string;
}

// 映射关系
export const ageMap: Record<string, FormData['child_age']> = {
    '0-3': 'infant',
    '3-6': 'preschool',
    '6-12': 'early_elementary',
};

export const styleMap: Record<string, FormData['illustration_style']> = {
    '水彩/墨水画': 'watercolor',
    '蜡笔/涂鸦': 'crayon',
    '卡通/扁平化': 'cartoon',
    '3D粘土动画': 'clay_3d',
    剪纸拼贴: 'paper_cut',
};

export const themeMap: Record<string, string> = {
    情感教育: 'emotional_education',
    认知学习: 'cognitive_learning',
    社会行为: 'social_behavior',
    自然科学: 'natural_science',
    奇幻冒险: 'fantasy_adventure',
    冒险探索: 'fantasy_adventure',
};

// 组件 Props 接口定义
export interface CreateButtonProps {
    onSubmit: () => FormData;
}

export interface ChildhoodAgeProps {
    selectedAge: string | null;
    onAgeChange: (age: string | null) => void;
}

export interface MainIdeaProps {
    value: string;
    onChange: (value: string) => void;
    storyOverview?: string;
    childAge?: string | null;
    themes?: string[];
}

export interface PictureStyleProps {
    selectedStyle: string | null;
    onStyleChange: (style: string | null) => void;
}

export interface PictureBookThemeProps {
    selectedThemes: string[];
    onThemesChange: (themes: string[]) => void;
}

export interface StoryOverviewProps {
    value: string;
    onChange: (value: string) => void;
    childAge?: string | null;
    themes?: string[];
}
