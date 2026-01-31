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
    generateCentralIdeaRequestSchema,
    generateCentralIdeaResponseExample,
    generateCentralIdeaResponseSchema,
} from './schema';
import { generateCentralIdea } from './service';

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

interface Env {
    Variables: {
        user: NonNullable<AuthSession>['user'];
        session: NonNullable<AuthSession>['session'];
    };
}

const app = createHonoApp<Env>();

export const generateCentralIdeaTags = ['AI 儿童绘本'];

export const generateCentralIdeaRoutes = app.post(
    '/',
    describeRoute({
        tags: generateCentralIdeaTags,
        summary: '生成/美化中心思想',
        description: '根据故事概述生成中心思想，或美化已有的中心思想',
        responses: {
            ...createSuccessResponse(
                generateCentralIdeaResponseSchema,
                undefined,
                generateCentralIdeaResponseExample,
            ),
            ...createUnauthorizedErrorResponse(),
            ...createValidatorErrorResponse(),
            ...createServerErrorResponse('生成失败'),
        },
    }),
    zValidator('json', generateCentralIdeaRequestSchema),
    AuthProtectedMiddleware,
    async (c) => {
        try {
            const data = c.req.valid('json');
            const result = await generateCentralIdea(data);
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
