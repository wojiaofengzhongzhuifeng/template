import { useEffect } from 'react';

import type { CountList } from '@/server/count/type';

import { useHomeStore } from '@/app/(pages)/(home-page)/store/home';
import { http } from '@/config/request';
import { useRequest } from '@/hooks/use-request';

export async function getPublicCountNumber(): Promise<CountList> {
    try {
        const response = await http.get<CountList>('/counts/public');

        return response.data;
    } catch {
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
