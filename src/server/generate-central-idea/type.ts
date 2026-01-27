export interface GenerateCentralIdeaRequest {
    centralIdea?: string;
    storyOverview: string;
    childAge?: 'infant' | 'preschool' | 'early_elementary';
    themes?: string[];
}

export interface GenerateCentralIdeaResponse {
    success: boolean;
    centralIdea: string;
    isGenerated: boolean;
    generationTime: number;
    metadata: {
        model: string;
        usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
    };
}
