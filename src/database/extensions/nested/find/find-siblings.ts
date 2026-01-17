import { Prisma } from '@/database/generated/client';

import type { FindSiblingsArgs, FindSiblingsResult } from '../types';

import { default_order_by, max_segment, min_segment } from '../consts';
import { path_from_depth } from '../utils';

export default async function findSiblings<T, A extends FindSiblingsArgs<T>>(
    this: T,
    { node, where, orderBy = default_order_by, ...args }: FindSiblingsArgs<T> & A,
): Promise<FindSiblingsResult<T, A>> {
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
        return ctx.findMany({
            where: { depth },
            orderBy,
            ...args,
        });
    }

    if ((depth ?? 0) > 1) {
        const parent_path = path_from_depth({ path: path!, depth: depth! - 1 });
        const gt_path = (parent_path as any) + (min_segment as any);
        const lte_path = (parent_path as any) + (max_segment as any);

        return ctx.findMany({
            where: {
                depth,
                path: {
                    gt: gt_path,
                    lte: lte_path,
                },
            },
            orderBy,
            ...args,
        });
    }

    return undefined;
}
