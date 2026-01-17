'use client';

import type { FC } from 'react';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import type { User } from '@/server/user/type';

import { AuthChecker } from '@/app/_components/auth';
import { Button as CNButton } from '@/app/_components/shadcn/ui/button';
import { cn } from '@/app/_components/shadcn/utils';
import { useUrlQuery } from '@/libs/url';

export const Button: FC<{ iconBtn?: boolean; auth: User | null }> = ({ iconBtn, auth }) => {
    const urlQuery = useUrlQuery();
    return (
        auth && (
            <div className="flex">
                <CNButton
                    asChild
                    className={cn('ml-auto', {
                        'focus-visible:!ring-0': !iconBtn,
                        'rounded-sm': !iconBtn,
                        'size-9': iconBtn,
                    })}
                    variant="outline"
                    size={iconBtn ? 'icon' : 'default'}
                >
                    <Link href={`/blog/create${urlQuery}`}>
                        <Plus />
                        {!iconBtn && '创建'}
                    </Link>
                </CNButton>
            </div>
        )
    );
};

export const PostCreateButton: FC<{ iconBtn?: boolean }> = ({ iconBtn = false }) => (
    <AuthChecker
        render={(props) => (
            <Suspense>
                <Button iconBtn={iconBtn} {...props} />
            </Suspense>
        )}
    />
);
