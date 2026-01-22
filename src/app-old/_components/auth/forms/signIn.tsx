'use client';

import type { FC } from 'react';

import { Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';

import { Button } from '../../shadcn/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../shadcn/ui/form';
import { Input } from '../../shadcn/ui/input';
import { useSignInForm, useSignInSubmit } from '../hooks';
import { AuthFormSkeleton } from '../skeleton';
const FormComponent: FC = () => {
    const form = useSignInForm();
    const submitHandler = useSignInSubmit();
    const searchParams = useSearchParams();
    const signupUrl = useMemo(() => {
        let url = '/auth/signup';
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
            params.set(key, value);
        });

        if (params.toString()) url += `?${params.toString()}`;

        return url;
    }, [searchParams]);
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(submitHandler)} className="!mt-4 space-y-3">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                                    <Input
                                        {...field}
                                        className="pl-10"
                                        autoComplete="username"
                                        placeholder="请输入用户名或邮箱地址"
                                        disabled={form.formState.isSubmitting}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                                    <Input
                                        {...field}
                                        className="pl-10"
                                        type="password"
                                        autoComplete="password"
                                        placeholder="请输入密码"
                                        disabled={form.formState.isSubmitting}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Link
                        href="/auth/forget-password"
                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        忘记密码？
                    </Link>
                </div>
                <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="!mt-5 w-full"
                >
                    {form.formState.isSubmitting ? '登录中...' : '登录'}
                </Button>
                <Button asChild className="!mt-5 w-full">
                    <Link href={signupUrl}>注册</Link>
                </Button>
            </form>
        </Form>
    );
};
export const SignInForm: FC = () => (
    <Suspense fallback={<AuthFormSkeleton />}>
        <FormComponent />
    </Suspense>
);
