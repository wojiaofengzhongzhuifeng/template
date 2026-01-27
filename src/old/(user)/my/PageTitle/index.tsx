import { Arrows, BrowseLibraryIcon, CreationIcon, MyPageIcon } from '@/app/(user)/my/icon';

import {
    CtaPrimaryButton,
    CtaSecondaryButton,
    FeatureChipOrange,
    FeatureChipPink,
    FeatureChipPurple,
    HeroSection,
    HeroSubtitle,
    HeroTitle,
    PageWrapper,
    Section,
} from './style';

export default function PageTitle() {
    return (
        <PageWrapper>
            <HeroSection>
                <MyPageIcon />
                <HeroTitle>创作属于你的</HeroTitle>
                <HeroTitle>神奇绘本故事</HeroTitle>
                <br />
                <br />
                <HeroSubtitle>🎨 让每个孩子都能拥有专属的故事世界</HeroSubtitle>
                <HeroSubtitle>AI 驱动的智能创作，几分钟生成高质量儿童绘本</HeroSubtitle>
            </HeroSection>
            <Section className="mt-10">
                <div className="gap-4 flex justify-center">
                    <CtaPrimaryButton href="/form">
                        <p className="text-white text-base flex items-center gap-2">
                            <CreationIcon />
                            立即开始创作
                            <Arrows />
                        </p>
                    </CtaPrimaryButton>
                    <CtaSecondaryButton>
                        <p className="text-orange-600 text-base flex items-center gap-3">
                            <BrowseLibraryIcon />
                            浏览我的图书馆
                        </p>
                    </CtaSecondaryButton>
                </div>
            </Section>
            <Section className="mt-16">
                <div className="flex gap-4 justify-center w-full">
                    <FeatureChipOrange>100% AI智能生成</FeatureChipOrange>
                    <FeatureChipPink>多种插画风格</FeatureChipPink>
                    <FeatureChipPurple>专业分页编辑</FeatureChipPurple>
                </div>
            </Section>
        </PageWrapper>
    );
}
