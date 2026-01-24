import { describeRoute, validator as zValidator } from 'hono-openapi';
import { isNil } from 'lodash';

import { successMessageWithResultSchema } from '@/server/common/schema';

import { createHonoApp } from '../../common/app';
import { createErrorResult, defaultValidatorErrorHandler } from '../../common/error';
import {
    create201SuccessResponse,
    createBadRequestErrorResponse,
    createNotFoundErrorResponse,
    createServerErrorResponse,
    createSuccessResponse,
    createUnauthorizedErrorResponse,
    createValidatorErrorResponse,
} from '../../common/response';
import { AuthProtectedMiddleware } from '../middlwares';
import { getOTPSendStatus } from '../otp';
import {
    authResponseSchema,
    authSignoutResponseSchema,
    checkEmailUniqueSchema,
    checkUserExistsSchema,
    checkUsernameUniqueSchema,
    forgetPasswordRequestSchema,
    otpRateLimitRequestSchema,
    sendEmailVerificationOTPRequestSchema,
    sendForgetPasswordOTPRequestSchema,
    sendOTPResponseSchema,
    signinRequestSchema,
    signupRequestSchema,
    signupResponseSchema,
} from '../schema';
import {
    getCurrentSession,
    queryUserByEmail,
    queryUserByUsername,
    queryUserByUsernameOrEmail,
    resetPasswordByEmail,
    sendOTP,
    signIn,
    signOut,
    signUpByEmail,
} from '../service';

const app = createHonoApp();

export const userTags = ['用户认证'];

export const authRoutes = app
    .post(
        '/sign-up',
        describeRoute({
            tags: userTags,
            summary: '用户注册',
            description: '创建新用户账户',
            responses: {
                ...createValidatorErrorResponse(),
                ...create201SuccessResponse(signupResponseSchema),
                ...createBadRequestErrorResponse('请求错误'),
                ...createServerErrorResponse('服务器错误'),
            },
        }),
        zValidator('json', signupRequestSchema, defaultValidatorErrorHandler),
        async (c) => {
            try {
                const { validateType, ...data } = c.req.valid('json');
                if (validateType !== 'email') throw new Error('目前仅支持邮箱注册');
                const res = await signUpByEmail(data);
                if (!res.result) return c.json(createErrorResult(res.message), 400);
                return c.json(res, 201);
            } catch (error: any) {
                return c.json(createErrorResult('注册失败', error), 500);
            }
        },
    )
    .post(
        '/sign-in/username',
        describeRoute({
            tags: userTags,
            summary: '用户名登录',
            description: '支持使用用户名进行登录',
            responses: {
                ...createSuccessResponse(authResponseSchema),
                ...createValidatorErrorResponse(),
                ...createUnauthorizedErrorResponse('认证失败'),
                ...createServerErrorResponse('登录失败'),
            },
        }),
        zValidator('json', signinRequestSchema, defaultValidatorErrorHandler),
        async (c) => {
            try {
                const { username, password } = c.req.valid('json');
                const result = await signIn(username, password);
                if (isNil(result) || isNil(result.token)) {
                    c.json(createErrorResult('认证失败', '用户名密码错误', 401) as any);
                }
                return c.json(result, 200);
            } catch (error: any) {
                return c.json(createErrorResult('登录失败', error), 500);
            }
        },
    )
    .post(
        '/reset-password',
        describeRoute({
            tags: userTags,
            summary: '找回密码',
            description: '通过邮件找回用户密码',
            responses: {
                ...createValidatorErrorResponse(),
                ...createSuccessResponse(successMessageWithResultSchema),
                ...createBadRequestErrorResponse('请求错误'),
                ...createServerErrorResponse('服务器错误'),
            },
        }),
        zValidator('json', forgetPasswordRequestSchema, defaultValidatorErrorHandler),
        async (c) => {
            try {
                const data = c.req.valid('json');
                const result = await resetPasswordByEmail(data);
                return c.json(result, 200);
            } catch (error: any) {
                return c.json(createErrorResult('重置密码失败', error), 500);
            }
        },
    )
    .post(
        '/sign-out',
        describeRoute({
            tags: userTags,
            summary: '用户登出',
            description: '注销当前用户会话',
            responses: {
                ...createSuccessResponse(authSignoutResponseSchema),
                ...createUnauthorizedErrorResponse(),
                ...createServerErrorResponse('登出失败'),
            },
        }),
        AuthProtectedMiddleware,
        async (c) => {
            try {
                await signOut(c.req.raw);
                return c.json({ message: '登出成功' }, 200);
            } catch (error) {
                return c.json(createErrorResult('登出失败', error), 500);
            }
        },
    )
    // 获取会话信息
    .get(
        '/get-session',
        describeRoute({
            tags: userTags,
            summary: '获取会话信息',
            description: '获取当前用户的会话信息',
            responses: {
                ...createSuccessResponse(authResponseSchema),
                ...createUnauthorizedErrorResponse(),
                ...createServerErrorResponse('获取会话失败'),
            },
        }),
        AuthProtectedMiddleware,
        async (c) => {
            try {
                const session = await getCurrentSession(c.req.raw);
                return c.json(
                    {
                        user: session?.user || null,
                        session: session?.session || null,
                    },
                    200,
                );
            } catch (error) {
                return c.json(createErrorResult('获取会话失败', error), 500);
            }
        },
    )
    .post(
        '/otp/email-verification',
        describeRoute({
            tags: userTags,
            summary: '发送用户注册的邮箱验证码',
            description: '发送用户注册的邮箱验证码',
            responses: {
                ...createSuccessResponse(sendOTPResponseSchema),
                ...createValidatorErrorResponse(),
                ...createBadRequestErrorResponse('发送频率限制', 429),
                ...createServerErrorResponse('发送邮箱验证码失败'),
            },
        }),
        zValidator('json', sendEmailVerificationOTPRequestSchema, defaultValidatorErrorHandler),
        async (c) => {
            try {
                const { email } = c.req.valid('json');
                const res = await sendOTP(email, 'email-verification');
                return c.json(res.result, res.code);
            } catch (error) {
                console.error('Email verification error:', error);
                return c.json(createErrorResult('发送邮箱验证码错误', error), 500);
            }
        },
    )
    .post(
        '/otp/forget-password',
        describeRoute({
            tags: userTags,
            summary: '发送找回密码的邮箱验证码',
            description: '发送找回密码的邮箱验证码',
            responses: {
                ...createSuccessResponse(sendOTPResponseSchema),
                ...createValidatorErrorResponse(),
                ...createNotFoundErrorResponse('用户不存在'),
                ...createBadRequestErrorResponse('发送频率限制', 429),
                ...createServerErrorResponse('发送邮箱验证码失败'),
            },
        }),
        zValidator('json', sendForgetPasswordOTPRequestSchema, defaultValidatorErrorHandler),
        async (c) => {
            try {
                const { credential } = c.req.valid('json');
                const user = await queryUserByUsernameOrEmail(credential);
                if (isNil(user)) return c.json(createErrorResult('用户不存在'), 404);
                const res = await sendOTP(user.email, 'forget-password');
                return c.json(res.result, res.code);
            } catch (error) {
                return c.json(createErrorResult('发送邮箱验证码错误', error), 500);
            }
        },
    )
    .post(
        '/otp/status',
        describeRoute({
            tags: userTags,
            summary: '获取 OTP 发送状态',
            description: '获取邮箱验证码的发送状态，用于页面刷新后恢复倒计时',
            responses: {
                ...createSuccessResponse(sendOTPResponseSchema),
                ...createValidatorErrorResponse(),
                ...createServerErrorResponse('获取状态失败'),
            },
        }),
        zValidator('json', otpRateLimitRequestSchema, defaultValidatorErrorHandler),
        async (c) => {
            try {
                const { credential, type } = c.req.valid('json');
                const data = await getOTPSendStatus(credential, type);

                return c.json(data, 200);
            } catch (error) {
                return c.json(createErrorResult('获取状态失败', error), 500);
            }
        },
    )
    .post(
        '/check/user-exists',
        describeRoute({
            tags: userTags,
            summary: '通过用户名或邮箱检查对应的用户是否存在',
            description: '通过用户名或邮箱检查对应的用户是否存在',
            responses: {
                ...createValidatorErrorResponse(),
                ...createSuccessResponse(successMessageWithResultSchema),
                ...createServerErrorResponse('服务器错误'),
            },
        }),
        zValidator('json', checkUserExistsSchema, defaultValidatorErrorHandler),
        async (c) => {
            try {
                const { credential } = c.req.valid('json');
                const result = await queryUserByUsernameOrEmail(credential);
                if (!isNil(result)) return c.json({ result: true, message: '用户存在' }, 200);
                return c.json({ result: false, message: '用户不存在' }, 200);
            } catch (error: any) {
                return c.json(createErrorResult('用户检查失败', error), 500);
            }
        },
    )
    .post(
        '/check/username-unique',
        describeRoute({
            tags: userTags,
            summary: '检测用户名的唯一性',
            description: '检测用户名的唯一性',
            responses: {
                ...createValidatorErrorResponse(),
                ...createSuccessResponse(successMessageWithResultSchema),
                ...createServerErrorResponse('服务器错误'),
            },
        }),
        zValidator('json', checkUsernameUniqueSchema, defaultValidatorErrorHandler),
        async (c) => {
            try {
                const { username } = c.req.valid('json');
                const result = await queryUserByUsername(username);
                if (!isNil(result))
                    return c.json({ result: false, message: '用户名已被使用' }, 200);
                return c.json({ result: true, message: '用户名可以使用' }, 200);
            } catch (error: any) {
                return c.json(createErrorResult('用户名检测失败', error), 500);
            }
        },
    )
    .post(
        '/check/email-unique',
        describeRoute({
            tags: userTags,
            summary: '检测用户邮箱的唯一性',
            description: '检测用户邮箱的唯一性',
            responses: {
                ...createValidatorErrorResponse(),
                ...createSuccessResponse(successMessageWithResultSchema),
                ...createServerErrorResponse('服务器错误'),
            },
        }),
        zValidator('json', checkEmailUniqueSchema, defaultValidatorErrorHandler),
        async (c) => {
            try {
                const { email } = c.req.valid('json');
                const result = await queryUserByEmail(email);
                if (!isNil(result))
                    return c.json({ result: false, message: '邮箱地址已被使用' }, 200);
                return c.json({ result: true, message: '邮箱地址可以使用' }, 200);
            } catch (error: any) {
                return c.json(createErrorResult('邮箱地址检测失败', error), 500);
            }
        },
    );
// 更新用户信息
// .put(
//     '/update',
//     describeRoute({
//         tags: userTags,
//         summary: '更新用户信息',
//         description: '更新当前登录用户的信息',
//         responses: {
//             ...createSuccessResponse(userSchema),
//             ...createValidatorErrorResponse(),
//             ...createServerErrorResponse('更新用户信息失败'),
//         },
//     }),
//     zValidator('json', updateUserRequestSchema, defaultValidatorErrorHandler),
//     async (c) => {
//         try {
//             const updateData = c.req.valid('json');

//             const updatedUser = await updateUserInfo(c.req.raw, updateData);

//             return c.json(updatedUser, 200);
//         } catch (error: any) {
//             return c.json(createErrorResult('更新用户信息失败', error), 500);
//         }
//     },
// );
