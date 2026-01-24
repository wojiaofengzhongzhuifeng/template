'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authApi } from '@/api/auth';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '', // TODO: 临时使用默认邮箱，待配置 SMTP 后恢复
        password: '',
        confirmPassword: '',
        otp: '', // TODO: 临时跳过验证码，待配置 SMTP 后恢复
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 提交注册
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        if (formData.password.length < 8) {
            setError('密码长度至少 8 位');
            return;
        }

        setLoading(true);

        try {
            // TODO: 临时生成邮箱，待配置 SMTP 后恢复邮箱输入
            const tempEmail = `${formData.username}@temp.local`;
            const response = await authApi.signUp({
                username: formData.username,
                email: tempEmail,
                password: formData.password,
                otp: '000000', // 临时验证码
                validateType: 'email',
            });

            if (response.ok) {
                router.push('/auth/login?registered=true');
            } else {
                setError('注册失败，请检查输入信息');
            }
        } catch {
            setError('注册失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 p-4">
            <div className="w-full max-w-md">
                <div className="bg-zinc-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-700/50 p-8">
                    {/* Logo / Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">创建账户</h1>
                        <p className="text-zinc-400">注册一个新账户</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-zinc-300 mb-2"
                            >
                                用户名
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="请输入用户名"
                                required
                            />
                        </div>

                        {/* TODO: 临时隐藏邮箱和验证码输入，待配置 SMTP 后恢复 */}

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-zinc-300 mb-2"
                            >
                                密码
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="请输入密码（至少8位）"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-zinc-300 mb-2"
                            >
                                确认密码
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="请再次输入密码"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-lg hover:from-green-500 hover:to-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? '注册中...' : '注册'}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center">
                        <p className="text-zinc-400">
                            已有账户？{' '}
                            <Link
                                href="/auth/login"
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                立即登录
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
