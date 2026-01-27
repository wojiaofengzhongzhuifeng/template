import { useState } from 'react';

import { beautifyStory } from '../../api/beautify-story';
import { StoryOverviewIcon } from './icons';
import { OptionGroup, SectionTitle } from './style';

export interface StoryOverviewProps {
    value: string;
    onChange: (value: string) => void;
    childAge?: string | null;
    themes?: string[];
}

export default function StoryOverview({ value, onChange, childAge, themes }: StoryOverviewProps) {
    const [isBeautifying, setIsBeautifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBeautify = async () => {
        if (!value || value.trim() === '') {
            setError('请先输入故事概述');
            return;
        }

        setIsBeautifying(true);
        setError(null);

        try {
            const result = await beautifyStory({
                storyOverview: value,
                childAge: childAge || undefined,
                themes,
            });

            if (result.success && result.beautifiedStory) {
                onChange(result.beautifiedStory);
            } else {
                throw new Error('未获取到美化后的内容');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '美化失败，请重试';
            setError(errorMessage);
        } finally {
            setIsBeautifying(false);
        }
    };

    return (
        <>
            <div className="flex flex-wrap gap-4 mt-4">
                <div>
                    <SectionTitle>
                        <div className="flex justify-between w-full">
                            <div>✍️ 故事概述 *</div>
                            <button
                                onClick={handleBeautify}
                                disabled={isBeautifying || !value || value.trim() === ''}
                                className={`text-sm text-white px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                                    isBeautifying || !value || value.trim() === ''
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-purple-300 hover:bg-purple-400 cursor-pointer'
                                }`}
                            >
                                <StoryOverviewIcon />
                                {isBeautifying ? '美化中...' : 'AI美化'}
                            </button>
                        </div>
                    </SectionTitle>
                    <OptionGroup>
                        <textarea
                            className="w-[825px] mx-0 px-4 py-4 rounded-lg border-2 border-yellow-200 hover:border-pink-300 min-h-[120px] text-left align-top resize-none box-border block"
                            value={value}
                            onChange={(e) => {
                                onChange(e.target.value);
                                setError(null);
                            }}
                            placeholder="请简要描述您想要的故事情节，例如：一只小兔子学会分享玩具的故事..."
                            rows={1}
                        ></textarea>
                    </OptionGroup>
                    {error && <div className="text-red-500 text-sm mt-2 mx-10">{error}</div>}
                </div>
            </div>
        </>
    );
}
