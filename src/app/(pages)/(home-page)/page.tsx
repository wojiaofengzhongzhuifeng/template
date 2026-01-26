'use client';

import { useGetPublicCountNumberList } from '@/app/(pages)/(home-page)/api/get-public-count-number';
import { useHomeStore } from '@/app/(pages)/(home-page)/store/home';
import Header from '@/components/header';

export default function HomePage() {
    useGetPublicCountNumberList();
    const { countList } = useHomeStore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-zinc-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-700/50 p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">公开计数器列表</h2>

                    {countList === null && (
                        <div className="text-center text-zinc-400">加载中...</div>
                    )}

                    {countList && countList.length === 0 && (
                        <div className="text-center text-zinc-400">暂无公开计数器</div>
                    )}

                    {countList && countList.length > 0 && (
                        <div className="grid gap-4">
                            {countList.map((count) => (
                                <div
                                    key={count.id}
                                    className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600/50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-3xl font-bold text-white">
                                                {count.number}
                                            </span>
                                            <p className="text-zinc-400 text-sm mt-1">
                                                ID: {count.id.slice(0, 8)}...
                                            </p>
                                        </div>
                                        <span className="text-green-400 text-sm">公开</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
