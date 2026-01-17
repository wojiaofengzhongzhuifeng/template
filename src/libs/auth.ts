import type z from 'zod';

import { PrismaPg } from '@prisma/adapter-pg';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { emailOTP, openAPI, username } from 'better-auth/plugins';

import type { EmailOTPType } from '@/server/user/constants';

import { authConfig } from '@/config/auth';
import { PrismaClient } from '@/database/generated/client';
import { getBaseUrl } from '@/libs/app';
import { addOTPQueue } from '@/server/user/queue';

import type {
    AliyunSendMailOptions,
    SmtpSendMailOptions,
    TencentCloudSendMailOptions,
} from './mail/types';
const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const NextCookiesPlugin = nextCookies();
export const createServerAuth = () =>
    betterAuth({
        database: prismaAdapter(prisma, {
            provider: 'postgresql',
        }),
        emailAndPassword: {
            enabled: true,
            autoSignIn: false, // 禁用注册后自动登录
        },
        baseURL: getBaseUrl(),
        basePath: '/api/auth',
        plugins: [
            // 用户名登录插件
            username(),
            // openapi插件
            openAPI({
                path: '/reference',
                disableDefaultReference: false,
            }),
            emailOTP({
                allowedAttempts: authConfig.mails?.OTP?.allowedAttempts,
                expiresIn: authConfig.mails?.OTP?.expiresIn,
                async sendVerificationOTP({ email, otp, type }) {
                    addOTPQueue(email, otp, type);
                },
            }),
        ],
    });
export const auth = createServerAuth();
// nextjs的cookie仿问插件
auth.options.plugins.push(NextCookiesPlugin as any);
export interface AuthType {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
}

interface BaseOTPSendConfig {
    /**
     * OTP邮件客户端名称,查看src/config/mail.ts
     */
    client?: string;
    /**
     * OTP邮件主题生成函数
     * @param type
     */
    subject: (type: `${EmailOTPType}`) => (...args: any[]) => string;
}

type AliyunOTPSendConfig = BaseOTPSendConfig &
    Omit<AliyunSendMailOptions, 'to' | 'vars' | 'subject'>;
type SmtpOTPSendConfig = BaseOTPSendConfig & Omit<SmtpSendMailOptions, 'to' | 'vars' | 'subject'>;
type TencentOTPSendConfig = BaseOTPSendConfig &
    Omit<TencentCloudSendMailOptions, 'to' | 'vars' | 'subject'>;

/**
 * 用户认证配置类型
 */
export interface AuthConfig {
    protectedPages: string[];
    validates: {
        username: z.ZodString;
        password: z.ZodString;
    };
    /**
     * 用户认证相关的邮件配置
     */
    mails?: {
        /**
         * 验证码邮件配置
         */
        OTP?: {
            /**
             * 发送间隔时间, 单位秒，防止频繁发送
             */
            rateLimit?: number;
            /**
             * 同一个用户名或者邮箱的最大尝试次数
             */
            allowedAttempts?: number;
            /**
             * 验证码有效期，单位秒
             */
            expiresIn?: number;
            /**
             * 不同类型OTP邮件的发送配置
             */
            send?: {
                [K in EmailOTPType]?:
                    | AliyunOTPSendConfig
                    | SmtpOTPSendConfig
                    | TencentOTPSendConfig;
            };
        };
    };
}
