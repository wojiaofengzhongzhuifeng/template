import { http } from '@/config/request';

export interface BeautifyStoryRequest {
    storyOverview: string;
    childAge?: string;
    themes?: string[];
}

export interface BeautifyStoryResponse {
    success: boolean;
    beautifiedStory: string;
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

export async function beautifyStory(data: BeautifyStoryRequest): Promise<BeautifyStoryResponse> {
    const { data: response } = await http.post<BeautifyStoryResponse>('/ai/beautify-story', data);
    return response;
}
