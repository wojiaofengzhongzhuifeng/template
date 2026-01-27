import { useState } from 'react';

import { generateCentralIdea } from '../../api/generate-central-idea';
import { MainIdeaIcon } from './icons';
import { OptionGroup, SectionTitle } from './style';

export interface MainIdeaProps {
    value: string;
    onChange: (value: string) => void;
    storyOverview?: string;
    childAge?: string | null;
    themes?: string[];
}

export default function MainIdea({
    value,
    onChange,
    storyOverview,
    childAge,
    themes,
}: MainIdeaProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!storyOverview || storyOverview.trim() === '') {
            setError('请先填写故事概述');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const result = await generateCentralIdea({
                centralIdea: value,
                storyOverview,
                childAge: childAge || undefined,
                themes,
            });

            if (result.success && result.centralIdea) {
                onChange(result.centralIdea);
            } else {
                throw new Error('未获取到生成的内容');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '生成失败，请重试';
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const buttonText = value && value.trim() ? 'AI美化' : 'AI生成';

    return (
        <>
            <div className="flex flex-wrap gap-4 mt-4">
                <div>
                    <SectionTitle>
                        <div className="flex justify-between w-full">
                            <div>💡 中心思想 *</div>
                            <button
                                onClick={handleGenerate}
                                disabled={
                                    isGenerating || !storyOverview || storyOverview.trim() === ''
                                }
                                className={`text-sm text-white px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                                    isGenerating || !storyOverview || storyOverview.trim() === ''
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-purple-300 hover:bg-purple-400 cursor-pointer'
                                }`}
                            >
                                <MainIdeaIcon />
                                {isGenerating ? '处理中...' : buttonText}
                            </button>
                        </div>
                    </SectionTitle>
                    <OptionGroup>
                        <textarea
                            className="w-[825px] mx-0 px-4 py-4 rounded-lg border-2 border-yellow-200 hover:border-pink-300 min-h-[60px] text-left align-top resize-none box-border block"
                            value={value}
                            onChange={(e) => {
                                onChange(e.target.value);
                                setError(null);
                            }}
                            placeholder="例如：学会分享、友谊的重要性、勇敢面对困难..."
                            rows={1}
                        ></textarea>
                    </OptionGroup>
                    {error && <div className="text-red-500 text-sm mt-2 mx-10">{error}</div>}
                </div>
            </div>
        </>
    );
}
