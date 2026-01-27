'use client';

import type { PictureBookThemeProps } from '../pageApi';

import { SectionTitle } from '../commonStyle';
import {
    PictureBookThemeAdventureExplorationIcon,
    PictureBookThemeCognitiveLearningIcon,
    PictureBookThemeEmotionalEducationIcon,
    PictureBookThemeFantasyAdventureIcon,
    PictureBookThemeNaturalScienceIcon,
    PictureBookThemeSocialBehaviorIcon,
} from './icon';

// 绘本主题选项数据
const pictureBookThemeOptions = [
    {
        id: '情感教育',
        title: '情感教育',
        icon: <PictureBookThemeEmotionalEducationIcon />,
        desc: '友谊、同情心',
    },
    {
        id: '认知学习',
        title: '认知学习',
        icon: <PictureBookThemeCognitiveLearningIcon />,
        desc: '数字、颜色、动物',
    },
    {
        id: '社会行为',
        title: '社会行为',
        icon: <PictureBookThemeSocialBehaviorIcon />,
        desc: '分享、礼貌、规则',
    },
    {
        id: '自然科学',
        title: '自然科学',
        icon: <PictureBookThemeNaturalScienceIcon />,
        desc: '天气、太空、植物',
    },
    {
        id: '奇幻冒险',
        title: '奇幻冒险',
        icon: <PictureBookThemeFantasyAdventureIcon />,
        desc: '想象力、探索',
    },
    {
        id: '冒险探索',
        title: '冒险探索',
        icon: <PictureBookThemeAdventureExplorationIcon />,
        desc: '数字、颜色、动物',
    },
];

export default function PictureBookTheme({
    selectedThemes,
    onThemesChange,
}: PictureBookThemeProps) {
    const handleThemeClick = (themeId: string) => {
        if (selectedThemes.includes(themeId)) {
            // 如果已选中，则取消选中
            onThemesChange(selectedThemes.filter((t) => t !== themeId));
        } else {
            // 如果未选中，则添加
            onThemesChange([...selectedThemes, themeId]);
        }
    };

    return (
        <>
            <div className="flex flex-wrap gap-4 mt-4">
                <div>
                    <SectionTitle>📚 绘本主题 * （可多选）</SectionTitle>
                    <div className="grid grid-cols-2 gap-3 mx-10 w-[825px]">
                        {pictureBookThemeOptions.map((option) => {
                            const isSelected = selectedThemes.includes(option.id);
                            return (
                                <div
                                    key={option.id}
                                    onClick={() => handleThemeClick(option.id)}
                                    className={`px-6 py-4 rounded-lg border-2 flex gap-4 cursor-pointer hover:border-pink-300 transition-all ${
                                        isSelected
                                            ? 'border-orange-500 bg-orange-50 scale-105'
                                            : 'border-yellow-200 bg-white'
                                    }`}
                                >
                                    <div>{option.icon}</div>
                                    <div className="flex flex-col items-start">
                                        <div
                                            className={
                                                isSelected ? 'text-orange-600' : 'text-gray-700'
                                            }
                                        >
                                            {option.title}
                                        </div>
                                        <div className="text-xs text-gray-500">{option.desc}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
