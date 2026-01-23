import type { z } from 'zod';

import type { countRoutes } from './routes';
import type {
    countCreateSchema,
    countIdParamsSchema,
    countListSchema,
    countSchema,
    countUpdateSchema,
} from './schema';

/**
 * Count ID 请求参数类型
 */
export type CountIdParams = z.infer<typeof countIdParamsSchema>;

/**
 * Count 创建请求类型
 */
export type CountCreate = z.infer<typeof countCreateSchema>;

/**
 * Count 更新请求类型
 */
export type CountUpdate = z.infer<typeof countUpdateSchema>;

/**
 * Count 响应数据类型
 */
export type CountItem = z.infer<typeof countSchema>;

/**
 * Count 列表响应数据类型
 */
export type CountList = z.infer<typeof countListSchema>;

/**
 * Count API 类型
 */
export type CountApiType = typeof countRoutes;
