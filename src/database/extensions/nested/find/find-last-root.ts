import { Prisma } from '@/database/generated/client';

import type { FindLastRootNodeArgs, FindLastRootNodeResult } from '../types';

export default async function findLastRoot<T, A extends FindLastRootNodeArgs<T>>(
    this: T,
    args?: FindLastRootNodeArgs<T> & A,
): Promise<FindLastRootNodeResult<T, A>> {
    const ctx = Prisma.getExtensionContext(this) as any;

    return ctx.findFirst({
        ...(args ?? {}),
        where: {
            depth: 1,
        },
        orderBy: {
            path: 'desc',
        },
    });
}
