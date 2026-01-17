import { Prisma } from '@/database/generated/client';

import type { FindChildrenArgs, FindChildrenResult } from '../types';

import { default_order_by, max_segment, min_segment } from '../consts';

export default async function findChildren<T, A extends FindChildrenArgs<T>>(
    this: T,
    { node, where, orderBy = default_order_by, ...args }: FindChildrenArgs<T> & A,
): Promise<FindChildrenResult<T, A>> {
    const ctx = Prisma.getExtensionContext(this) as any;

    let path: string | undefined;
    let depth: number | undefined;
    let numchild: number | undefined;

    if (node) {
        path = node.path;
        depth = node.depth;
        numchild = node.numchild;
    } else if (where) {
        const target = await ctx.findUniqueOrThrow({ where });
        if (target) {
            path = target.path;
            depth = target.depth;
            numchild = target.numchild;
        }
    }

    if (numchild === 0) {
        return null;
    }

    const gt_path = (path as any) + (min_segment as any);
    const lte_path = (path as any) + (max_segment as any);

    return ctx.findMany({
        where: {
            depth: (depth as any) + 1,
            path: {
                gt: gt_path,
                lte: lte_path,
            },
        },
        orderBy,
        ...args,
    });
}
