import { PageFooterIcon } from '../icon';
import {
    PageFooterItem,
    PageFooterSubtitle,
    PageFooterTitle,
    PageFooterWrapper,
    Section,
} from './style';

export default function PageFooter() {
    return (
        <PageFooterWrapper>
            <Section>
                <PageFooterTitle>
                    <PageFooterIcon />
                    儿童绘本创作平台
                </PageFooterTitle>
                <PageFooterItem>让每个孩子都能拥有属于自己的故事世界</PageFooterItem>
            </Section>

            <div className="mt-10 text-center border-t border-gray-300/20 w-full max-w-[1152px] mx-auto pt-6">
                <PageFooterSubtitle>
                    © 2024 儿童绘本创作平台. AI 驱动的个性化绘本生成工具
                </PageFooterSubtitle>
            </div>
        </PageFooterWrapper>
    );
}
