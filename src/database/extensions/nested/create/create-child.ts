import { Prisma } from '@/database/generated/client';

import type { CreateChildArgs, CreateChildResult } from '../types';

import { int2str } from '../utils';

export default async function createChild<T, A extends CreateChildArgs<T>>(
    this: T,
    { node, where, data, ...args }: CreateChildArgs<T> & A,
): Promise<CreateChildResult<T, A>> {
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

    if (numchild !== 0) {
        const child = await ctx
            .findChildren({
                node: { path, depth, numchild },
                select: {
                    path: true,
                    depth: true,
                },
                take: 1,
                orderBy: {
                    path: 'desc',
                },
            })
            .then(([c]: any[]) => c);

        return ctx.createSibling({
            node: child,
            data,
            ...args,
        });
    }

    const new_step = int2str(1);
    const new_path = (path as any) + new_step;

    const [newborn] = await ctx.__$transaction([
        ctx.create({
            data: {
                ...(data ?? {}),
                path: new_path,
                depth: (depth as any) + 1,
                numchild: 0,
            },
            ...args,
        }),
        ctx.update({
            where: {
                path,
            },
            data: {
                numchild: {
                    increment: 1,
                },
            },
        }),
    ]);

    return newborn;
}
