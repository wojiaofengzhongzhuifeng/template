import { Prisma } from '@/database/generated/client';

import type { FindTreeArgs, FindTreeResult } from '../types';

import { default_order_by } from '../consts';

export default async function findTree<T, A extends FindTreeArgs<T>>(
    this: T,
    { parent: parentArg, orderBy = default_order_by, ...args }: FindTreeArgs<T> & A,
): Promise<FindTreeResult<T, A>> {
    const ctx = Prisma.getExtensionContext(this) as any;

    let parent = parentArg?.node;

    if (parentArg?.node) {
        parent = parentArg.node;
    } else if (parentArg?.where) {
        const target = await ctx
            .findUniqueOrThrow({
                where: parentArg.where,
                select: { path: true, numchild: true, depth: true, id: true },
            })
            .catch((err: any) => {
                err.message = `Argument \`parent.where\`: ${err.message}`;
                throw err;
            });

        if (target) {
            parent = target;
        }
    }

    if (!parent) {
        return ctx.findMany({
            orderBy,
            ...args,
        });
    }

    if (parent.numchild === 0) {
        return ctx.findMany({
            where: { id: parent.id },
            orderBy,
            ...args,
        });
    }

    return ctx.findMany({
        where: {
            path: {
                startsWith: parent.path,
            },
            depth: {
                gte: parent.depth,
            },
        },
        orderBy,
        ...args,
    });
}
