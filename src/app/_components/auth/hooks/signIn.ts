'use client';
import type { DeepNonNullable } from 'utility-types';

import { zodResolver } from '@hookform/resolvers/zod';
import { isNil } from 'lodash';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { SignInRequest, User } from '@/server/user/type';

import { authApi } from '@/api/auth';
import { signinRequestSchema } from '@/server/user/schema';

import { useSetAuth } from './auth';

/**
 * 创建登录表单构建器
 */
export const useSignInForm = () => {
    const defaultValues = {
        username: '',
        password: '',
    } as DeepNonNullable<SignInRequest>;
    return useForm<SignInRequest>({
        mode: 'all',
        resolver: zodResolver(signinRequestSchema),
        defaultValues,
    });
};

/**
 * 创建登录提交处理器
 * @param setAuthError
 */
export const useSignInSubmit = () => {
    const router = useRouter();
    const setAuth = useSetAuth();
    return useCallback(
        async (params: DeepNonNullable<SignInRequest>) => {
            try {
                await authApi.signIn(params, {
                    onSuccess: (c) => {
                        setAuth(c.data?.user as unknown as User);
                        toast.success('登录成功');
                        // // 检查是否有回调URL参数
                        const urlParams = new URLSearchParams(window.location.search);
                        const callbackUrl = urlParams.get('callbackUrl');

                        isNil(callbackUrl) ? router.replace('/') : router.replace(callbackUrl);
                    },
                    onError: (error: any) => {
                        toast.error('登录失败', {
                            description: error.message || '请检查用户名/邮箱和密码',
                        });
                    },
                });
            } catch (error) {
                toast.error('登录失败', {
                    description: (error as Error).message || '服务器错误',
                });
            }
        },
        [router],
    );
};
