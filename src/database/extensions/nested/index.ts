import { Prisma } from '@/database/generated/client';

import type { GetWithCurrentArgs, GetWithCurrentResult } from './types';

import * as create from './create';
import * as deletes from './delete';
import * as find from './find';
import * as operations from './operations';

const extensionMethods = {
    ...find,
    ...create,
    ...deletes,
    ...operations,

    async getAncestorsWithCurrent<T extends object, A extends GetWithCurrentArgs<T>>(
        this: T,
        args: A,
    ): Promise<GetWithCurrentResult<T, A>> {
        const ctx = Prisma.getExtensionContext(this);
        const { where, ...restArgs } = args;
        const current = await (ctx as any).findFirst({ where }); // Standard method
        if (!current) return [] as any;
        // Call findAncestors directly
        const ancestors = await find.findAncestors.call(this, {
            where: { id: current.id },
            ...restArgs,
        });
        return [...(ancestors || []), current] as any;
    },

    async getDescendantsWithCurrent<T extends object, A extends GetWithCurrentArgs<T>>(
        this: T,
        args: A,
    ): Promise<GetWithCurrentResult<T, A>> {
        const ctx = Prisma.getExtensionContext(this);
        const { where, ...restArgs } = args;
        const current = await (ctx as any).findFirst({ where });
        if (!current) return [] as any;
        // Call findDescendants directly
        const descendants = await find.findDescendants.call(this, {
            where: { id: current.id },
            ...restArgs,
        });
        return [current, ...(descendants || [])] as any;
    },

    async __$transaction<T>(this: T, ...transactionArgs: any[]) {
        const ctx = Prisma.getExtensionContext(this) as any;
        return (ctx.$parent as any).$transaction(...transactionArgs);
    },
} as const;

export interface NestedInitArgs<
    TModelNames extends readonly Prisma.TypeMap['meta']['modelProps'][],
> {
    modelNames: TModelNames;
}

export function nestedExt<
    const TModelNames extends readonly Prisma.TypeMap['meta']['modelProps'][],
>(args: NestedInitArgs<TModelNames>) {
    type ModelExtension = { [K in TModelNames[number]]: typeof extensionMethods };
    const model = args.modelNames.reduce<ModelExtension>((acc, modelName) => {
        (acc as any)[modelName] = extensionMethods;
        return acc;
    }, {} as ModelExtension);

    return Prisma.defineExtension({
        name: 'nested',
        // @ts-expect-error type mismatch with dynamic models
        model,
    });
}
