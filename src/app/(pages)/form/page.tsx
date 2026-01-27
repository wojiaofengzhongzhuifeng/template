'use client';

import { useState } from 'react';

import type { FormData } from './types';

import { FormCard, PageWrapper } from './commonStyle';
import ChildhoodAge from './components/ChildhoodAge';
import CreateButton from './components/CreateButton';
import MainIdea from './components/MainIdea';
import PictureBookTheme from './components/PictureBookTheme';
import PictureStyle from './components/PictureStyle';
import StoryOverview from './components/StoryOverview';
import { ageMap, styleMap, themeMap } from './types';

export default function FormPage() {
    const [selectedAge, setSelectedAge] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    const [storyOverview, setStoryOverview] = useState<string>('');
    const [centralIdea, setCentralIdea] = useState<string>('');

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
                    <ChildhoodAge selectedAge={selectedAge} onAgeChange={setSelectedAge} />
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
