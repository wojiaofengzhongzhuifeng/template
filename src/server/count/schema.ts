import z from 'zod';

/**
 * Count ID 请求参数
 */
export const countIdParamsSchema = z.object({
    id: z.string().meta({ description: 'Count ID' }),
});

/**
 * Count 创建请求数据结构
 */
export const countCreateSchema = z
    .object({
        number: z.number().int().default(0).meta({ description: '计数值' }),
        isPublic: z.boolean().default(false).meta({ description: '是否公开' }),
    })
    .meta({ $id: 'CountCreate', description: '创建 Count 请求数据' });

/**
 * Count 更新请求数据结构
 */
export const countUpdateSchema = z
    .object({
        number: z.number().int().optional().meta({ description: '计数值' }),
        isPublic: z.boolean().optional().meta({ description: '是否公开' }),
    })
    .meta({ $id: 'CountUpdate', description: '更新 Count 请求数据' });

/**
 * Count 响应数据结构
 */
export const countSchema = z
    .object({
        id: z.string(),
        number: z.number().int(),
        isPublic: z.boolean(),
        userId: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .meta({ $id: 'Count', description: 'Count 详情数据' });

/**
 * Count 列表响应数据结构
 */
export const countListSchema = z
    .array(countSchema)
    .meta({ $id: 'CountList', description: 'Count 列表数据' });
