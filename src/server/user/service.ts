import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { isNil } from 'lodash';

import { authConfig } from '@/config/auth';

import type { EmailOTPType } from './constants';
import type { ResetPasswordRequest, sendOTPResponse, SignupRequest, User } from './type';

import { auth } from '../../libs/auth';
import db from '../../libs/db/client';
import { checkOTPRateLimit, recordOTPSendTime } from './otp';
import { addOTPQueue } from './queue';

/**
 * 获取当前用户会话信息
 */
export const getCurrentSession = async (request: Request) => {
    return await auth.api.getSession({
        headers: request.headers,
    });
};

/**
 * 用户登录 - 支持用户名或邮箱
 */
export const signIn = async (credential: string, password: string) => {
    // 首先查找用户，支持用户名或邮箱
    const user = await db.user.findFirst({
        where: {
            OR: [{ username: credential }, { email: credential }],
        },
    });

    if (isNil(user)) {
        return null;
    }

    // 使用Better Auth的内部验证方法
    const result = await auth.api.signInEmail({
        body: {
            email: user.email,
            password,
        },
    });

    return result;
};

/**
 * 用户登出
 */
export const signOut = async (request: Request) => {
    return await auth.api.signOut({
        headers: request.headers,
    });
};

/**
 * 获取用户信息
 */
export const getUser = async (request: Request) => {
    const session = await getCurrentSession(request);
    return session?.user || null;
};

/**
 * 验证用户会话
 */
export const verifySession = async (request: Request) => {
    const session = await getCurrentSession(request);
    return !!session?.user;
};

/**
 * 查询用户详情
 * @param credential
 */
export const queryUser = async (credential: string) => {
    return await db.user.findFirst({
        where: {
            OR: [{ id: credential }, { username: credential }, { email: credential }],
        },
    });
};

/**
 * 根据用户名或邮箱查询用户详情
 * @param credential
 */
export const queryUserByUsernameOrEmail = async (credential: string) => {
    return await db.user.findFirst({
        where: {
            OR: [{ username: credential }, { email: credential }],
        },
    });
};

/**
 * 根据用户名查询用户详情
 * @param value
 */
export const queryUserByUsername = async (value: string) => {
    return await db.user.findFirst({
        where: {
            username: value,
        },
    });
};

/**
 * 根据邮箱地址查询用户详情
 * @param value
 */
export const queryUserByEmail = async (value: string) => {
    return await db.user.findFirst({
        where: {
            email: value,
        },
    });
};

/**
 * 删除用户
 * @param id
 */
export const deleteUser = async (id: string) => {
    const user = await queryUser(id);
    if (!isNil(user)) {
        await db.user.delete({ where: { id } });
        return user;
    }
    return null;
};

/**
 * 通过邮件注册用户
 * @param data
 */
export const signUpByEmail = async (
    data: Omit<SignupRequest, 'validateType'>,
): Promise<{ result: false; message: string } | { result: true; user: User }> => {
    const { username, email, password, otp: _otp } = data;

    const existingUserByEmail = await queryUserByEmail(email);
    if (existingUserByEmail) return { result: false, message: '邮箱已被使用' };

    const existingUserByUsername = await queryUserByUsername(username);
    if (existingUserByUsername) return { result: false, message: '用户名已被使用' };

    let res: { token: string; user: User } | undefined;

    try {
        res = (await auth.api.signUpEmail({
            body: {
                name: username,
                username,
                email,
                password,
            },
        })) as unknown as { token: string; user: User };
        // TODO: 临时跳过邮箱验证，待配置 SMTP 后恢复
        // const checkOtp = await auth.api.checkVerificationOTP({
        //     body: { email, type: 'email-verification', otp },
        // });
        // if (!checkOtp.success) {
        //     await deleteUser(res.user.id);
        //     return { result: false, message: '验证码错误' };
        // } else {
        //     await db.user.update({
        //         where: { email: res.user.email },
        //         data: { emailVerified: true },
        //     });
        // }
        // 临时：直接标记邮箱已验证
        await db.user.update({
            where: { email: res.user.email },
            data: { emailVerified: true },
        });
    } catch (error: any) {
        if (!isNil(res?.user.id)) await deleteUser(res.user.id);
        return { result: false, ...error.body };
    }
    return { result: true, user: res.user };
};

/**
 * 通过邮箱重置用户密码
 * @param data
 */
export const resetPasswordByEmail = async (data: ResetPasswordRequest) => {
    const { credential, password, otp } = data;
    const user = await queryUserByUsernameOrEmail(credential);
    if (isNil(user)) {
        return { result: false, message: '用户不存在' };
    }
    const res = await auth.api.resetPasswordEmailOTP({
        body: {
            email: user.email,
            otp,
            password,
        },
    });
    return { result: res.success, message: res.success ? '密码重置成功' : '密码重置失败' };
};

/**
 * 发送用户邮件验证码
 * @param email
 */
export const sendOTP = async (
    email: string,
    type: `${EmailOTPType}`,
): Promise<{ result: sendOTPResponse; code: ContentfulStatusCode }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const limit = authConfig.mails?.OTP?.rateLimit ?? 60;
    // 检查发送频率
    const rateLimitCheck = await checkOTPRateLimit(normalizedEmail, type);

    if (!rateLimitCheck.canSend) {
        return {
            result: {
                message: `请在 ${rateLimitCheck.remainingTime} 秒后重试`,
                canSend: false,
                remainingTime: rateLimitCheck.remainingTime,
                nextSendTime: rateLimitCheck.nextSendTime,
            },
            code: 429,
        };
    }

    // 发送验证码
    if (type === 'email-verification') {
        const identifier = `${type}-otp-${normalizedEmail}`;
        const otp = await auth.api
            .createVerificationOTP({
                body: {
                    email: normalizedEmail,
                    type,
                },
            })
            .catch(async () => {
                // 已经创建发送数据则删除
                await db.verification.deleteMany({ where: { identifier } });
                return await auth.api.createVerificationOTP({
                    body: { email: normalizedEmail, type },
                });
            });
        await addOTPQueue(normalizedEmail, otp, type);
    } else {
        await auth.api.sendVerificationOTP({
            body: {
                email: normalizedEmail,
                type,
            },
        });
    }

    // 记录发送时间
    await recordOTPSendTime(normalizedEmail, type);
    return {
        result: {
            message: '发送验证码完毕',
            canSend: false,
            remainingTime: limit,
            nextSendTime: Date.now() + limit * 1000,
        },
        code: 200,
    };
};
/**
 * 更新用户信息
 */
// export const updateUserInfo = async (
//     request: Request,
//     data: { username?: string; displayUsername?: string },
// ) => {
//     const session = await getCurrentSession(request);
//     if (!session?.user) {
//         throw new Error('用户未登录');
//     }

//     // 如果要更新用户名，先检查是否可用
//     if (data.username && data.username !== session.user.username) {
//         const isAvailable = await checkUsernameAvailability(data.username);
//         if (!isAvailable) {
//             throw new Error('用户名已被使用');
//         }
//     }

//     // 更新用户信息
//     const updatedUser = await db.user.update({
//         where: { id: session.user.id },
//         data: {
//             ...(data.username && { username: data.username }),
//             ...(data.displayUsername !== undefined && { displayUsername: data.displayUsername }),
//         },
//     });

//     return updatedUser;
// };
