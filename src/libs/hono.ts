import type { Hono } from 'hono';

import { hc } from 'hono/client';

import { appConfig } from '@/config/app';
import { getBaseUrl } from '@/libs/app';

/**
 /**
 * 在服务端组件中创建hono api客户端
 */
export const buildClient = <T extends Hono<any, any, any>>(route?: string) =>
    hc<T>(`${getBaseUrl()}${appConfig.apiPath}${route}`, {});

/**
 * 在服务端组件中请求hono api
 * 自动解包统一响应格式 { code, message, data }
 * @param client
 * @param run
 */
export const fetchApi = async <
    T extends Hono<any, any, any>,
    F extends (c: C) => Promise<any>,
    C = ReturnType<typeof hc<T>>,
>(
    client: C,
    run: F,
): Promise<Awaited<ReturnType<F>>> => {
    const result = await run(client);

    if (!result.ok) {
        const error = await result.json();
        if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
            const errorObj = new Error(error.message) as any;
            errorObj.code = error.code;
            errorObj.isBusinessError = error.code >= 1000;
            errorObj.isHttpError = error.code > 0 && error.code < 1000;
            throw errorObj;
        }
        throw new Error(error.message || error.error || '请求失败');
    }

    const data = await result.json();

    if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
        if (data.code !== 0) {
            const errorObj = new Error(data.message) as any;
            errorObj.code = data.code;
            errorObj.isBusinessError = data.code >= 1000;
            throw errorObj;
        }
        return data.data;
    }

    return result;
};
