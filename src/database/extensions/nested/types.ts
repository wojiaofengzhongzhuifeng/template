import type { Prisma } from '@/database/generated/client';

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

export interface BarkNode {
    id: unknown;
    path: string;
    depth: number;
    numchild: number;
}

type NodePathDepth = Pick<BarkNode, 'path' | 'depth'>;
type NodePathDepthNumchild = Pick<BarkNode, 'path' | 'depth' | 'numchild'>;
type NodeAll = BarkNode;

export type FindLastRootNodeArgs<T> = Omit<Prisma.Args<T, 'findFirst'>, 'where'> | void;
export type FindLastRootNodeResult<T, A> = Prisma.Result<T, A, 'findFirst'>;

export type FindAncestorsArgs<T> = XOR<
    { node: NodePathDepth },
    Pick<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>
> &
    Omit<Prisma.Args<T, 'findMany'>, 'where'>;
export type FindAncestorsResult<T, A> = Prisma.Result<T, A, 'findMany'> | null;

export type FindDescendantsArgs<T> = XOR<
    { node: NodeAll },
    Pick<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>
> &
    Omit<Prisma.Args<T, 'findMany'>, 'where'>;
export type FindDescendantsResult<T, A> = Prisma.Result<T, A, 'findMany'> | null;

type FindTreeParentArgs<T> = XOR<
    { node: NodeAll },
    Pick<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>
>;
export type FindTreeArgs<T> = Omit<Prisma.Args<T, 'findMany'>, 'where'> & {
    parent?: FindTreeParentArgs<T>;
};
export type FindTreeResult<T, A> = Prisma.Result<T, A, 'findMany'>;

export type FindChildrenArgs<T> = XOR<
    { node: NodePathDepthNumchild },
    Pick<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>
> &
    Omit<Prisma.Args<T, 'findMany'>, 'where'>;
export type FindChildrenResult<T, A> = Prisma.Result<T, A, 'findMany'> | null;

export type FindSiblingsArgs<T> = XOR<
    { node: NodePathDepth },
    Pick<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>
> &
    Omit<Prisma.Args<T, 'findMany'>, 'where'>;
export type FindSiblingsResult<T, A> = Prisma.Result<T, A, 'findMany'> | undefined;

export type FindParentArgs<T> = XOR<
    { node: NodePathDepth },
    Pick<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>
> &
    Omit<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>;
export type FindParentResult<T, A> = Prisma.Result<T, A, 'findUnique'> | null | undefined;

export type CreateSiblingArgs<T> = XOR<
    { node: NodePathDepth },
    Pick<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>
> & {
    data?: Omit<Prisma.Args<T, 'create'>['data'], 'path' | 'depth' | 'numchild'>;
} & Omit<Prisma.Args<T, 'create'>, 'data'>;
export type CreateSiblingResult<T, A> = Prisma.Result<T, A, 'create'>;

export type CreateChildArgs<T> = XOR<
    { node: NodePathDepthNumchild },
    Pick<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>
> & {
    data?: Omit<Prisma.Args<T, 'create'>['data'], 'path' | 'depth' | 'numchild'>;
} & Omit<Prisma.Args<T, 'create'>, 'data'>;
export type CreateChildResult<T, A> = Prisma.Result<T, A, 'create'>;

export type CreateRootArgs<T> = {
    data?: Omit<Prisma.Args<T, 'create'>['data'], 'path' | 'depth' | 'numchild'>;
} & Omit<Prisma.Args<T, 'create'>, 'data'>;
export type CreateRootResult<T, A> = Prisma.Result<T, A, 'create'>;

export type DeleteNodeArgs<T> = XOR<
    { node: NodePathDepth },
    Pick<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>
> &
    Omit<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>;
export type DeleteNodeResult<T, A> = Prisma.Result<T, A, 'deleteMany'>;

export type DeleteManyNodesArgs<T> = Prisma.Args<T, 'deleteMany'>;
export type DeleteManyNodesResult<T, A> = Prisma.Result<T, A, 'deleteMany'> | null;

type MoveNodeOrWhereArgs<T> = XOR<
    { node: NodeAll },
    Pick<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>
>;
type MovePositions =
    | 'first-child'
    | 'last-child'
    | 'first-sibling'
    | 'left'
    | 'right'
    | 'last-sibling';
export type MoveArgs<T> = MoveNodeOrWhereArgs<T> & {
    reference: MoveNodeOrWhereArgs<T>;
    position: MovePositions;
};
export type MoveResult = undefined;

export type GetWithCurrentArgs<T> = XOR<
    { where: Prisma.Args<T, 'findFirst'>['where'] },
    Pick<Prisma.Args<T, 'findUniqueOrThrow'>, 'where'>
> &
    Omit<Prisma.Args<T, 'findMany'>, 'where'>;

export type GetWithCurrentResult<T, A> = Prisma.Result<T, A, 'findMany'>;
