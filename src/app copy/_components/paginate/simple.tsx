'use client';

import type { FC } from 'react';

import clsx from 'clsx';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect } from 'react';

import {
    Pagination as CNPagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/app/_components/shadcn/ui/pagination';

export const Pagination: FC<{ totalPages: number; currentPage: number }> = ({
    totalPages,
    currentPage,
}) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const getPageUrl = useCallback(
        (value: number) => {
            const params = new URLSearchParams(searchParams);
            value <= 1 ? params.delete('page') : params.set('page', value.toString());

            return pathname + (params.toString() ? `?${params.toString()}` : '');
        },
        [searchParams],
    );
    useEffect(() => {
        // 在当前页面小于等于1时，删除URL中的页面查询参数
        const params = new URLSearchParams(searchParams);
        if (currentPage <= 1) params.delete('page');
        router.replace(pathname + (params.toString() ? `?${params.toString()}` : ''));
    }, [currentPage]);
    return totalPages > 1 ? (
        <CNPagination className="justify-start">
            <PaginationContent className="w-full justify-between">
                <PaginationItem>
                    <PaginationPrevious
                        className={clsx(
                            'rounded-sm',
                            currentPage <= 1
                                ? 'bg-slate-50/70 shadow-gray-50'
                                : ' bg-white/90 hover:shadow-nylg hover:shadow-white',
                        )}
                        href={getPageUrl(currentPage - 1)}
                        disabled={currentPage <= 1}
                        aria-label="访问上一页"
                        text="上一页"
                    />
                </PaginationItem>

                <PaginationItem>
                    <PaginationNext
                        className={clsx(
                            'rounded-sm',
                            currentPage >= totalPages
                                ? 'bg-slate-50/70 shadow-gray-50  dark:bg-slate-800/70 dark:shadow-gray-800'
                                : ' bg-white/90 hover:shadow-nylg hover:shadow-white dark:bg-black/90 dark:hover:shadow-black',
                        )}
                        href={getPageUrl(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        aria-label="访问下一页"
                        text="下一页"
                    />
                </PaginationItem>
            </PaginationContent>
        </CNPagination>
    ) : null;
};
export const SimplePaginate: FC<{ totalPages: number; currentPage: number }> = ({
    totalPages,
    currentPage,
}) => (
    <Suspense>
        <Pagination totalPages={totalPages} currentPage={currentPage} />
    </Suspense>
);
