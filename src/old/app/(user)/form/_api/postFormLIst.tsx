import type { ApiConfig } from './common';

import { prefixUrl, request } from './common';

export interface PostFormList {
    child_age: string;
    illustration_style: string;
    themes: string[];
    story_overview: string;
    central_idea: string;
}

export const postFormListApiConfig: ApiConfig = {
    // 对应后端：POST /api/form/list
    url: `${prefixUrl}/create-prompt`,
    method: 'POST',
    manual: false,
    showError: true,
};

export const postFormList = async (data: PostFormList) => {
    try {
        const response = await request(
            postFormListApiConfig.url,
            postFormListApiConfig.method,
            data,
        );
        return {
            success: true,
            message: '请求成功',
            data: response,
        };
    } catch (error: any) {
        console.error('API 请求错误:', error);
        // 抛出错误让 useRequest 处理
        throw new Error(error.message || '请求失败');
    }
};
