import type { z } from 'zod';

import type { beautifyStoryRoutes } from './routes';
import type { beautifyStoryRequestSchema, beautifyStoryResponseSchema } from './schema';

export type BeautifyStoryRequest = z.infer<typeof beautifyStoryRequestSchema>;
export type BeautifyStoryResponse = z.infer<typeof beautifyStoryResponseSchema>;
export type BeautifyStoryApiType = typeof beautifyStoryRoutes;
