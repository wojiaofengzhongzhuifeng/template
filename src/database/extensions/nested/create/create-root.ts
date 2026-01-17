import { Prisma } from '@/database/generated/client';

import type { CreateRootArgs, CreateRootResult } from '../types';

import { increment_path, int2str } from '../utils';

export default async function createRoot<T, A extends CreateRootArgs<T>>(
    this: T,
    { data, ...args }: CreateRootArgs<T> & A,
): Promise<CreateRootResult<T, A>> {
    const ctx = Prisma.getExtensionContext(this) as any;

    const last_root = await ctx.findLastRoot({ select: { path: true } });

    let new_path: string | null = null;
    if (last_root) {
        new_path = increment_path(last_root.path);
    } else {
        new_path = int2str(1);
    }

    return ctx.create({
        data: {
            ...(data ?? {}),
            path: new_path,
            depth: 1,
            numchild: 0,
        },
        ...args,
    });
}
