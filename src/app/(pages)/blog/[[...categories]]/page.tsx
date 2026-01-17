import type { FC } from 'react';

import type { IBlogMetadata } from '@/app/_components/blog/metadata';
import type { IPaginateQueryProps } from '@/app/_components/paginate/types';

import { BlogIndex } from '@/app/_components/blog/list';
import { getBlogMetadata } from '@/app/_components/blog/metadata';

export const generateMetadata = async (
    metadata: Omit<IBlogMetadata, 'parent'>,
    parent: IBlogMetadata['parent'],
) => getBlogMetadata({ ...metadata, parent });

const BlogIndexPage: FC<{
    searchParams: Promise<IPaginateQueryProps & { tag?: string }>;
    params: Promise<{ categories?: string[] }>;
}> = async ({ searchParams, params }) => {
    const { categories } = await params;
    const rest = { ...(await searchParams), categories };
    return <BlogIndex {...rest} />;
};

export default BlogIndexPage;
