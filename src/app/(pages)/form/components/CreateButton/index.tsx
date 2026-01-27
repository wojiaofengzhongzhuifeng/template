'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CreateButtonIcon } from './icons';

export interface CreateButtonProps {
    onSubmit: () => {
        child_age: string | null;
        illustration_style: string | null;
        themes: string[];
        story_overview: string;
        central_idea: string;
    };
}

export default function CreateButton({ onSubmit }: CreateButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        const formData = onSubmit();

        try {
            const payload = encodeURIComponent(JSON.stringify(formData));
            router.push(`/show?payload=${payload}`);
        } catch (err) {
            console.error('创建绘本失败:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center mt-10">
            <button
                onClick={handleCreate}
                disabled={loading}
                className="bg-orange-500 text-white px-14 py-4 rounded-md w-[825px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <CreateButtonIcon />
                {loading ? '生成中...' : '生成我的绘本'}
                <CreateButtonIcon />
            </button>
        </div>
    );
}
