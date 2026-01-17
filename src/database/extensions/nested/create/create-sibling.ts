import { Prisma } from '@/database/generated/client';

import type { CreateSiblingArgs, CreateSiblingResult } from '../types';

import { increment_path, path_from_depth } from '../utils';

export default async function createSibling<T, A extends CreateSiblingArgs<T>>(
    this: T,
    { node, where, data, ...args }: CreateSiblingArgs<T> & A,
): Promise<CreateSiblingResult<T, A>> {
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

    const last_sibling = await ctx
        .findSiblings({
            node: { path, depth },
            select: {
                path: true,
                depth: true,
            },
            orderBy: {
                path: 'desc',
            },
            take: 1,
        })
        .then(([s]: any[]) => s);

    const parent_path = path_from_depth({ path: path!, depth: depth! - 1 });

    const new_path = increment_path(last_sibling.path);

    const [newborn] = await ctx.__$transaction([
        ctx.create({
            data: {
                ...(data ?? {}),
                path: new_path,
                depth: last_sibling.depth,
                numchild: 0,
            },
            ...args,
        }),
        ctx.update({
            where: {
                path: parent_path,
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
