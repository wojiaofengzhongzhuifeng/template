import type { Metadata, ResolvingMetadata } from 'next';

import { isNil } from 'lodash';
import { cache } from 'react';

import { categoryApi } from '@/api/category';
import { postApi } from '@/api/post';
import { tagApi } from '@/api/tag';

export interface IBlogMetadata {
    params: Promise<{ categories?: string[] }>;
    searchParams: Promise<{ tag?: string }>;
    parent: ResolvingMetadata;
}

export interface IPostMetadata {
    params: Promise<{ item: string }>;
    parent: ResolvingMetadata;
}

const getBreadcrumbs = cache(async (latest: string) => await categoryApi.breadcrumb(latest));
const getTagDetail = cache(async (tag: string) => await tagApi.detail(tag));
const getPostDetails = cache(async (item: string) => await postApi.detail(item));

/**
 * 获取文章列表元数据
 * @param param0
 */
export const getBlogMetadata = async ({
    params,
    searchParams,
    parent,
}: IBlogMetadata): Promise<Metadata> => {
    let title = '博客 | ';
    let keywords = (await parent).keywords ?? [];
    const { categories } = await params;
    const { tag } = await searchParams;
    if (!isNil(categories) && categories.length > 0) {
        const result = await getBreadcrumbs(categories[categories.length - 1]);
        // const result = await categoryApi.breadcrumb(categories[categories.length - 1]);
        if (!result.ok) return {};
        const data = await result.json();
        if (data.length > 0) {
            title = `${data[data.length - 1].name} | `;
            keywords = [...keywords, ...data.map((i) => i.name)];
        }
    }
    if (!isNil(tag)) {
        try {
            const data = await getTagDetail(tag);
            if (!isNil(data)) title = `${title}${data.text} | `;
            keywords.push(tag);
        } catch {}
    }

    title = `${title}${(await parent).title?.absolute}`;

    return {
        title,
        keywords,
    };
};

/**
 * 获取文章元数据
 * @param param0
 */
export const getPostItemMetadata = async ({ params, parent }: IPostMetadata): Promise<Metadata> => {
    const { item } = await params;

    let post;
    try {
        post = await getPostDetails(item);
    } catch {
        return {};
    }
    post = post as any;
    const title = `${post.title} - ${(await parent).title?.absolute}`;
    const keywords =
        isNil(post.keywords) || post.keywords.length === 0
            ? (post.tags || []).map((t: any) => t.text).join(',')
            : post.keywords;
    const description =
        isNil(post.description) || post.description.length === 0 ? post.summary : post.description;

    return {
        title,
        keywords,
        description,
    };
};
