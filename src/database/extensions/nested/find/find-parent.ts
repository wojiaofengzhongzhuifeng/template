import { Prisma } from '@/database/generated/client';

import type { FindParentArgs, FindParentResult } from '../types';

import { path_from_depth } from '../utils';

export default async function findParent<T, A extends FindParentArgs<T>>(
    this: T,
    { node, where, ...args }: FindParentArgs<T> & A,
): Promise<FindParentResult<T, A>> {
    const ctx = Prisma.getExtensionContext(this) as any;

    let path: string | undefined;
    let depth: number | undefined;

    if (node) {
        path = node.path;
        depth = node.depth;
    } else if (where) {
        const target = await ctx.findUniqueOrThrow({
            where,
            select: {
                path: true,
                depth: true,
            },
        });
        path = target.path;
        depth = target.depth;
    }
    if (depth && path) {
        if (depth <= 1) {
            return null;
        }

        const parent_path = path_from_depth({ path, depth: depth - 1 });
        return ctx.findUnique({
            where: {
                path: parent_path,
            },
            ...args,
        });
    }

    return null;
}
