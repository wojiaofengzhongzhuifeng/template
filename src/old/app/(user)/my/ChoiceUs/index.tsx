import {
    ChoiceUsEasyIcon,
    ChoiceUsFlashIcon,
    ChoiceUsQualityIcon,
    ChoiceUsSafeIcon,
} from '@/app/(user)/my/icon';

import { ChoiceUsCard, HeroSection, PageWrapper, Section } from './style';

export default function ChoiceUs() {
    return (
        <PageWrapper>
            <Section className="mt-16 ">
                <div className="flex gap-4 justify-center w-full ">
                    <HeroSection>
                        <div className="text-[48px] text-pink-600 mb-4">为什么选择我们</div>
                        <div className="text-2xl text-gray-600 mb-16">
                            专业、安全、有趣的儿童绘本创作平台
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4  items-stretch gap-32">
                            {/* 卡片 1：快速生成 */}
                            <ChoiceUsCard bgClass="bg-yellow-50" borderClass="border-yellow-200">
                                <div className="flex flex-col justify-between h-full">
                                    <div className="flex justify-center w-full">
                                        <ChoiceUsFlashIcon />
                                    </div>
                                    <div className="text-xl text-orange-600 flex  justify-center mt-2">
                                        快速生成
                                    </div>
                                    <div className="text-sm text-gray-600 flex-item justify-center mt-2 mb-2">
                                        几分钟完成专业绘本创作
                                    </div>
                                </div>
                            </ChoiceUsCard>

                            {/* 卡片 2：儿童友好 */}
                            <ChoiceUsCard bgClass="bg-pink-50" borderClass="border-pink-200">
                                <div className="flex flex-col justify-between h-full">
                                    <div className="flex justify-center w-full">
                                        <ChoiceUsSafeIcon />
                                    </div>
                                    <div className="text-xl text-pink-600 flex  justify-center mt-2">
                                        儿童友好
                                    </div>
                                    <div className="text-sm text-gray-600 flex-item justify-center mt-2 mb-2">
                                        适合0-8岁各年龄段
                                    </div>
                                </div>
                            </ChoiceUsCard>

                            {/* 卡片 3：高质量内容 */}
                            <ChoiceUsCard bgClass="bg-purple-50" borderClass="border-purple-200">
                                <div className="flex flex-col justify-between h-full">
                                    <div className="flex justify-center w-full">
                                        <ChoiceUsQualityIcon />
                                    </div>
                                    <div className="text-xl text-purple-600 flex  justify-center mt-2">
                                        高质量内容
                                    </div>
                                    <div className="text-sm text-gray-600 flex-item justify-center mt-2 mb-2">
                                        专业AI生成故事和插图
                                    </div>
                                </div>
                            </ChoiceUsCard>

                            {/* 卡片 4：简单易用 */}
                            <ChoiceUsCard bgClass="bg-blue-50" borderClass="border-blue-200">
                                <div className="flex flex-col justify-between h-full">
                                    <div className="flex justify-center w-full">
                                        <ChoiceUsEasyIcon />
                                    </div>
                                    <div className="text-xl text-blue-600 flex  justify-center mt-2">
                                        简单易用
                                    </div>
                                    <div className="text-sm text-gray-600 flex-item justify-center mt-2 mb-2">
                                        无需专业技能即可创作
                                    </div>
                                </div>
                            </ChoiceUsCard>
                        </div>
                    </HeroSection>
                </div>
            </Section>
        </PageWrapper>
    );
}
