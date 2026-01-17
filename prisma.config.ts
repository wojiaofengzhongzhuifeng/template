import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    schema: 'src/database/schema',
    migrations: {
        path: 'src/database/migrations',
        seed: 'bun src/database/seed/index.ts',
    },
    datasource: {
        url: env('DATABASE_URL'),
    },
});
