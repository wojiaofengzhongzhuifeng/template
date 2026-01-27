import {
    CreatePictureNumber1,
    CreatePictureNumber2,
    CreatePictureNumber3,
} from '@/app/(user)/my/icon';

import { CreatePictureCard, HeroSection, PageWrapper, Section } from './style';

export default function CreatePicture() {
    return (
        <PageWrapper>
            <Section className="mt-16">
                <div className="flex gap-4 justify-center w-full">
                    <HeroSection>
                        <div className="text-[48px] text-purple-600 mb-4">三步创作你的绘本</div>
                        <div className="text-2xl text-gray-600 mb-16">
                            简单快捷的创作流程，几分钟完成专业绘本
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                            {/* 卡片 1：AI 智能生成 */}

                            <CreatePictureCard bgClass="bg-white" borderClass="border-orange-200">
                                <div className="flex justify-center w-full">
                                    <CreatePictureNumber1 />
                                </div>
                                <div className="text-2xl text-orange-600 flex mb-5 justify-center">
                                    填写创作信息
                                </div>
                                <div className="text-sm text-gray-600 flex-item justify-center">
                                    选择年龄段、插画风格、故事主题，输入故事概述和中心思想
                                </div>
                                <div className="flex justify-center w-full mt-5">
                                    <div className="flex items-center justify-center text-center w-12 h-12 rounded-full text-3xl">
                                        🖊
                                    </div>
                                </div>
                            </CreatePictureCard>

                            {/* 卡片 2：多样插画风格 */}
                            <CreatePictureCard bgClass="bg-white" borderClass="border-pink-200">
                                <div className="flex justify-center w-full">
                                    <CreatePictureNumber2 />
                                </div>
                                <div className="text-2xl text-pink-600 flex mb-5 justify-center">
                                    AI 生成绘本
                                </div>
                                <div className="text-sm text-gray-600 flex-item justify-center">
                                    点击生成按钮，AI智能创作完整故事和精美插图，自动保存到图书馆
                                </div>
                                <div className="flex justify-center w-full mt-5">
                                    <div className="flex items-center justify-center text-center w-12 h-12 rounded-full text-3xl">
                                        ✨
                                    </div>
                                </div>
                            </CreatePictureCard>

                            {/* 卡片 3：专业编辑器 */}
                            <CreatePictureCard bgClass="bg-white" borderClass="border-purple-200">
                                <div className="flex justify-center w-full">
                                    <CreatePictureNumber3 />
                                </div>
                                <div className="text-2xl text-purple-600 flex mb-5 justify-center">
                                    编辑和分享
                                </div>
                                <div className="text-sm text-gray-600 flex-item justify-center">
                                    使用专业编辑器修改内容，完善细节，然后在阅读器中欣赏你的作品
                                </div>
                                <div className="flex justify-center w-full mt-5">
                                    <div className="flex items-center justify-center text-center w-12 h-12 rounded-full text-3xl">
                                        🎉
                                    </div>
                                </div>
                            </CreatePictureCard>
                        </div>
                    </HeroSection>
                </div>
            </Section>
        </PageWrapper>
    );
}
