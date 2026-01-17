import type { NextRequest } from 'next/server';

import { isNil } from 'lodash';
import { NextResponse } from 'next/server';

import { authConfig } from '@/config/auth';

import { auth } from './libs/auth';

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff|woff|woff2|ttf|eot|otf|css|scss|sass|less|js|mjs|pdf|doc|docx|txt|md|zip|rar|7z|tar|gz|mp3|mp4|avi|mov|wav|flac)$|sitemap\\.xml|robots\\.txt|manifest\\.json|sw\\.js|workbox-.*\\.js).*)',
    ],
};

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 需要认证的页面路由
    const protectedRoutes = authConfig.protectedPages;
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        return authPageProtectedHandler(request);
    }
    if (pathname.startsWith('/auth/signin')) {
        return authSignInHandler(request);
    }

    if (pathname.startsWith('/auth/signup') || pathname.startsWith('/auth/forget-password')) {
        return AuthenticatedProtectedHandler(request);
    }

    // 默认处理
    return NextResponse.next();
}
// 认证路由处理函数
const authPageProtectedHandler = async (request: NextRequest) => {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const isAuthenticated = !isNil(session?.user);

        if (!isAuthenticated) {
            // 创建登录URL并添加回调参数
            const signinUrl = new URL('/auth/signin', request.url);
            signinUrl.searchParams.set(
                'callbackUrl',
                request.nextUrl.pathname + request.nextUrl.search,
            );
            return NextResponse.redirect(signinUrl);
        }

        // 用户已认证，继续处理请求
        return NextResponse.next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        // 发生错误时也重定向到登录页面，同样添加回调参数
        const signinUrl = new URL('/auth/signin', request.url);
        signinUrl.searchParams.set(
            'callbackUrl',
            request.nextUrl.pathname + request.nextUrl.search,
        );
        return NextResponse.redirect(signinUrl);
    }
};

const authSignInHandler = async (request: NextRequest) => {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const isAuthenticated = !isNil(session?.user);
        const { callbackUrl } = request.nextUrl.searchParams as { callbackUrl?: string };
        if (isAuthenticated) {
            const redirectUrl = new URL(isNil(callbackUrl) ? '/' : callbackUrl, request.url);

            return NextResponse.redirect(redirectUrl);
        }

        // 用户已认证，继续处理请求
        return NextResponse.next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return NextResponse.next();
    }
};

const AuthenticatedProtectedHandler = async (request: NextRequest) => {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const isAuthenticated = !isNil(session?.user);
        const { callbackUrl } = request.nextUrl.searchParams as { callbackUrl?: string };
        if (isAuthenticated) {
            const redirectUrl = new URL(isNil(callbackUrl) ? '/' : callbackUrl, request.url);

            return NextResponse.redirect(redirectUrl);
        }

        // 用户未认证，继续处理请求
        return NextResponse.next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return NextResponse.next();
    }
};
