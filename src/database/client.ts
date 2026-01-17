import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/database/generated/client';

import { nestedExt } from './extensions/nested';
import { truncateExt } from './extensions/truncate';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter })
    .$extends(
        truncateExt('postgres', {
            // resetSequence: false,
        }),
    )
    .$extends(nestedExt({ modelNames: ['category'] }));

export { prisma };
