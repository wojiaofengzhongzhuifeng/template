import { http } from '@/config/request';

export interface GenerateCentralIdeaRequest {
    centralIdea?: string;
    storyOverview: string;
    childAge?: string;
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

export async function generateCentralIdea(
    data: GenerateCentralIdeaRequest,
): Promise<GenerateCentralIdeaResponse> {
    const { data: response } = await http.post<GenerateCentralIdeaResponse>(
        '/ai/generate-central-idea',
        data,
    );
    return response;
}
