import z from 'zod';

export const countExample = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    number: 10,
    isPublic: true,
    userId: 'user-001',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
};

export const countListExample = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        number: 10,
        isPublic: true,
        userId: 'user-001',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
        id: '660e8400-e29b-41d4-a716-446655440001',
        number: 25,
        isPublic: false,
        userId: 'user-001',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
    },
];

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
        createdAt: z.string().meta({ description: '创建时间' }),
        updatedAt: z.string().meta({ description: '更新时间' }),
    })
    .meta({ $id: 'Count', description: 'Count 详情数据' });

/**
 * Count 列表响应数据结构
 */
export const countListSchema = z
    .array(countSchema)
    .meta({ $id: 'CountList', description: 'Count 列表数据' });
