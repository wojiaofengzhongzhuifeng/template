import { usernameClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { isNil } from 'lodash';

import type {
    AuthApiType,
    OTPRateLimitRequest,
    ResetPasswordRequest,
    SignInRequest,
    SignupRequest,
    User,
} from '@/server/user/type';

import { buildClient, fetchApi } from '@/libs/hono';

export const authFetchClient = buildClient<AuthApiType>('/auth');

export const authClient = createAuthClient({
    basePath: '/api/auth',
    plugins: [usernameClient()],
    fetchOptions: {
        credentials: 'include',
    },
});

export const authApi = {
    /**
     * 用户登录 - 智能登录（支持用户名或邮箱）
     * @param data 登录数据（用户名/邮箱 + 密码）
     * @param options 额外选项
     */
    signIn: async (
        data: SignInRequest,
        options?: {
            rememberMe?: boolean;
            callbackURL?: string;
            onSuccess?: (ctx?: any) => void;
            onError?: (error: any) => void;
        },
    ) => {
        console.log('[authApi.signIn] Starting login...', {
            username: data.username,
            callbackURL: options?.callbackURL,
        });

        try {
            const result = await authClient.signIn.username(
                {
                    username: data.username,
                    password: data.password,
                    callbackURL: options?.callbackURL,
                    rememberMe: options?.rememberMe ?? true,
                },
                {
                    onSuccess: (ctx?: any) => {
                        console.log('[authApi.signIn] onSuccess called:', ctx);
                        options?.onSuccess?.(ctx);
                    },
                    onError: (err) => {
                        console.error('[authApi.signIn] onError called:', err);
                        options?.onError?.(err);
                    },
                },
            );
            console.log('[authApi.signIn] Login completed:', result);
            return result;
        } catch (error) {
            console.error('[authApi.signIn] Login failed:', error);
            if (options?.onError) {
                options.onError(error);
            }
            throw error;
        }
    },

    /**
     * 用户登出 - 使用 Better Auth 官方客户端
     */
    signOut: async (options?: { onSuccess?: () => void }) => {
        console.log('[authApi.signOut] Starting logout...');
        const result = await authClient.signOut({
            fetchOptions: {
                onSuccess: options?.onSuccess,
            },
        });
        console.log('[authApi.signOut] Logout completed:', result);
        return result;
    },

    /**
     * 获取会话信息 - 异步方式
     */
    getSession: async () => authClient.getSession(),

    /**
     * 获取当前登录用户信息
     */
    getAuth: async () => {
        const session = await authClient.getSession();
        if (isNil(session) || isNil(session.data?.user)) return null;
        return session.data?.user as any as User;
    },

    /**
     * 通过邮件验证码注册
     * @param data
     */
    signUp: async (data: SignupRequest) => {
        console.log('[authApi.signUp] Starting signup...', { username: data.username });
        const result = fetchApi(authFetchClient, async (c) => c['sign-up'].$post({ json: data }));
        console.log('[authApi.signUp] Signup completed');
        return result;
    },

    /**
     * 重置密码
     */
    resetPassword: async (data: ResetPasswordRequest) =>
        fetchApi(authFetchClient, async (c) => c['reset-password'].$post({ json: data })),

    /**
     * 发送邮箱验证码
     */
    sendEmailVerificationOTP: async (email: string) =>
        fetchApi(authFetchClient, async (c) =>
            c.otp['email-verification'].$post({ json: { email } }),
        ),
    /**
     * 发送忘记密码邮箱验证码
     */
    sendForgetPasswordOTP: async (credential: string) =>
        fetchApi(authFetchClient, async (c) =>
            c.otp['forget-password'].$post({ json: { credential } }),
        ),
    /**
     * 获取 OTP 发送状态
     */
    getOTPStatus: async (data: OTPRateLimitRequest) =>
        fetchApi(authFetchClient, async (c) => c.otp.status.$post({ json: data })),
    /**
     * 通过用户名或邮箱检查用户是否存在
     * @param credential
     */
    checkUserExists: async (credential: string) =>
        fetchApi(authFetchClient, async (c) =>
            c.check['user-exists'].$post({ json: { credential } }),
        ),
    /**
     * 检测用户名唯一性
     * @param username
     */
    checkUsernameUnique: async (username: string) =>
        fetchApi(authFetchClient, async (c) =>
            c.check['username-unique'].$post({ json: { username } }),
        ),
    /**
     * 检测邮箱唯一性
     * @param email
     */
    checkEmailUnique: async (email: string) =>
        fetchApi(authFetchClient, async (c) => c.check['email-unique'].$post({ json: { email } })),
};
