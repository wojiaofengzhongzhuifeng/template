import type { Metadata, ResolvingMetadata } from 'next';
import type { FC } from 'react';

import { notFound } from 'next/navigation';

import { postApi } from '@/api/post';
import { PostPageForm } from '@/app/_components/blog/form';
import { cn } from '@/app/_components/shadcn/utils';

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
    const result = await postApi.detailById(item);
    if (!result.ok) {
        if (result.status !== 404) throw new Error((await result.json()).message);
        return notFound();
    }
    const post = (await result.json()) as any;
    return (
        <div className="page-item">
            <div className={cn($styles.item, 'page-container')}>
                <PostPageForm post={post} />
            </div>
        </div>
    );
};
export default PostEditPage;
