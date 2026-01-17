import { Prisma } from '@/database/generated/client';

import type { MoveArgs, MoveResult } from '../types';

import { increment_path, int2str, last_position_in_path, path_from_depth } from '../utils';

export default async function move<T, A extends MoveArgs<T>>(
    this: T,
    { node, where, position, reference }: MoveArgs<T> & A,
): Promise<MoveResult> {
    const ctx = Prisma.getExtensionContext(this) as any;

    let original_node = node as any;
    let rn_node = (reference as any).node;

    if (node) {
        original_node = node;
    } else if (where) {
        const target = await ctx.findUniqueOrThrow({ where }).catch((err: any) => {
            err.message = `Argument \`where\`: ${err.message}`;
            throw err;
        });
        if (target) {
            original_node = target;
        }
    }

    if ((reference as any).node) {
        rn_node = (reference as any).node;
    } else if ((reference as any).where) {
        const rn_target = await ctx
            .findUniqueOrThrow({ where: (reference as any).where })
            .catch((err: any) => {
                err.message = `Argument \`reference.where\`: ${err.message}`;
                throw err;
            });
        if (rn_target) {
            rn_node = rn_target;
        }
    }

    if (original_node && rn_node) {
        const get_shared_rn_query_args = () => ({
            node: rn_node,
            select: {
                id: true,
                path: true,
                numchild: true,
                depth: true,
            },
            take: 1,
        });

        let new_path: string;
        let new_depth = rn_node.depth;
        let new_pos: number | null = null;
        let siblings: any[] | null = [];

        if (['first-child', 'last-child'].includes(position)) {
            new_depth++;

            if (rn_node.numchild === 0) {
                new_pos = 1;
                position = 'first-sibling';
                siblings = null;
            } else {
                const rn_last_child = await ctx
                    .findChildren({
                        ...get_shared_rn_query_args(),
                        orderBy: {
                            path: 'desc',
                        },
                    })
                    .then((s: any[]) => s?.[0]);
                rn_node = rn_last_child;

                switch (position) {
                    case 'first-child':
                        position = 'first-sibling';
                        break;
                    case 'last-child':
                        position = 'last-sibling';
                        break;
                }
            }
        }

        if (rn_node.path.startsWith(original_node.path) && rn_node.depth > original_node.depth) {
            throw new Error("Can't move `node` to its descendant");
        }

        const rn_last_sibling = await ctx
            .findSiblings({
                ...get_shared_rn_query_args(),
                orderBy: {
                    path: 'desc',
                },
            })
            .then((s: any[]) => s?.[0]);
        const rn_first_sibling = await ctx
            .findSiblings({
                ...get_shared_rn_query_args(),
                orderBy: {
                    path: 'asc',
                },
            })
            .then((s: any[]) => s?.[0]);

        if (original_node.path === rn_node.path) {
            if (
                position === 'left' ||
                ((position === 'right' || position === 'last-sibling') &&
                    rn_node.path === rn_last_sibling.path) ||
                (position === 'first-sibling' && rn_node.path === rn_first_sibling.path)
            ) {
                throw new Error('Nothing to move');
            }
        }

        if (
            position === 'last-sibling' ||
            (position === 'right' && rn_node.id === rn_last_sibling.id)
        ) {
            new_path = increment_path(rn_last_sibling.path);
            await update_node_and_descendants({
                old_path: original_node.path,
                new_path,
                new_depth,
            });
        } else {
            if (!new_pos) {
                siblings = (await ctx.findSiblings({
                    node: rn_node,
                    select: {
                        path: true,
                        numchild: true,
                        id: true,
                    },
                })) as any[];

                siblings = siblings.filter((s: any) => s.path !== original_node.path);

                const base_path_int = last_position_in_path({ path: rn_node.path });

                switch (position) {
                    case 'left':
                        new_pos = base_path_int;
                        siblings = siblings.filter((s: any) => s.path >= rn_node.path);
                        break;
                    case 'right':
                        new_pos = base_path_int + 1;
                        siblings = siblings.filter((s: any) => s.path > rn_node.path);
                        break;
                    case 'first-sibling':
                        new_pos = 1;
                        break;
                }
            }

            new_path =
                path_from_depth({ path: rn_node.path, depth: new_depth - 1 }) +
                int2str(new_pos as number);

            let temp_new_path: string | null = null;

            if (original_node.path.length === new_path.length) {
                const parent_old_path = path_from_depth({
                    path: original_node.path,
                    depth: original_node.depth - 1,
                });
                const parent_new_path = path_from_depth({ path: new_path, depth: new_depth - 1 });

                if (
                    parent_old_path === parent_new_path &&
                    (siblings?.length ?? 0) > 0 &&
                    new_path < original_node.path
                ) {
                    const base_path_int = last_position_in_path({ path: rn_last_sibling.path });
                    temp_new_path =
                        path_from_depth({ path: rn_node.path, depth: rn_node.depth - 1 }) +
                        int2str(base_path_int + 2);

                    await update_node_and_descendants({
                        old_path: original_node.path,
                        new_path: temp_new_path,
                        new_depth,
                    });
                }
            }

            const move_siblings: any[] = [];
            let prior_path = new_path;
            if ((siblings?.length ?? 0) > 0) {
                for (const node of siblings ?? []) {
                    if (node.path > prior_path) {
                        continue;
                    }
                    move_siblings.push(node);
                    prior_path = increment_path(node.path);
                }
            }
            move_siblings.reverse();

            for (const node of move_siblings) {
                const node_new_path = increment_path(node.path);
                await update_node_and_descendants({
                    old_path: node.path,
                    new_path: node_new_path,
                    new_depth: node.depth,
                });

                if (original_node.path.startsWith(node.path)) {
                    original_node.path =
                        node_new_path + original_node.path.slice(node_new_path.length);
                }
            }

            if (temp_new_path) {
                await update_node_and_descendants({
                    old_path: temp_new_path,
                    new_depth,
                    new_path,
                });
            } else {
                await update_node_and_descendants({
                    old_path: original_node.path,
                    new_depth,
                    new_path,
                });
            }
        }
        const original_parent_path = path_from_depth({
            path: original_node.path,
            depth: original_node.depth - 1,
        });
        const new_parent_path = path_from_depth({ path: new_path, depth: new_depth - 1 });

        if (
            (!original_parent_path && new_parent_path) ||
            (original_parent_path && !new_parent_path) ||
            original_parent_path !== new_parent_path
        ) {
            if (original_parent_path) {
                await ctx.update({
                    where: { path: original_parent_path },
                    data: { numchild: { decrement: 1 } },
                });
            }

            if (new_parent_path) {
                await ctx.update({
                    where: { path: new_parent_path },
                    data: { numchild: { increment: 1 } },
                });
            }
        }
    }

    async function update_node_and_descendants({
        old_path,
        new_path,
        new_depth,
    }: {
        old_path: string;
        new_path: string;
        new_depth: number;
    }) {
        const queue: any[] = [];

        queue.push(
            ctx.update({
                where: { path: old_path },
                data: {
                    path: new_path,
                    depth: new_depth,
                },
            }),
        );

        const moveable_node = await ctx.findFirstOrThrow({
            where: { path: old_path },
            select: {
                path: true,
                depth: true,
                numchild: true,
                id: true,
            },
        });

        if (moveable_node.numchild !== 0) {
            const descendants = await ctx.findDescendants({
                node: moveable_node,
                select: { id: true, path: true, depth: true },
            });

            for (const descendant of descendants) {
                const new_descendant_path = descendant.path.replace(old_path, new_path);

                const new_descendant_depth =
                    moveable_node.depth !== new_depth
                        ? descendant.depth + new_depth - moveable_node.depth
                        : null;

                queue.push(
                    ctx.update({
                        where: {
                            id: descendant.id,
                        },
                        data: {
                            path: new_descendant_path,
                            ...(new_descendant_depth ? { depth: new_descendant_depth } : {}),
                        },
                    }),
                );
            }
        }

        await ctx.__$transaction(queue);
    }
}
