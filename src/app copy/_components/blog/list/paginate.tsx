import type { FC } from 'react';

import { postApi } from '@/api/post';
import { SimplePaginate } from '@/app/_components/paginate/simple';

export const PostListPaginate: FC<{ limit: number; page: number; tag?: string }> = async ({
    limit,
    page,
    tag,
}) => {
    const result = await postApi.pageNumbers({ limit, tag });
    if (!result.ok) return null;
    const { result: totalPages } = await result.json();
    return (
        <div className="w-full flex-none">
            <SimplePaginate totalPages={totalPages} currentPage={page} />
        </div>
    );
};
