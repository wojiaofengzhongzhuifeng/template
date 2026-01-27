import type { BeautifyStoryApiType, BeautifyStoryRequest } from '@/server/beautify-story/type';

import { buildClient, fetchApi } from '@/libs/hono';
import { beautifyStoryPath } from '@/server/beautify-story/constants';

export const beautifyStoryClient = buildClient<BeautifyStoryApiType>(beautifyStoryPath);

export const beautifyStoryApi = {
    beautify: async (data: BeautifyStoryRequest) =>
        fetchApi(beautifyStoryClient, async (c) => c.index.$post({ json: data })),
};
