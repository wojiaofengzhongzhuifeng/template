'use client';

import { useState } from 'react';

import {
    createCount,
    deleteCount,
    updateCount,
    useGetCountList,
} from '@/app/(pages)/count-number/api/count';
import { useCountStore } from '@/app/(pages)/count-number/store/count';
import Header from '@/components/header';

export default function CountNumberPage() {
    const { refresh } = useGetCountList();
    const { counts } = useCountStore();
    const [error, setError] = useState<string | null>(null);
    const [newNumber, setNewNumber] = useState(0);
    const [isPublic, setIsPublic] = useState(false);

    const handleCreate = async () => {
        try {
            await createCount({ number: newNumber, isPublic });
            setNewNumber(0);
            setIsPublic(false);
            refresh();
        } catch (err: any) {
            setError(err.message || '创建失败');
        }
    };

    const handleIncrement = async (id: string, currentNumber: number) => {
        try {
            await updateCount(id, { number: currentNumber + 1 });
            refresh();
        } catch (err: any) {
            setError(err.message || '更新失败');
        }
    };

    const handleDecrement = async (id: string, currentNumber: number) => {
        try {
            await updateCount(id, { number: currentNumber - 1 });
            refresh();
        } catch (err: any) {
            setError(err.message || '更新失败');
        }
    };

    const handleTogglePublic = async (id: string, currentIsPublic: boolean) => {
        try {
            await updateCount(id, { isPublic: !currentIsPublic });
            refresh();
        } catch (err: any) {
            setError(err.message || '更新状态失败');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCount(id);
            refresh();
        } catch (err: any) {
            setError(err.message || '删除失败');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800">
            <Header />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6">
                        {error}
                        <button onClick={() => setError(null)} className="float-right font-bold">
                            ×
                        </button>
                    </div>
                )}

                <div className="bg-zinc-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-700/50 p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-white">创建新计数器</h2>
                    <div className="flex gap-4 items-center">
                        <input
                            type="number"
                            value={newNumber}
                            onChange={(e) => setNewNumber(Number(e.target.value))}
                            className="bg-zinc-700/50 border border-zinc-600 rounded-lg px-3 py-2 w-32 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="初始值"
                        />
                        <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            公开
                        </label>
                        <button
                            onClick={handleCreate}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            创建
                        </button>
                    </div>
                </div>

                <div className="bg-zinc-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-700/50">
                    <h2 className="text-lg font-semibold p-6 border-b border-zinc-700/50 text-white">
                        计数器列表
                    </h2>
                    {counts === null ? (
                        <div className="p-6 text-center text-zinc-400">加载中...</div>
                    ) : counts === undefined ? (
                        <div className="p-6 text-center text-red-400">加载失败，请刷新重试</div>
                    ) : counts.length === 0 ? (
                        <div className="p-6 text-center text-zinc-400">暂无数据</div>
                    ) : (
                        <ul className="divide-y divide-zinc-700/50">
                            {counts.map((count) => (
                                <li
                                    key={count.id}
                                    className="p-6 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl font-bold text-white w-16 text-center">
                                            {count.number}
                                        </span>
                                        <div className="flex flex-col text-sm text-zinc-400">
                                            <span>ID: {count.id.slice(0, 8)}...</span>
                                            <span
                                                className={
                                                    count.isPublic
                                                        ? 'text-green-400'
                                                        : 'text-zinc-500'
                                                }
                                            >
                                                {count.isPublic ? '公开' : '私有'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDecrement(count.id, count.number)}
                                            className="bg-zinc-700 text-zinc-300 px-3 py-1 rounded-lg hover:bg-zinc-600 transition-colors"
                                        >
                                            -1
                                        </button>
                                        <button
                                            onClick={() => handleIncrement(count.id, count.number)}
                                            className="bg-zinc-700 text-zinc-300 px-3 py-1 rounded-lg hover:bg-zinc-600 transition-colors"
                                        >
                                            +1
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleTogglePublic(count.id, count.isPublic)
                                            }
                                            className={`px-3 py-1 rounded-lg transition-colors ${
                                                count.isPublic
                                                    ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                            }`}
                                        >
                                            {count.isPublic ? '设为私有' : '设为公开'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(count.id)}
                                            className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
