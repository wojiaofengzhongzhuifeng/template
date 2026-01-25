'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { authApi } from '@/api/auth';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const registered = searchParams.get('registered') === 'true';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login form submitted', { username, callbackUrl });
        setError(null);
        setLoading(true);

        try {
            const result = await authApi.signIn(
                { username, password },
                {
                    callbackURL: callbackUrl,
                    onSuccess: (ctx?: any) => {
                        console.log('Login success:', ctx);
                        setError(null);
                        setLoading(false);
                        router.push(callbackUrl);
                        router.refresh();
                    },
                    onError: (err) => {
                        console.error('Login error:', err);
                        setError(err?.message || '登录失败，请检查用户名和密码');
                        setLoading(false);
                    },
                },
            );
            console.log('Login result:', result);
        } catch (error) {
            console.error('Login catch error:', error);
            setError('登录失败，请稍后重试');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 p-4">
            <div className="w-full max-w-md">
                <div className="bg-zinc-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-700/50 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">欢迎回来</h1>
                        <p className="text-zinc-400">登录您的账户</p>
                    </div>

                    {registered && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6">
                            注册成功，请登录
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-zinc-300 mb-2"
                            >
                                用户名 / 邮箱
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="请输入用户名或邮箱"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-zinc-300 mb-2"
                            >
                                密码
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="请输入密码"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? '登录中...' : '登录'}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-zinc-400">
                            还没有账户？{' '}
                            <Link
                                href="/auth/register"
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                立即注册
                            </Link>
                        </p>
                        <p className="text-zinc-400">
                            <Link
                                href="/"
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                返回首页
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
