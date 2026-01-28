import type { z } from 'zod';

import type { generateAiChildrenPictureRoutes } from './routes';
import type {
    generateAiChildrenPictureResponseSchema,
    generateAiChildrenPictureSchema,
} from './schema';

export type GenerateAiChildrenPicture = z.infer<typeof generateAiChildrenPictureSchema>;

export type GenerateAiChildrenPictureResponse = z.infer<
    typeof generateAiChildrenPictureResponseSchema
>;

export type GenerateAiChildrenPictureApiType = typeof generateAiChildrenPictureRoutes;
