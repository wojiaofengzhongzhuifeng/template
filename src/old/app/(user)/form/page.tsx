'use client';

import { useState } from 'react';
import CreateNewBookForm from '@/app/(user)/form/ChildhoodAge';
import { FormCard, PageWrapper } from './commonStyle';
import PictureStyle from './PictureStyle';
import PictureBookTheme from './PictureBookTheme';
import StoryOverview from './StoryOverview';
import MainIdea from './MainIdea';
import CreateButton from './CreateButton';
import { FormData, ageMap, styleMap, themeMap } from './pageApi';

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
          <CreateNewBookForm
            selectedAge={selectedAge}
            onAgeChange={setSelectedAge}
          />
          <PictureStyle
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
          />
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
