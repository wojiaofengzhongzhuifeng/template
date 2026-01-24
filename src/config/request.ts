import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

import { appConfig } from './app';

/**
 * 统一 API 响应数据结构
 */
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

/**
 * Axios 请求配置扩展
 */
interface AxiosRequestConfigExt extends InternalAxiosRequestConfig {
    _skipAuth?: boolean;
    _retry?: boolean;
}

/**
 * 创建 axios 实例
 */
const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: `${appConfig.baseUrl}${appConfig.apiPath}`,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    });

    instance.interceptors.request.use(
        (config: AxiosRequestConfigExt) => {
            if (!config._skipAuth) {
                // better-auth 使用 session cookie，会自动携带
            }

            if (config.method === 'get') {
                config.params = {
                    ...config.params,
                    _t: Date.now(),
                };
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        },
    );

    instance.interceptors.response.use(
        (response) => {
            const { data } = response;
            const { code, message, data: responseData } = data;

            if (code >= 1000) {
                const errorObj = new Error(message) as any;
                errorObj.code = code;
                errorObj.isBusinessError = true;
                errorObj.response = response;
                return Promise.reject(errorObj);
            }

            if (code !== 0) {
                const errorObj = new Error(message) as any;
                errorObj.code = code;
                errorObj.isHttpError = true;
                errorObj.response = response;
                return Promise.reject(errorObj);
            }

            response.data = responseData;
            return response;
        },
        async (error: AxiosError<ApiResponse>) => {
            const { response } = error;

            if (response) {
                const { status, data } = response;

                if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
                    const errorObj = new Error(data.message || '请求失败') as any;
                    errorObj.code = data.code;
                    errorObj.isHttpError = true;
                    errorObj.response = response;
                    return Promise.reject(errorObj);
                }

                switch (status) {
                    case 401:
                        console.error('未授权，请重新登录');
                        break;
                    case 403:
                        console.error('没有权限访问');
                        break;
                    case 404:
                        console.error('请求的资源不存在');
                        break;
                    case 500:
                        console.error(
                            '服务器错误:',
                            (data as any)?.message || (data as any)?.error,
                        );
                        break;
                    default:
                        console.error(
                            `请求失败 (${status}):`,
                            (data as any)?.message || (data as any)?.error,
                        );
                }

                const errorObj = new Error(
                    (data as any)?.message || (data as any)?.error || '请求失败',
                ) as any;
                errorObj.status = status;
                errorObj.code = status;
                errorObj.isHttpError = true;
                errorObj.data = (data as any)?.data;
                errorObj.response = response;
                return Promise.reject(errorObj);
            }

            if (error.code === 'ECONNABORTED') {
                console.error('请求超时');
                const errorObj = new Error('请求超时，请稍后重试') as any;
                errorObj.isNetworkError = true;
                return Promise.reject(errorObj);
            }

            if (!window.navigator.onLine) {
                console.error('网络连接失败');
                const errorObj = new Error('网络连接失败，请检查网络') as any;
                errorObj.isNetworkError = true;
                return Promise.reject(errorObj);
            }

            console.error('请求失败:', error.message);
            const errorObj = new Error('请求失败，请稍后重试') as any;
            errorObj.isNetworkError = true;
            return Promise.reject(errorObj);
        },
    );

    return instance;
};

export const http = createAxiosInstance();

export { axios };
