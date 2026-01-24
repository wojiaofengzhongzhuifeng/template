import { useEffect } from 'react';

import type { CountItem } from '@/server/count/type';

import { useCountStore } from '@/app/(pages)/count-number/store/count';
import { http } from '@/config/request';
import { useRequest } from '@/hooks/use-request';

export async function getCountList(): Promise<CountItem[]> {
    const { data } = await http.get<CountItem[]>('/counts');
    return data;
}

export function useGetCountList() {
    const { setCounts } = useCountStore();
    const { run, loading } = useRequest(getCountList, {
        manual: true,
        onSuccess: (data) => {
            setCounts(data);
        },
        onError: () => {
            setCounts(undefined);
        },
    });

    useEffect(() => {
        run();
    }, [run]);

    return { loading, refresh: run };
}

export async function createCount(data: { number: number; isPublic: boolean }): Promise<CountItem> {
    const response = await http.post<CountItem>('/counts', data);
    return response.data;
}

export async function updateCount(
    id: string,
    data: { number?: number; isPublic?: boolean },
): Promise<CountItem> {
    const response = await http.patch<CountItem>(`/counts/${id}`, data);
    return response.data;
}

export async function deleteCount(id: string): Promise<void> {
    await http.delete(`/counts/${id}`);
}
