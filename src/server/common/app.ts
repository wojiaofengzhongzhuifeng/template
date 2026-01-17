import type { Env } from 'hono';

import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';

import { createQueues } from '@/libs/queue';
import { createRedisClients } from '@/libs/redis';

import type { ServerIncs } from './types';

import { addUserQueueWorker } from '../user/queue';

// 重新导出 getBaseUrl 以保持向后兼容性
export { getBaseUrl } from '@/libs/app';

/**
 * 启动时服务器后的常驻内存变量
 */
export const serverIncs: ServerIncs = {
    redis: {},
    queues: {},
};

/**
 * 服务器启动函数
 */
export const beforeServer = async () => {
    serverIncs.redis = createRedisClients();
    serverIncs.queues = createQueues(serverIncs.redis);
    await addUserQueueWorker();
};

/**
 * 创建Hono应用
 */
export const createHonoApp = <E extends Env>() => {
    const app = new Hono<E>();
    app.use(prettyJSON());
    return app;
};
