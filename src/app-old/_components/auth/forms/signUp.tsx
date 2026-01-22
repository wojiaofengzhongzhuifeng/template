'use client';

import type { FC } from 'react';

import { KeyRound, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useMemo } from 'react';

import { Button } from '../../shadcn/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../shadcn/ui/form';
import { Input } from '../../shadcn/ui/input';
import { useSendVerificationOTP, useSignUpForm, useSignUpSubmit } from '../hooks';
import { AuthFormSkeleton } from '../skeleton';

const FormComponent: FC = () => {
    const form = useSignUpForm();
    const submitHandler = useSignUpSubmit();
    const username = form.watch('username');
    const email = form.watch('email');
    const { sendOTP, buttonText, canSend } = useSendVerificationOTP(email);

    const disableSendBtn = useMemo(() => {
        return (
            username.length === 0 ||
            email.length === 0 ||
            !!form.formState.errors.username ||
            !!form.formState.errors.email ||
            form.formState.isSubmitting ||
            !canSend
        );
    }, [
        username,
        email,
        form.formState.errors.username,
        form.formState.errors.email,
        form.formState.isSubmitting,
        canSend,
    ]);

    const sendOTPHandler = useCallback(async () => {
        if (!disableSendBtn) await sendOTP(email);
    }, [disableSendBtn, email]);
    const searchParams = useSearchParams();
    const signinUrl = useMemo(() => {
        let url = '/auth/signin';
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
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                                    <Input
                                        {...field}
                                        className="pl-10"
                                        autoComplete="email"
                                        placeholder="请输入邮箱地址"
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
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="flex space-x-2">
                                    <div className="relative flex-1">
                                        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                                        <Input
                                            {...field}
                                            className="pl-10"
                                            placeholder="请输入6位验证码"
                                            maxLength={6}
                                            disabled={form.formState.isSubmitting}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={disableSendBtn}
                                        onClick={sendOTPHandler}
                                        className="whitespace-nowrap"
                                    >
                                        {buttonText}
                                    </Button>
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
                <FormField
                    control={form.control}
                    name="plainPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                                    <Input
                                        {...field}
                                        className="pl-10"
                                        type="password"
                                        placeholder="请再次输入密码"
                                        disabled={form.formState.isSubmitting}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="!mt-5 w-full"
                >
                    {form.formState.isSubmitting ? '注册中...' : '注册'}
                </Button>
                <Button asChild className="!mt-5 w-full">
                    <Link href={signinUrl}>登录</Link>
                </Button>
            </form>
        </Form>
    );
};
export const SignUpForm: FC = () => (
    <Suspense fallback={<AuthFormSkeleton />}>
        <FormComponent />
    </Suspense>
);
