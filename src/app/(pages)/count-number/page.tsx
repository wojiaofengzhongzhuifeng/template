'use client';

import { useEffect, useState } from 'react';

import { countApi } from '@/api/count';
import type { CountItem } from '@/server/count/type';

export default function CountNumberPage() {
    const [counts, setCounts] = useState<CountItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newNumber, setNewNumber] = useState(0);

    // 加载列表
    const loadCounts = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await countApi.list();
            if (result.ok) {
                setCounts(result.data);
            } else {
                setError(result.message || '加载失败');
            }
        } catch (err) {
            setError('加载失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCounts();
    }, []);

    // 创建
    const handleCreate = async () => {
        try {
            const result = await countApi.create({ number: newNumber });
            if (result.ok) {
                setNewNumber(0);
                loadCounts();
            } else {
                setError(result.message || '创建失败');
            }
        } catch (err) {
            setError('创建失败');
        }
    };

    // 更新 +1
    const handleIncrement = async (id: string, currentNumber: number) => {
        try {
            const result = await countApi.update(id, { number: currentNumber + 1 });
            if (result.ok) {
                loadCounts();
            } else {
                setError(result.message || '更新失败');
            }
        } catch (err) {
            setError('更新失败');
        }
    };

    // 更新 -1
    const handleDecrement = async (id: string, currentNumber: number) => {
        try {
            const result = await countApi.update(id, { number: currentNumber - 1 });
            if (result.ok) {
                loadCounts();
            } else {
                setError(result.message || '更新失败');
            }
        } catch (err) {
            setError('更新失败');
        }
    };

    // 删除
    const handleDelete = async (id: string) => {
        try {
            const result = await countApi.delete(id);
            if (result.ok) {
                loadCounts();
            } else {
                setError(result.message || '删除失败');
            }
        } catch (err) {
            setError('删除失败');
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                Count 管理
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                    <button onClick={() => setError(null)} className="float-right font-bold">
                        ×
                    </button>
                </div>
            )}

            {/* 创建表单 */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    创建新 Count
                </h2>
                <div className="flex gap-4 items-center">
                    <input
                        type="number"
                        value={newNumber}
                        onChange={(e) => setNewNumber(Number(e.target.value))}
                        className="border rounded px-3 py-2 w-32 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                        placeholder="初始值"
                    />
                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        创建
                    </button>
                </div>
            </div>

            {/* 列表 */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow">
                <h2 className="text-lg font-semibold p-4 border-b dark:border-zinc-700 text-gray-700 dark:text-gray-300">
                    Count 列表
                </h2>
                {loading ? (
                    <div className="p-4 text-center text-gray-500">加载中...</div>
                ) : counts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">暂无数据</div>
                ) : (
                    <ul className="divide-y dark:divide-zinc-700">
                        {counts.map((count) => (
                            <li
                                key={count.id}
                                className="p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-200 w-16 text-center">
                                        {count.number}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ID: {count.id.slice(0, 8)}...
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDecrement(count.id, count.number)}
                                        className="bg-gray-200 dark:bg-zinc-600 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-zinc-500 transition-colors"
                                    >
                                        -1
                                    </button>
                                    <button
                                        onClick={() => handleIncrement(count.id, count.number)}
                                        className="bg-gray-200 dark:bg-zinc-600 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-zinc-500 transition-colors"
                                    >
                                        +1
                                    </button>
                                    <button
                                        onClick={() => handleDelete(count.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                                    >
                                        删除
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 刷新按钮 */}
            <button
                onClick={loadCounts}
                className="mt-4 text-blue-600 hover:underline"
            >
                刷新列表
            </button>
        </div>
    );
}
