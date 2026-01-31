import { describeRoute, validator as zValidator } from 'hono-openapi';

import type { auth } from '@/libs/auth';

import { createHonoApp } from '../common/app';
import {
    createServerErrorResponse,
    createSuccessResponse,
    createUnauthorizedErrorResponse,
    createValidatorErrorResponse,
} from '../common/response';
import { AuthProtectedMiddleware } from '../user/middlwares';
import {
    beautifyStoryRequestSchema,
    beautifyStoryResponseExample,
    beautifyStoryResponseSchema,
} from './schema';
import { beautifyStory } from './service';

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

interface Env {
    Variables: {
        user: NonNullable<AuthSession>['user'];
        session: NonNullable<AuthSession>['session'];
    };
}

const app = createHonoApp<Env>();

export const beautifyStoryTags = ['AI 儿童绘本'];

export const beautifyStoryRoutes = app.post(
    '/',
    describeRoute({
        tags: beautifyStoryTags,
        summary: '美化故事概述',
        description: '优化故事概述，使其更加生动有趣',
        responses: {
            ...createSuccessResponse(
                beautifyStoryResponseSchema,
                undefined,
                beautifyStoryResponseExample,
            ),
            ...createUnauthorizedErrorResponse(),
            ...createValidatorErrorResponse(),
            ...createServerErrorResponse('美化失败'),
        },
    }),
    zValidator('json', beautifyStoryRequestSchema),
    AuthProtectedMiddleware,
    async (c) => {
        try {
            const data = c.req.valid('json');
            const result = await beautifyStory(data);
            return c.json(result, 200);
        } catch (error) {
            return c.json(
                {
                    error: error instanceof Error ? error.message : '未知错误',
                    data: null,
                },
                500,
            );
        }
    },
);
