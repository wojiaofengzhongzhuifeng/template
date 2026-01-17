/* eslint-disable vars-on-top */

import { PrismaPg } from '@prisma/adapter-pg';
import { isNil } from 'lodash';
import paginateExt from 'prisma-paginate';

import { nestedExt } from '@/database/extensions/nested';
import { PrismaClient } from '@/database/generated/client';

const prismaClientSingleton = () => {
    const connectionString = `${process.env.DATABASE_URL}`;
    const adapter = new PrismaPg({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
    const client = new PrismaClient({ adapter, log: ['error'] })
        .$extends(paginateExt)
        .$extends(nestedExt({ modelNames: ['category'] }));
    return client;
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = !isNil(globalThis.prismaGlobal) ? globalThis.prismaGlobal : prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db;
