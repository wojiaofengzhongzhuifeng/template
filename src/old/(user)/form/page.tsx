'use client';

import { useState } from 'react';

import CreateNewBookForm from '@/app/(user)/form/ChildhoodAge';

import type { FormData } from './pageApi';

import { FormCard, PageWrapper } from './commonStyle';
import CreateButton from './CreateButton';
import MainIdea from './MainIdea';
import { ageMap, styleMap, themeMap } from './pageApi';
import PictureBookTheme from './PictureBookTheme';
import PictureStyle from './PictureStyle';
import StoryOverview from './StoryOverview';

export default function FormPage() {
    const [selectedAge, setSelectedAge] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    const [storyOverview, setStoryOverview] = useState<string>('');
    const [centralIdea, setCentralIdea] = useState<string>('');

    // 生成输出数据
    const getFormData = (): FormData => {
        return {
            child_age: selectedAge ? ageMap[selectedAge] : null,
            illustration_style: selectedStyle ? styleMap[selectedStyle] : null,
            themes: selectedThemes.map((t) => themeMap[t]) as FormData['themes'],
            story_overview: storyOverview,
            central_idea: centralIdea,
        };
    };

    return (
        <>
            <PageWrapper>
                <FormCard>
                    <CreateNewBookForm selectedAge={selectedAge} onAgeChange={setSelectedAge} />
                    <PictureStyle selectedStyle={selectedStyle} onStyleChange={setSelectedStyle} />
                    <PictureBookTheme
                        selectedThemes={selectedThemes}
                        onThemesChange={setSelectedThemes}
                    />
                    <StoryOverview
                        value={storyOverview}
                        onChange={setStoryOverview}
                        childAge={selectedAge ? ageMap[selectedAge] : null}
                        themes={selectedThemes.map((t) => themeMap[t])}
                    />
                    <MainIdea
                        value={centralIdea}
                        onChange={setCentralIdea}
                        storyOverview={storyOverview}
                        childAge={selectedAge ? ageMap[selectedAge] : null}
                        themes={selectedThemes.map((t) => themeMap[t])}
                    />
                    <CreateButton onSubmit={getFormData} />
                </FormCard>
            </PageWrapper>
        </>
    );
}
