import { Prisma } from '@/database/generated/client';

import type { FindDescendantsArgs, FindDescendantsResult } from '../types';

import { default_order_by } from '../consts';

export default async function findDescendants<T, A extends FindDescendantsArgs<T>>(
    this: T,
    { node, where, orderBy = default_order_by, ...args }: FindDescendantsArgs<T> & A,
): Promise<FindDescendantsResult<T, A>> {
    const ctx = Prisma.getExtensionContext(this) as any;

    let path: string | undefined;
    let depth: number | undefined;
    let numchild: number | undefined;
    let id: unknown;

    if (node) {
        path = node.path;
        depth = node.depth;
        numchild = node.numchild;
        id = node.id;
    } else if (where) {
        const target = await ctx.findUniqueOrThrow({ where });
        if (target) {
            path = target.path;
            depth = target.depth;
            numchild = target.numchild;
            id = target.id;
        }
    }

    if (numchild === 0) {
        return null;
    }

    return ctx.findMany({
        where: {
            id: {
                not: id,
            },
            path: {
                startsWith: path,
            },
            depth: {
                gte: depth,
            },
        },
        orderBy,
        ...args,
    });
}
