import type { FC } from 'react';

import { isNil } from 'lodash';
import { Calendar, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { postApi } from '@/api/post';
import { formatTime } from '@/libs/time';

import type { IBlogBreadcrumbItem } from '../breadcrumb';

import { MdxRender } from '../../mdx/render';
import { cn } from '../../shadcn/utils';
import { BlogBreadCrumb } from '../breadcrumb';
import { PostEditButton } from '../list/actions/edit-button';
import { PostItemSkeleton } from '../skeleton';
import { getBreadcrumbsLinks } from '../utils';
import $styles from './style.module.css';

export const PostItemIndex: FC<{ item: string }> = async ({ item }) => {
    let post;
    try {
        post = await postApi.detail(item);
    } catch (error: any) {
        if (error.code === 2001 || error.code === 404) return notFound();
        throw error;
    }
    post = post as any;
    const breadcrumbs: IBlogBreadcrumbItem[] = [...getBreadcrumbsLinks(post.categories, 'post')];

    breadcrumbs.push({
        id: post.id,
        text: post.title,
    });
    return (
        <div className="page-item">
            <Suspense fallback={<PostItemSkeleton />}>
                <div className={cn($styles.breadcrumbs, 'page-container')}>
                    <BlogBreadCrumb items={breadcrumbs} basePath="/blog" />
                </div>
                <div className={cn('page-container', $styles.item)}>
                    <div className={$styles.thumb}>
                        <Image
                            src={post.thumb}
                            alt={post.title}
                            fill
                            priority
                            sizes="100%"
                            unoptimized
                        />
                    </div>

                    <div className={$styles.content}>
                        <MdxRender
                            source={post.body}
                            header={
                                <>
                                    <header className={$styles.title}>
                                        <h1 className="text-lg lg:text-3xl">{post.title}</h1>
                                        <div className="mt-[0.125rem]">
                                            <PostEditButton item={post} iconBtn />
                                        </div>
                                    </header>
                                    <div className={$styles.meta}>
                                        <div className={$styles.info}>
                                            <span>
                                                <Calendar className="mr-2" />
                                                <time className="ellips mt-1">
                                                    {formatTime(
                                                        !isNil(post.updatedAt)
                                                            ? post.updatedAt
                                                            : post.createdAt,
                                                    )}
                                                </time>
                                            </span>
                                        </div>
                                        {post.tags.length > 0 && (
                                            <div className={$styles.tags}>
                                                <span className="mr-2">
                                                    <Tag />
                                                </span>
                                                {post.tags.map((tag: any) => (
                                                    <Link
                                                        key={tag.id}
                                                        href={`/blog?tag=${tag.text}`}
                                                    >
                                                        {tag.text}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            }
                        />
                    </div>
                </div>
            </Suspense>
        </div>
    );
};
