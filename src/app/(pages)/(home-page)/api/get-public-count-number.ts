import { useEffect } from 'react';

import type { CountList } from '@/server/count/type';

import { useHomeStore } from '@/app/(pages)/(home-page)/store/home';
import { http } from '@/config/request';
import { useRequest } from '@/hooks/use-request';

/**
 * 获取公开计数器列表
 * 通过 RESTful API 请求获取公开的计数器数据
 *
 * @returns 公开的计数器列表
 */
export async function getPublicCountNumber(): Promise<CountList> {
    try {
        const response = await http.get<{ data: CountList }>('/counts/public');

        console.log('response', response);

        // 后端直接返回数组，不是包装在 { data: ... } 中
        return response.data as unknown as CountList;
    } catch {
        // 错误已在拦截器中处理
        return [];
    }
}

export function useGetPublicCountNumberList() {
    const { setCountList } = useHomeStore();

    const { run, loading } = useRequest(getPublicCountNumber, {
        manual: true,
        onSuccess: (data) => {
            setCountList(data);
        },
        onError: () => {
            setCountList(undefined);
        },
    });

    useEffect(() => {
        run();
    }, [run]);

    return { loading };
}
