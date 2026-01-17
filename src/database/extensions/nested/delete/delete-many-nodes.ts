import { Prisma } from '@/database/generated/client';

import type { DeleteManyNodesArgs, DeleteManyNodesResult } from '../types';

import { STEP_LENGTH } from '../consts';
import { path_from_depth } from '../utils';

export default async function deleteManyNodes<T, A extends DeleteManyNodesArgs<T>>(
    this: T,
    args: DeleteManyNodesArgs<T> & A,
): Promise<DeleteManyNodesResult<T, A>> {
    const ctx = Prisma.getExtensionContext(this) as any;
    const { where } = args;

    const targets = await ctx.findMany({
        where,
        select: {
            path: true,
            depth: true,
        },
    });

    if (!targets?.length) {
        return null;
    }

    const ordered = targets
        .sort((a: any, b: any) => a.depth - b.depth)
        .sort((a: any, b: any) => a.path - b.path);

    const removable_nodes = new Map<string, any>();
    const updatable_parent_nodes = new Map<string, number>();

    for (const itm of ordered) {
        let found = false;
        for (let i = 0; i < itm.path.length / STEP_LENGTH; i++) {
            const patty = path_from_depth({ path: itm.path, depth: i + 1 });
            if (removable_nodes.has(patty)) {
                found = true;
                break;
            }
        }
        if (!found) {
            removable_nodes.set(itm.path, itm);

            if (itm.depth > 1) {
                const parent_path = path_from_depth({ path: itm.path, depth: itm.depth - 1 });
                updatable_parent_nodes.set(
                    parent_path,
                    (updatable_parent_nodes.get(parent_path) ?? 0) + 1,
                );
            }
        }
    }

    for (const [parent_path, decrement_amount] of updatable_parent_nodes) {
        await ctx.update({
            where: {
                path: parent_path,
            },
            data: {
                numchild: {
                    decrement: decrement_amount,
                },
            },
        });
    }

    const deleteCounts = await ctx.__$transaction(
        Array.from(removable_nodes.keys()).map((path) => {
            return ctx.deleteMany({
                where: {
                    path: {
                        startsWith: path,
                    },
                },
            });
        }),
    );

    return deleteCounts?.reduce?.((pV: any, cV: any) => ({ count: pV.count + cV.count }), {
        count: 0,
    });
}
