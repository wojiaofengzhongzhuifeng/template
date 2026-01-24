import type { Metadata, ResolvingMetadata } from 'next';
import type { FC } from 'react';

import { notFound } from 'next/navigation';

import { postApi } from '@/api/post';
import { PostPageForm } from '@/app-old/_components/blog/form';
import { cn } from '@/app-old/_components/shadcn/utils';

import $styles from '../../create/style.module.css';

// 添加动态标记，强制使用 SSR
export const dynamic = 'force-dynamic';

export const generateMetadata = async (_: any, parent: ResolvingMetadata): Promise<Metadata> => {
    return {
        title: `编辑文章 - ${(await parent).title?.absolute}`,
        description: '文章编辑页面',
    };
};

const PostEditPage: FC<{ params: Promise<{ item: string }> }> = async ({ params }) => {
    const { item } = await params;
    let post;
    try {
        post = await postApi.detailById(item);
    } catch (error: any) {
        if (error.code === 2001 || error.code === 404) return notFound();
        throw error;
    }
    post = post as any;
    return (
        <div className="page-item">
            <div className={cn($styles.item, 'page-container')}>
                <PostPageForm post={post} />
            </div>
        </div>
    );
};
export default PostEditPage;
