import { Prisma } from '@/database/generated/client';

import type { FindAncestorsArgs, FindAncestorsResult } from '../types';

import { default_order_by } from '../consts';

export default async function findAncestors<T, A extends FindAncestorsArgs<T>>(
    this: T,
    { node, where, orderBy = default_order_by, ...args }: FindAncestorsArgs<T> & A,
): Promise<FindAncestorsResult<T, A>> {
    const ctx = Prisma.getExtensionContext(this) as any;

    let path: string | undefined;
    let depth: number | undefined;

    if (node) {
        path = node.path;
        depth = node.depth;
    } else if (where) {
        const target = await ctx.findUniqueOrThrow({ where });
        if (target) {
            path = target.path;
            depth = target.depth;
        }
    }

    if (depth === 1) {
        return null;
    }

    const path_segments = path?.match(/.{1,4}/g) || [];

    const ancestors_paths = path_segments.slice(0, -1).reduce<string[]>((pV, cV) => {
        const nextValue = `${pV.at(-1) || ''}${cV}`;
        return pV.concat(nextValue);
    }, []);

    return ctx.findMany({
        where: {
            path: {
                in: ancestors_paths,
            },
        },
        orderBy,
        ...args,
    });
}
