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
    data: CreatePromptRequest;
    message: string;
}
