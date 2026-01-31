import z from 'zod';

export const categoryExample = {
    id: 'cat-001',
    name: '技术',
    slug: 'tech',
    path: 'tech',
    depth: 1,
    numchild: 2,
    children: [
        {
            id: 'cat-002',
            name: '前端',
            slug: 'frontend',
            path: 'tech/frontend',
            depth: 2,
            numchild: 0,
        },
        {
            id: 'cat-003',
            name: '后端',
            slug: 'backend',
            path: 'tech/backend',
            depth: 2,
            numchild: 0,
        },
    ],
};

export const categoryListExample = [
    {
        id: 'cat-001',
        name: '技术',
        slug: 'tech',
        path: 'tech',
        depth: 1,
        numchild: 2,
    },
    {
        id: 'cat-004',
        name: '生活',
        slug: 'life',
        path: 'life',
        depth: 1,
        numchild: 1,
    },
];

/**
 * 分类列表查询请求数据结构
 */
export const categoryListRequestParamsSchema = z.object({
    parent: z.string().optional().meta({ description: '父分类ID' }),
});

/**
 * 分类面包屑查询请求数据结构
 */
export const categoryBreadcrumbRequestParamsSchema = z.object({
    latest: z.string().meta({ description: '最后一个起始分类ID' }),
});

const baseCategorySchema = z.object({
    id: z.string().meta({ description: '分类ID' }),
    name: z.string().meta({ description: '分类名称' }),
    slug: z.string().or(z.null()).meta({ description: '分类别名' }),
    path: z.string().meta({ description: '分类路径' }),
    depth: z.number().meta({ description: '分类深度' }),
    numchild: z.number().meta({ description: '子分类数量' }),
});

type Category = z.infer<typeof baseCategorySchema> & {
    children?: Category[];
};

/**
 * 分类查询响应数据结构
 */
export const categorySchema: z.ZodType<Category> = baseCategorySchema
    .extend({
        children: z
            .lazy(() => z.array(categorySchema))
            .optional()
            .meta({ description: '子分类列表' }),
    })
    .meta({ id: 'Category', $id: 'Category', description: '分类详情数据' });

/**
 * 分类列表查询响应数据结构
 */
export const categoryListSchema = z
    .array(baseCategorySchema)
    .meta({ $id: 'CategoryList', description: '分类列表数据' });

/**
 * 分类树查询响应数据结构
 */
export const categoryTreeSchema = z
    .array(categorySchema)
    .meta({ $id: 'CategoryTree', description: '分类树数据' });
