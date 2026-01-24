import type { Context, Next } from 'hono';

import { HTTPException } from 'hono/http-exception';
import { isObject } from 'lodash';

import { ErrorCode } from './constants';
import { createBusinessError } from './error';

/**
 * 统一响应格式化中间件
 * 自动将成功响应包装成 { code: 0, message: 'success', data: ... } 格式
 * 业务错误保持原样返回 200 + 错误码
 */
export const unifiedResponseMiddleware = async (c: Context, next: Next) => {
    await next();

    const contentType = c.res.headers.get('Content-Type');
    if (!contentType?.includes('application/json')) return;

    const clonedRes = c.res.clone();
    let originalResponse;
    try {
        originalResponse = await clonedRes.json();
    } catch {
        return;
    }

    if (isObject(originalResponse) && 'code' in originalResponse && 'data' in originalResponse) {
        return;
    }

    const status = c.res.status;

    if (status >= 400) {
        c.res = new Response(
            JSON.stringify({
                code: status,
                message: originalResponse?.message || '请求失败',
                data: null,
            }),
            { status, headers: c.res.headers },
        );
        return;
    }

    c.res = new Response(
        JSON.stringify({
            code: ErrorCode.SUCCESS,
            message: 'success',
            data: originalResponse,
        }),
        { status, headers: c.res.headers },
    );
};

/**
 * 全局错误处理中间件
 * 捕获所有未处理的异常并返回统一格式
 */
export const globalErrorHandler = (error: Error | HTTPException, c: Context) => {
    console.error('[API Error]', error);

    if (error instanceof HTTPException) {
        return error.getResponse();
    }

    const message = error instanceof Error ? error.message : '服务器内部错误';
    const code =
        error instanceof Error && 'code' in error ? (error as any).code : ErrorCode.SERVER_ERROR;

    return c.json(createBusinessError(code as ErrorCode, message), 500);
};
