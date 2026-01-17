import type { z } from 'zod';

import type { authRoutes } from './routes/auth';
import type {
    authResponseSchema,
    forgetPasswordRequestSchema,
    otpRateLimitRequestSchema,
    sendOTPResponseSchema,
    sessionSchema,
    signinRequestSchema,
    signupRequestSchema,
    userDetailRequestParamsSchema,
    userSchema,
} from './schema';

// 用户类型
export type User = z.infer<typeof userSchema>;

// 会话类型
export type Session = z.infer<typeof sessionSchema>;

// 认证响应类型
export type AuthResponse = z.infer<typeof authResponseSchema>;

// 登录请求类型
export type SignInRequest = z.infer<typeof signinRequestSchema>;

// 注册请求类型
export type SignupRequest = z.infer<typeof signupRequestSchema>;

/**
 * 忘记密码请求类型
 */
export type ResetPasswordRequest = z.infer<typeof forgetPasswordRequestSchema>;

/**
 * 发送验证码响应类型
 */
export type sendOTPResponse = z.infer<typeof sendOTPResponseSchema>;

/**
 * OTP 发送频率限制请求参数类型
 */
export type OTPRateLimitRequest = z.infer<typeof otpRateLimitRequestSchema>;

// 用户详情请求参数类型
export type UserDetailRequestParams = z.infer<typeof userDetailRequestParamsSchema>;

// Better Auth 推断类型
export type AuthUser = typeof import('../../libs/auth').auth.$Infer.Session.user;
export type AuthSession = typeof import('../../libs/auth').auth.$Infer.Session.session;

// Better Auth API类型
export type AuthApiType = typeof authRoutes;

/**
 * 发送验证码邮件的参数
 */
export interface EmailOTPPayload {
    email: string;
    code: string;
}

// 用户列表类型
// export type UserList = z.infer<typeof userListSchema>;

// 注册请求类型
// export type RegisterRequest = z.infer<typeof registerRequestSchema>;
