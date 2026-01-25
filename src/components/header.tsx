'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { authApi } from '@/api/auth';
import { useAuth } from '@/hooks/use-auth';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, refresh } = useAuth();
    const [logoutLoading, setLogoutLoading] = useState(false);

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await authApi.signOut({
                onSuccess: () => {
                    router.push('/');
                    router.refresh();
                    refresh();
                },
            });
        } catch {
            console.error('登出失败');
        } finally {
            setLogoutLoading(false);
        }
    };

    const getTitle = () => {
        if (pathname === '/count-number') return '我的计数器';
        return '计数器应用';
    };

    console.log('Header render:', { pathname, user, loading });

    return (
        <nav className="bg-zinc-800/50 backdrop-blur-xl border-b border-zinc-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-xl font-bold text-white">{getTitle()}</h1>
                    <div className="flex items-center gap-4">
                        {loading ? (
                            <span className="text-zinc-400">加载中...</span>
                        ) : user ? (
                            <>
                                <span className="text-zinc-300">欢迎, {user.username}</span>
                                <Link
                                    href="/count-number"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    我的计数器
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    disabled={logoutLoading}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {logoutLoading ? '登出中...' : '登出'}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-zinc-300 hover:text-white transition-colors"
                                >
                                    登录
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    注册
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
