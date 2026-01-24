'use client';

import { useGetPublicCountNumberList } from '@/app/(pages)/(home-page)/api/get-public-count-number';
import { useHomeStore } from '@/app/(pages)/(home-page)/store/home';

export default function HomePage() {
    useGetPublicCountNumberList();
    const { countList } = useHomeStore();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Home Page</h1>

            {countList === undefined && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                    Error: 请求失败，请刷新重试
                </div>
            )}

            {/* Loading state logic: countList is null (initial) */}
            {countList === null && <div>Loading...</div>}
            {countList && (
                <div className="bg-white p-4 rounded border shadow-sm">
                    <h2 className="font-semibold mb-2">Data from Zustand Store:</h2>
                    <pre className="bg-gray-50 p-2 rounded">
                        {JSON.stringify(countList, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
