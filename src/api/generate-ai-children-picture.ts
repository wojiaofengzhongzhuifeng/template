import type {
    GenerateAiChildrenPicture,
    GenerateAiChildrenPictureApiType,
} from '@/server/generate-ai-children-picture/type';

import { buildClient, fetchApi } from '@/libs/hono';
import { generateAiChildrenPicturePath } from '@/server/generate-ai-children-picture/constants';

export const generateAiChildrenPictureClient = buildClient<GenerateAiChildrenPictureApiType>(
    generateAiChildrenPicturePath,
);

export const generateAiChildrenPictureApi = {
    generate: async (data: GenerateAiChildrenPicture) =>
        fetchApi(generateAiChildrenPictureClient, async (c) => c.index.$post({ json: data })),
};
