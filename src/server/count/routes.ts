import { describeRoute, validator as zValidator } from 'hono-openapi';
import { isNil } from 'lodash';

import type { auth } from '@/libs/auth';

import { createHonoApp } from '../common/app';
import { ErrorCode } from '../common/constants';
import {
    createBusinessError,
    createErrorResult,
    defaultValidatorErrorHandler,
} from '../common/error';
import {
    createNotFoundErrorResponse,
    createServerErrorResponse,
    createSuccessResponse,
    createUnauthorizedErrorResponse,
    createValidatorErrorResponse,
} from '../common/response';
import { AuthProtectedMiddleware } from '../user/middlwares';
import {
    countCreateSchema,
    countIdParamsSchema,
    countListSchema,
    countSchema,
    countUpdateSchema,
} from './schema';
import {
    createCount,
    deleteCount,
    queryCountItem,
    queryCountList,
    queryPublicCountList,
    updateCount,
} from './service';

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
interface Env {
    Variables: {
        user: NonNullable<AuthSession>['user'];
        session: NonNullable<AuthSession>['session'];
    };
}

const app = createHonoApp<Env>();

export const countTags = ['计数操作'];

export const countRoutes = app
    // 公开的 count 列表
    .get(
        '/public',
        describeRoute({
            tags: countTags,
            summary: '公开 Count 列表查询',
            description: '查询所有公开的 Count（无需登录）',
            responses: {
                ...createSuccessResponse(countListSchema),
                ...createServerErrorResponse('查询公开 Count 列表失败'),
            },
        }),
        async (c) => {
            try {
                const result = await queryPublicCountList();
                return c.json(result, 200);
            } catch (error) {
                return c.json(createErrorResult('查询公开 Count 列表失败', error), 500);
            }
        },
    )
    // 获取用户的 count 列表
    .get(
        '/',
        describeRoute({
            tags: countTags,
            summary: 'Count 列表查询',
            description: '查询当前用户的所有 Count',
            responses: {
                ...createSuccessResponse(countListSchema),
                ...createUnauthorizedErrorResponse(),
                ...createServerErrorResponse('查询 Count 列表失败'),
            },
        }),
        AuthProtectedMiddleware,
        async (c) => {
            try {
                const user = c.get('user');
                const result = await queryCountList(user.id);
                return c.json(result, 200);
            } catch (error) {
                return c.json(createErrorResult('查询 Count 列表失败', error), 500);
            }
        },
    )
    // 获取单个 count
    .get(
        '/:id',
        describeRoute({
            tags: countTags,
            summary: 'Count 详情查询',
            description: '查询单个 Count 的详细信息',
            responses: {
                ...createSuccessResponse(countSchema),
                ...createValidatorErrorResponse(),
                ...createUnauthorizedErrorResponse(),
                ...createNotFoundErrorResponse('Count 不存在'),
                ...createServerErrorResponse('查询 Count 失败'),
            },
        }),
        zValidator('param', countIdParamsSchema, defaultValidatorErrorHandler),
        AuthProtectedMiddleware,
        async (c) => {
            try {
                const { id } = c.req.valid('param');
                const user = c.get('user');
                const result = await queryCountItem(id, user.id);
                if (!isNil(result)) return c.json(result, 200);
                return c.json(createBusinessError(ErrorCode.COUNT_NOT_FOUND, 'Count 不存在'), 200);
            } catch (error) {
                return c.json(createErrorResult('查询 Count 失败', error), 500);
            }
        },
    )
    // 创建 count
    .post(
        '/',
        describeRoute({
            tags: countTags,
            summary: '创建 Count',
            description: '创建一个新的 Count',
            responses: {
                ...createSuccessResponse(countSchema),
                ...createValidatorErrorResponse(),
                ...createUnauthorizedErrorResponse(),
                ...createServerErrorResponse('创建 Count 失败'),
            },
        }),
        zValidator('json', countCreateSchema, defaultValidatorErrorHandler),
        AuthProtectedMiddleware,
        async (c) => {
            try {
                const { number, isPublic } = c.req.valid('json');
                const user = c.get('user');
                const result = await createCount(user.id, number, isPublic);
                return c.json(result, 201);
            } catch (error) {
                return c.json(createErrorResult('创建 Count 失败', error), 500);
            }
        },
    )
    // 更新 count
    .patch(
        '/:id',
        describeRoute({
            tags: countTags,
            summary: '更新 Count',
            description: '更新 Count 的数值',
            responses: {
                ...createSuccessResponse(countSchema),
                ...createValidatorErrorResponse(),
                ...createUnauthorizedErrorResponse(),
                ...createNotFoundErrorResponse('Count 不存在'),
                ...createServerErrorResponse('更新 Count 失败'),
            },
        }),
        zValidator('param', countIdParamsSchema, defaultValidatorErrorHandler),
        zValidator('json', countUpdateSchema, defaultValidatorErrorHandler),
        AuthProtectedMiddleware,
        async (c) => {
            try {
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');
                const user = c.get('user');
                const updateResult = await updateCount(id, user.id, data);
                if (updateResult.count === 0) {
                    return c.json(
                        createBusinessError(ErrorCode.COUNT_NOT_FOUND, 'Count 不存在'),
                        200,
                    );
                }
                const result = await queryCountItem(id, user.id);
                return c.json(result, 200);
            } catch (error) {
                return c.json(createErrorResult('更新 Count 失败', error), 500);
            }
        },
    )
    // 删除 count
    .delete(
        '/:id',
        describeRoute({
            tags: countTags,
            summary: '删除 Count',
            description: '删除一个 Count',
            responses: {
                200: {
                    description: '删除成功',
                },
                ...createUnauthorizedErrorResponse(),
                ...createNotFoundErrorResponse('Count 不存在'),
                ...createServerErrorResponse('删除 Count 失败'),
            },
        }),
        zValidator('param', countIdParamsSchema, defaultValidatorErrorHandler),
        AuthProtectedMiddleware,
        async (c) => {
            try {
                const { id } = c.req.valid('param');
                const user = c.get('user');
                const deleteResult = await deleteCount(id, user.id);
                if (deleteResult.count === 0) {
                    return c.json(
                        createBusinessError(ErrorCode.COUNT_NOT_FOUND, 'Count 不存在'),
                        200,
                    );
                }
                return c.json({ message: '删除成功' }, 200);
            } catch (error) {
                return c.json(createErrorResult('删除 Count 失败', error), 500);
            }
        },
    );
