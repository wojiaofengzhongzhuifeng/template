import { isNil } from 'lodash';
import z from 'zod';

import { categoryExample, categoryListSchema, categorySchema } from '../category/schema';
import { tagListSchema } from '../tag/schema';

export const postExample = {
    id: 'post-001',
    title: 'Next.js 14 新特性介绍',
    thumb: 'https://example.com/thumb.jpg',
    summary: '介绍 Next.js 14 的主要新特性和改进',
    keywords: 'Next.js,React,Server Components',
    description: '深入了解 Next.js 14 带来的变化',
    slug: 'nextjs-14-new-features',
    body: '# Next.js 14 新特性介绍\n\nNext.js 14 带来了许多令人兴奋的新特性...',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    tags: [
        {
            id: 'tag-001',
            text: 'React',
        },
    ],
    categories: [
        {
            id: 'cat-001',
            name: '技术',
            slug: 'tech',
            path: 'tech',
            depth: 1,
            numchild: 2,
        },
    ],
    category: categoryExample,
};

export const postPaginateExample = {
    items: [postExample],
    meta: {
        itemCount: 1,
        totalItems: 10,
        perPage: 10,
        totalPages: 1,
        currentPage: 1,
        tags: '',
        categories: [categoryExample],
        category: categoryExample,
    },
};

export const postPageNumbersExample = {
    result: 5,
};

/**
 * 文章查询响应数据结构
 */
export const postSchema = z
    .object({
        id: z.string().meta({ description: '文章ID' }),
        title: z.string().meta({ description: '文章标题' }),
        thumb: z.string().meta({ description: '文章缩略图' }),
        summary: z.string().nullable().optional().meta({ description: '文章摘要' }),
        keywords: z.string().nullable().optional().meta({
            description: '文章关键字',
        }),
        description: z.string().nullable().optional().meta({
            description: '文章描述',
        }),
        slug: z.string().nullable().optional().meta({ description: '文章slug' }),
        body: z.string().meta({ description: '文章内容' }),
        createdAt: z.string().meta({ description: '文章创建时间' }),
        updatedAt: z.string().meta({ description: '最近更新时间' }),
        tags: tagListSchema.meta({ description: '关联标签列表' }),
        categories: categoryListSchema.meta({ description: '关联分类及其祖先分类列表' }),
        category: categorySchema.nullable().meta({ description: '关联分类' }),
    })
    .strict()
    .meta({ $id: 'Post', description: '文章详情数据' });

/**
 * 文章分页查询响应数据结构
 */
export const postPaginateSchema = z
    .object({
        items: z.array(postSchema).meta({ description: '文章列表' }),
        meta: z.object({
            itemCount: z.number().meta({ description: '当前页文章数量' }),
            totalItems: z.number().optional().meta({ description: '文章总数量' }),
            perPage: z.number().meta({ description: '每页文章数量' }),
            totalPages: z.number().optional().meta({ description: '文章总页数' }),
            currentPage: z.number().meta({ description: '当前页码' }),
            tags: z.string().optional().meta({ description: '关联标签列表' }),
            categories: categoryListSchema.meta({ description: '关联分类及其祖先分类列表' }),
            category: categorySchema.nullable().meta({ description: '关联分类' }),
        }),
    })
    .meta({ $id: 'PostPagniate', description: '文章分页数据' });

/**
 * 文章页面总数查询响应数据结构
 */
export const postPageNumbersSchema = z
    .object({
        result: z.coerce.number(),
        tag: z.string().optional().meta({ description: '标签过滤' }),
        category: z.string().optional().meta({ description: '分类过滤' }),
    })
    .meta({ $id: 'PostNumbers', description: '文章总页数' });

/**
 * 文章分页查询请求数据结构
 */
export const postPaginateRequestQuerySchema = z.object({
    page: z.coerce.number().optional().meta({
        description: '页码，要查询的页码，从 1 开始。不提供则默认为第 1 页',
    }),
    limit: z.coerce.number().optional().meta({
        description: '每页数量，每页显示的文章数量。不提供则使用默认值，通常为 10 或 20',
    }),
    orderBy: z.enum(['asc', 'desc']).optional().meta({
        description:
            '排序方式，文章列表的排序规则。可选值：asc（升序，从旧到新）、desc（降序，从新到旧，默认）',
    }),
    tag: z.string().optional().meta({
        description: '标签过滤，根据标签筛选文章。可以传入标签ID或标签名称，不提供则不过滤',
    }),
    category: z.string().optional().meta({
        description: '分类过滤，根据分类筛选文章。可以传入分类ID或分类slug，不提供则不过滤',
    }),
});

/**
 * 文章页面总数查询请求数据结构
 */
export const postPageNumbersRequestQuerySchema = z.object({
    limit: z.coerce.number().optional().meta({
        description: '每页数量，用于计算总页数。不提供则使用默认值',
    }),
    tag: z.string().optional().meta({
        description: '标签过滤，根据标签筛选文章后计算总页数。可以传入标签ID或标签名称',
    }),
    category: z.string().optional().meta({
        description: '分类过滤，根据分类筛选文章后计算总页数。可以传入分类ID或分类slug',
    }),
});

/**
 * 文章详情查询请求数据结构
 */
export const postDetailRequestParamsSchema = z.object({
    item: z.string().meta({
        description: '文章ID/slug，可以通过文章ID或slug查询文章详情',
    }),
});

/**
 * 通过ID查询文章详情的请求数据结构
 */
export const postDetailByIdRequestParamsSchema = z.object({
    id: z.string().meta({
        description: '文章ID，文章的唯一标识符',
    }),
});
/**
 * 通过slug查询文章详情的请求数据结构
 */
export const postDetailBySlugRequestParamsSchema = z
    .object({
        slug: z.string(),
    })
    .meta({
        description: '文章slug，文章的URL友好标识符，用于SEO和友好的URL访问',
    });

/**
 * 文章操作(建或更新文章)时的请求数据结构
 * @param slugUniqueValidator Slug唯一性验证结构生成器
 */
export const getPostItemRequestSchema = (
    slugUniqueValidator?: (val?: string | null) => Promise<boolean>,
) => {
    let slug = z
        .string()
        .max(250, {
            message: 'slug不得超过250个字符',
        })
        .optional()
        .meta({
            description:
                '文章slug，URL友好的标识符，用于SEO。只能包含小写字母、数字、连字符，必须唯一',
        });
    if (!isNil(slugUniqueValidator)) {
        slug = slug.refine(slugUniqueValidator, {
            message: 'slug必须是唯一的,请重新设置',
        }) as any;
    }
    return z
        .object({
            title: z
                .string()
                .min(1, {
                    message: '标题不得少于1个字符',
                })
                .max(200, {
                    message: '标题不得超过200个字符',
                })
                .meta({
                    description: '文章标题，文章的主标题，用于展示和SEO。字数限制1-200字',
                }),
            body: z
                .string()
                .min(1, {
                    message: '标题不得少于1个字符',
                })
                .meta({
                    description: '文章内容，文章的正文内容，支持Markdown格式',
                }),
            summary: z
                .string()
                .max(300, {
                    message: '摘要不得超过300个字符',
                })
                .optional()
                .meta({
                    description:
                        '文章摘要，文章的简短摘要，用于列表展示和SEO。字数限制0-300字，可选',
                }),
            keywords: z
                .string()
                .max(200, {
                    message: '描述不得超过200个字符',
                })
                .optional()
                .meta({
                    description: '文章关键字，逗号分隔的关键词，用于SEO。字数限制0-200字，可选',
                }),
            description: z
                .string()
                .max(300, {
                    message: '描述不得超过300个字符',
                })
                .optional()
                .meta({
                    description:
                        '文章描述，用于SEO的描述信息，显示在搜索引擎结果中。字数限制0-300字，可选',
                }),
            slug,
            tags: tagListSchema.optional().meta({
                description: '关联标签列表，文章关联的标签数组。标签对象包含 id 和 text 字段，可选',
            }),
            categoryId: z.string().optional().meta({
                description: '关联分类ID，文章所属的分类ID，可选',
            }),
        })
        .strict();
};
