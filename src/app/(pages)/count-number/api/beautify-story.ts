import type { BeautifyStoryRequest, BeautifyStoryResponse } from '@/server/beautify-story/type';

import { http } from '@/config/request';
import { useRequest } from '@/hooks/use-request';

export async function beautifyStory(data: BeautifyStoryRequest): Promise<BeautifyStoryResponse> {
    const response = await http.post<BeautifyStoryResponse>('/ai/beautify-story', data);
    return response.data;
}

export function useBeautifyStory() {
    const { data, error, loading, run } = useRequest(beautifyStory, {
        manual: true,
    });

    return {
        data,
        error,
        loading,
        run,
    };
}
