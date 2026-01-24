import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

import { appConfig } from './app';

/**
 * API 响应数据结构
 */
export interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
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
        // 允许携带 cookie（better-auth 使用 session cookie）
        withCredentials: true,
    });

    // 请求拦截器
    instance.interceptors.request.use(
        (config: AxiosRequestConfigExt) => {
            // 如果不需要跳过认证
            if (!config._skipAuth) {
                // better-auth 使用 session cookie，会自动携带
                // 如果后续需要使用 token，可以在这里添加
                // const token = getToken();
                // if (token) {
                //     config.headers.Authorization = `Bearer ${token}`;
                // }
            }

            // 添加请求时间戳（防止缓存）
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

    // 响应拦截器
    instance.interceptors.response.use(
        (response) => {
            // 成功响应
            return response;
        },
        async (error: AxiosError<ApiResponse>) => {
            const { response } = error;
            // 预留 config 用于后续实现 token 刷新重试逻辑
            // error.config;

            // 处理不同的错误状态码
            if (response) {
                const { status, data } = response;

                switch (status) {
                    case 401:
                        // 未授权 - 可能需要重新登录
                        // better-auth 会处理重定向到登录页
                        console.error('未授权，请重新登录');
                        // 可以在这里触发登出逻辑或跳转到登录页
                        // await signOut();
                        // window.location.href = '/auth/login';
                        break;

                    case 403:
                        // 禁止访问
                        console.error('没有权限访问');
                        break;

                    case 404:
                        // 资源不存在
                        console.error('请求的资源不存在');
                        break;

                    case 500:
                        // 服务器错误
                        console.error('服务器错误:', data?.message || data?.error);
                        break;

                    default:
                        console.error(`请求失败 (${status}):`, data?.message || data?.error);
                }

                const errorObj = new Error(data?.message || data?.error || '请求失败') as any;
                errorObj.status = status;
                errorObj.data = data?.data;
                return Promise.reject(errorObj);
            }

            // 网络错误或请求超时
            if (error.code === 'ECONNABORTED') {
                console.error('请求超时');
                return Promise.reject(new Error('请求超时，请稍后重试'));
            }

            if (!window.navigator.onLine) {
                console.error('网络连接失败');
                return Promise.reject(new Error('网络连接失败，请检查网络'));
            }

            console.error('请求失败:', error.message);
            return Promise.reject(new Error('请求失败，请稍后重试'));
        },
    );

    return instance;
};

/**
 * 导出 axios 实例
 */
export const http = createAxiosInstance();

/**
 * 导出 axios 原始实例（用于特殊场景）
 */
export { axios };
