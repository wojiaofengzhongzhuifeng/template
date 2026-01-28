import { PageFootIcon, PageFootTickIcon } from '../icon';
import {
    CreatePictureButton,
    CreatePictureSubtitle,
    CreatePictureTitle,
    CreatePictureWrapper,
    Section,
} from './style';

export default function StartCreate() {
    return (
        <CreatePictureWrapper>
            <Section>
                <CreatePictureTitle>准备好开始创作了吗？</CreatePictureTitle>
                <CreatePictureSubtitle>
                    加入数千位家长和教师，为孩子创作独一无二的绘本故事
                </CreatePictureSubtitle>
            </Section>
            <Section className="mt-10">
                <div className="gap-4 flex justify-center">
                    <CreatePictureButton>
                        <p className="text-orange-600 text-base flex items-center gap-2">
                            <PageFootIcon />
                            立即开始创作
                            <PageFootTickIcon />
                        </p>
                    </CreatePictureButton>
                </div>
            </Section>
            <div className="mt-10 text-center">
                <CreatePictureSubtitle>
                    🎁 完全免费使用 · 无需信用卡 · 无限创作
                </CreatePictureSubtitle>
            </div>
        </CreatePictureWrapper>
    );
}
