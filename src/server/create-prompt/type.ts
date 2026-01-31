export interface StoryScene {
    text: string;
    img_text_prompt: string;
}

export interface CreatePromptRequest {
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

export interface CreatePromptResponse {
    success: boolean;
    scenes: StoryScene[];
    sceneCount: number;
    generationTime: number;
    metadata: {
        child_age: string | null;
        child_age_label: string | null;
        illustration_style: string | null;
        illustration_style_label: string | null;
        themes: string[];
        themes_label: string;
        story_overview: string;
        central_idea: string | null;
        model: string;
        usage?: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
}
