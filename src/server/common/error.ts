import type { Context, Env } from 'hono';

import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { isNil, isObject } from 'lodash';

import { ErrorCode } from './constants';

/**
 * 创建Hono应用
 */
export const createHonoApp = <E extends Env>() => {
    const app = new Hono<E>();
    app.use(prettyJSON());
    return app;
};

/**
 * 异常响应生成（统一格式）
 * @param title
 * @param error
 * @param code
 */
export const createErrorResult = (
    title: string,
    error?: any,
    code: ErrorCode = ErrorCode.SERVER_ERROR,
) => {
    let message = title;
    if (!isNil(error)) {
        message =
            error instanceof Error || (isObject(error) && 'message' in error)
                ? `${title}:${error.message}`
                : `${title}:${error.toString()}`;
    }

    return {
        code,
        message,
        data: null,
    };
};

/**
 * 创建业务错误响应
 * @param code 业务错误码
 * @param message 错误消息
 */
export const createBusinessError = (code: ErrorCode, message: string) => ({
    code,
    message,
    data: null,
});

/**
 * 请求数据验证失败的默认响应
 * @param result
 * @param c
 */
export const defaultValidatorErrorHandler = (result: any, c: Context) => {
    if (!result.success) {
        return c.json(
            {
                ...createBusinessError(ErrorCode.VALIDATION_ERROR, '请求数据验证失败'),
                errors: 'format' in result.error ? result.error.format() : result.error,
            },
            400,
        );
    }
    return result;
};
