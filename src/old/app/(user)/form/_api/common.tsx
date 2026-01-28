import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

import axios from 'axios';

export const prefixUrl = '/api';

export interface ApiConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    manual: boolean;
    showError: boolean;
}

/**
 * 统一获取前端请求需要携带的鉴权头：
 * - 登录/注册成功后后端会返回 { user, token, token_type: "bearer", expires_in }
 * - 前端在 login/register 成功时把 data.token 存到 localStorage.authToken
 * - 这里在有 token 时自动拼出 Authorization: Bearer <token>
 *
 * 后端只需要在受保护接口中依赖 token 里的 user_id（例如 GET /api/me），
 * 就可以校验当前用户身份并做"只操作自己的数据"的逻辑。
 */
export const getAuthHeaders = ():
    | {
          Authorization: string;
      }
    | undefined => {
    if (typeof window === 'undefined') return undefined;
    const token = window.localStorage.getItem('authToken');
    if (!token) return undefined;
    return {
        Authorization: `Bearer ${token}`,
    };
};

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
    baseURL: typeof window !== 'undefined' ? window.location.origin : '',
    timeout: 60000, // 60秒超时
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器：自动添加鉴权头
axiosInstance.interceptors.request.use(
    (config) => {
        // 自动添加鉴权头
        const authHeaders = getAuthHeaders();
        if (authHeaders) {
            config.headers.Authorization = authHeaders.Authorization;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// 响应拦截器：统一错误处理
axiosInstance.interceptors.response.use(
    (response) => {
        // 直接返回响应数据
        return response;
    },
    (error: AxiosError) => {
        // 统一错误处理
        if (error.response) {
            // 服务器返回了错误响应
            const status = error.response.status;
            const errorData = error.response.data as any;

            // 根据状态码返回友好错误信息
            switch (status) {
                case 401:
                    throw new Error('未授权，请重新登录');
                case 403:
                    throw new Error('没有权限访问该资源');
                case 404:
                    throw new Error('请求的资源不存在');
                case 429:
                    throw new Error('请求过于频繁，请稍后重试');
                case 500:
                    throw new Error('服务器内部错误');
                default:
                    throw new Error(
                        errorData?.error || errorData?.message || `请求失败 (${status})`,
                    );
            }
        } else if (error.request) {
            // 请求已发出但没有收到响应
            throw new Error('网络错误，请检查网络连接');
        } else {
            // 其他错误
            throw new Error(error.message || '请求失败');
        }
    },
);

/**
 * 统一的请求方法
 * @param url 请求地址
 * @param method 请求方法
 * @param data 请求数据（GET 请求时作为 params）
 * @param config 额外的 axios 配置
 * @returns Promise<any>
 */
export const request = async (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any,
    config?: AxiosRequestConfig,
) => {
    try {
        let response;

        switch (method) {
            case 'GET':
                // GET 请求使用 params
                response = await axiosInstance.get(url, {
                    params: data,
                    ...config,
                });
                break;
            case 'POST':
                response = await axiosInstance.post(url, data, config);
                break;
            case 'PUT':
                response = await axiosInstance.put(url, data, config);
                break;
            case 'DELETE':
                response = await axiosInstance.delete(url, {
                    params: data,
                    ...config,
                });
                break;
            default:
                throw new Error(`不支持的请求方法: ${method}`);
        }

        return response.data;
    } catch (error: any) {
        // 错误已经在拦截器中处理，这里直接抛出
        throw error;
    }
};

// 导出 axios 实例，以便需要时直接使用
export { axiosInstance };
