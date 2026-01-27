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
import { createPromptRequestSchema, createPromptResponseSchema } from './schema';
import { createPrompt } from './service';

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

interface Env {
    Variables: {
        user: NonNullable<AuthSession>['user'];
        session: NonNullable<AuthSession>['session'];
    };
}

const app = createHonoApp<Env>();

export const createPromptTags = ['AI 儿童绘本'];

export const createPromptRoutes = app.post(
    '/',
    describeRoute({
        tags: createPromptTags,
        summary: '创建绘本',
        description: '根据表单数据创建绘本',
        responses: {
            ...createSuccessResponse(createPromptResponseSchema),
            ...createUnauthorizedErrorResponse(),
            ...createValidatorErrorResponse(),
            ...createServerErrorResponse('创建失败'),
        },
    }),
    zValidator('json', createPromptRequestSchema),
    AuthProtectedMiddleware,
    async (c) => {
        try {
            const data = c.req.valid('json');
            const result = await createPrompt(data);
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
