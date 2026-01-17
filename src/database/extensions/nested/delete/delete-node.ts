import { Prisma } from '@/database/generated/client';

import type { DeleteNodeArgs, DeleteNodeResult } from '../types';

import { path_from_depth } from '../utils';

export default async function deleteNode<T, A extends DeleteNodeArgs<T>>(
    this: T,
    { node, where, ..._args }: DeleteNodeArgs<T> & A,
): Promise<DeleteNodeResult<T, A>> {
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
        if (target) {
            path = target.path;
            depth = target.depth;
        }
    }

    if ((depth ?? 0) > 1) {
        const parent_path = path_from_depth({ path: path!, depth: depth! - 1 });
        await ctx.update({
            where: {
                path: parent_path,
            },
            data: {
                numchild: {
                    decrement: 1,
                },
            },
        });
    }

    return ctx.deleteMany({
        where: {
            path: {
                startsWith: path,
            },
        },
    });
}
