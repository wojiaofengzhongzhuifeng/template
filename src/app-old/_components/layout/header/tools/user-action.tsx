'use client';

import type { FC } from 'react';

import { isNil } from 'lodash';
import { Loader2, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useState } from 'react';
import { useMount } from 'react-use';
import { toast } from 'sonner';

import type { User } from '@/server/user/type';

import { authApi } from '@/api/auth';
import { AuthChecker } from '@/app-old/_components/auth';
import { useSetAuth } from '@/app-old/_components/auth/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/app-old/_components/shadcn/ui/avatar';
import { Button } from '@/app-old/_components/shadcn/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/app-old/_components/shadcn/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/app-old/_components/shadcn/ui/tooltip';
import { cn } from '@/app-old/_components/shadcn/utils';

import UserAvatar from './avatar.svg';
import $styles from './user-action.module.css';

export const HandleButton: FC<{ auth: User | null }> = ({ auth }) => {
    const router = useRouter();
    const setAuth = useSetAuth();
    const [mounted, setMounted] = useState(false);
    useMount(() => {
        setMounted(true);
    });

    const handleLogout = useCallback(async () => {
        try {
            await authApi.signOut({
                onSuccess: () => {
                    toast.success('退出登录成功');
                    setAuth(null);
                    router.refresh();
                    //  window.location.reload();
                },
            });
        } catch (error) {
            toast.error('退出登录失败', {
                description: (error as Error).message || '服务器错误',
            });
        }
    }, [router]);

    return !mounted || isNil(auth) ? (
        <div className={cn($styles.user)}>
            <Suspense>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild className="ml-auto" size="icon" variant="outline">
                                <Link href="/auth/signin">
                                    <UserIcon />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>登录账户</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </Suspense>
        </div>
    ) : (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Avatar className={$styles.avatar}>
                    <AvatarImage src={UserAvatar.src} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 text-center text-stone-500">
                <DropdownMenuLabel className="justify-center">我的账户</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Link href="#" onClick={handleLogout}>
                        退出登录
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const UserActionButton: FC = () => {
    return (
        <AuthChecker
            loading={
                <Button disabled className="ml-auto" size="icon" variant="outline">
                    <Loader2 className="animate-spin" />
                </Button>
            }
            render={(props) => <HandleButton {...props} />}
        />
    );
};
