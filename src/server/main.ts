// 在所有其他模块导入之前清除 Zod 全局 registry，解决 HMR 重复 ID 问题
import './common/zod-registry';

import { swaggerUI } from '@hono/swagger-ui';
import { Scalar } from '@scalar/hono-api-reference';
import { openAPIRouteHandler } from 'hono-openapi';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';

import { beautifyStoryPath } from './beautify-story/constants';
import { beautifyStoryRoutes } from './beautify-story/routes';
import { categoryPath } from './category/constants';
import { categoryRoutes } from './category/routes';
import { beforeServer, createHonoApp } from './common/app';
import { globalErrorHandler, unifiedResponseMiddleware } from './common/middleware';
import { countPath } from './count/constants';
import { countRoutes } from './count/routes';
import { createPromptPath } from './create-prompt/constants';
import { createPromptRoutes } from './create-prompt/routes';
import { generateAiChildrenPicturePath } from './generate-ai-children-picture/constants';
import { generateAiChildrenPictureRoutes } from './generate-ai-children-picture/routes';
import { generateCentralIdeaPath } from './generate-central-idea/constants';
import { generateCentralIdeaRoutes } from './generate-central-idea/routes';
import { postPath } from './post/constants';
import { postRoutes } from './post/routes';
import { tagPath } from './tag/constants';
import { tagRoutes } from './tag/routes';
import { authPath } from './user/constants';
import { authRoutes } from './user/routes/auth';

const serverRPC = beforeServer().then(() => {
    const app = createHonoApp().basePath('/api');
    app.use(prettyJSON());
    app.use(unifiedResponseMiddleware);
    app.onError(globalErrorHandler);
    app.get('/', (c) => c.text('3R Blog API'));
    app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

    const apiRoutes = createHonoApp()
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
        .route(authPath, authRoutes)
        .route(beautifyStoryPath, beautifyStoryRoutes)
        .route(generateCentralIdeaPath, generateCentralIdeaRoutes)
        .route(createPromptPath, createPromptRoutes)
        .route(generateAiChildrenPicturePath, generateAiChildrenPictureRoutes);

    app.route('', apiRoutes);

    app.get(
        '/data',
        openAPIRouteHandler(apiRoutes, {
            documentation: {
                openapi: '3.1.0',
                info: {
                    version: 'v1',
                    title: '3RCD API',
                    description: '3R TS全栈课程的后端API',
                },
                servers: [
                    {
                        url: '/api',
                        description: 'API 基础路径',
                    },
                ],
                components: {
                    securitySchemes: {
                        sessionCookie: {
                            type: 'apiKey',
                            in: 'cookie',
                            name: 'better-auth.session_token',
                            description: '登录后自动携带的 session cookie',
                        },
                    },
                },
                security: [],
            },
        }),
    );

    app.get('/swagger', swaggerUI({ url: '/api/data' }));

    app.get(
        '/docs',
        Scalar({
            theme: 'saturn',
            url: '/api/data',
            layout: 'modern',
            darkMode: true,
        }),
    );

    return { app, routes: apiRoutes };
});
type RPCType = Awaited<typeof serverRPC>['routes'];
export { type RPCType, serverRPC };
