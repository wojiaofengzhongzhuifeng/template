import type { ZodType } from 'zod';

import { resolver } from 'hono-openapi';

import { errorSchema, unifiedResponseSchema } from './schema';

/**
 * 创建OpenAPI响应信息
 * @param description
 * @param schema
 */
export const createResponse = <T extends ZodType, S extends number>(
    schema: T,
    status: S,
    description: string,
) => {
    return {
        [status]: {
            description,
            content: { 'application/json': { schema: resolver(schema) } },
        },
    };
};

/**
 * 创建统一格式的OpenAPI成功响应信息
 * @param description
 * @param schema
 */
export const createUnifiedSuccessResponse = <T extends ZodType>(
    schema: T,
    description?: string,
) => {
    return createResponse(unifiedResponseSchema(schema), 200, description ?? '请求成功');
};

/**
 * 创建OpenAPI成功响应信息（统一格式）
 * @param description
 * @param schema
 */
export const createSuccessResponse = <T extends ZodType>(schema: T, description?: string) => {
    return createUnifiedSuccessResponse(schema, description);
};

/**
 * 创建OpenAPI 201 成功响应信息（统一格式）
 * @param description
 * @param schema
 */
export const create201SuccessResponse = <T extends ZodType>(schema: T, description?: string) => {
    return createResponse(unifiedResponseSchema(schema), 201, description ?? '创建成功');
};

/**
 * 创建OpenAPI异常响应信息
 * @param description
 */
export const createErrorResponse = <S extends number>(description: string, status: S) => {
    return {
        [status]: {
            description,
            content: { 'application/json': { schema: resolver(errorSchema) } },
        },
    };
};

/**
 * 创建请求数据验证失败的响应信息
 * @param description
 */
export const createValidatorErrorResponse = (description?: string) => {
    return createErrorResponse(description ?? '请求数据验证失败', 400);
};

/**
 * 创建服务器请求错误信息
 * @param description
 */
export const createBadRequestErrorResponse = (description?: string, status?: number) => {
    return createErrorResponse(description ?? '请求错误', status ?? 400);
};

/**
 * 创建服务器错误响应信息
 * @param description
 */
export const createServerErrorResponse = (description?: string) => {
    return createErrorResponse(description ?? '服务器错误', 500);
};

/**
 * 创建数据不存在响应信息
 * @param description
 */
export const createNotFoundErrorResponse = (description?: string) => {
    return createErrorResponse(description ?? '数据不存在', 404);
};

/**
 * 创建用户未认证响应信息
 * @param description
 */
export const createUnauthorizedErrorResponse = (description?: string) => {
    return createErrorResponse(description ?? '用户未认证', 401);
};
