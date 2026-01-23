// 在所有其他模块导入之前清除 Zod 全局 registry，解决 HMR 重复 ID 问题
import './common/zod-registry';

import { swaggerUI } from '@hono/swagger-ui';
import { Scalar } from '@scalar/hono-api-reference';
import { openAPIRouteHandler } from 'hono-openapi';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';

import { categoryPath } from './category/constants';
import { categoryRoutes } from './category/routes';
import { beforeServer, createHonoApp } from './common/app';
import { countPath } from './count/constants';
import { countRoutes } from './count/routes';
import { postPath } from './post/constants';
import { postRoutes } from './post/routes';
import { tagPath } from './tag/constants';
import { tagRoutes } from './tag/routes';
import { authPath } from './user/constants';
import { authRoutes } from './user/routes/auth';
const serverRPC = beforeServer().then(() => {
    const app = createHonoApp().basePath('/api');
    app.use(prettyJSON());
    app.get('/', (c) => c.text('3R Blog API'));
    app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));
    const routes = app
        .use(
            '*',
            cors({
                origin: '*',
                allowHeaders: ['Content-Type', 'Authorization'],
                exposeHeaders: ['Content-Length'],
                maxAge: 600,
                credentials: true,
            }),
        )
        .route(tagPath, tagRoutes)
        .route(categoryPath, categoryRoutes)
        .route(postPath, postRoutes)
        .route(countPath, countRoutes)
        .route(authPath, authRoutes);
    app.get(
        '/data',
        openAPIRouteHandler(app, {
            documentation: {
                info: {
                    version: 'v1',
                    title: '3RCD API',
                    description: '3R TS全栈课程的后端API',
                },
            },
        }),
    );

    app.get('/swagger', swaggerUI({ url: '/api/data' }));

    app.get(
        '/docs',
        Scalar({
            theme: 'saturn',
            url: '/api/data',
        }),
    );
    return { app, routes };
});
type RPCType = Awaited<typeof serverRPC>['routes'];
export { type RPCType, serverRPC };
