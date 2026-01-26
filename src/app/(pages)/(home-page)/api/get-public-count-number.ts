import { useEffect } from 'react';

import type { CountList } from '@/server/count/type';

import { useHomeStore } from '@/app/(pages)/(home-page)/store/home';
import { useToast } from '@/components/toast';
import { http } from '@/config/request';
import { useRequest } from '@/hooks/use-request';

export async function getPublicCountNumber(): Promise<CountList> {
    const response = await http.get<CountList>('/counts/public');
    return response.data;
}

export function useGetPublicCountNumberList() {
    const { setCountList } = useHomeStore();
    const toast = useToast();

    const { data, error, loading, run } = useRequest(getPublicCountNumber, {
        manual: true,
        onSuccess: (data) => {
            setCountList(data);
        },
        onError: () => {
            toast.error('请求失败，请刷新重试');
            setCountList(undefined);
        },
    });

    useEffect(() => {
        run();
    }, [run]);

    return { data, error, loading, run };
}
