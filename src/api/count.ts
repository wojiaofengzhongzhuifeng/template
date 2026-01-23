import type { CountApiType, CountCreate, CountUpdate } from '@/server/count/type';

import { buildClient, fetchApi } from '@/libs/hono';
import { countPath } from '@/server/count/constants';

export const countClient = buildClient<CountApiType>(countPath);

export const countApi = {
    list: async () => fetchApi(countClient, async (c) => c.index.$get()),
    detail: async (id: string) =>
        fetchApi(countClient, async (c) => c[':id'].$get({ param: { id } })),
    create: async (data: CountCreate) =>
        fetchApi(countClient, async (c) => c.index.$post({ json: data })),
    update: async (id: string, data: CountUpdate) =>
        fetchApi(countClient, async (c) => c[':id'].$patch({ param: { id }, json: data })),
    delete: async (id: string) =>
        fetchApi(countClient, async (c) => c[':id'].$delete({ param: { id } })),
};
