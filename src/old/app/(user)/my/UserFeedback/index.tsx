import { Section, HeroSection, UserFeedbackCard, PageWrapper } from './style';
import {
  UserFeedbackHeadIcon,
  UserFeedbackStarIcon,
} from '@/app/(user)/my/icon';
export default function UserFeedback() {
  return (
    <PageWrapper>
      <Section className="mt-16">
        <div className="flex gap-4 justify-center w-full">
          <HeroSection>
            <div className="text-[48px] text-orange-600 mb-4">用户反馈</div>
            <div className="text-2xl text-gray-600 mb-16">
              看看家长和老师们怎么说
            </div>
          </HeroSection>
        </div>

        <div className="flex gap-8 justify-center w-full">
          <UserFeedbackCard bgClass="bg-white" borderClass="border-orange-200">
            <div className=" text-gray-600 flex mb-5">
              <UserFeedbackHeadIcon />

              <div className="text-start ml-4">
                <div className="text-orange-600">李老师</div>
                <div className="text-gray-400 text-sm">幼儿园教师</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1 ">
              <UserFeedbackStarIcon />
              <UserFeedbackStarIcon />
              <UserFeedbackStarIcon />
              <UserFeedbackStarIcon />
              <UserFeedbackStarIcon />
            </div>
            <div className="flex mt-5 flex-item text-start">
              "太棒了！我用它为班级的每个孩子创作了个性化的故事，孩子们都超级喜欢！"
            </div>
          </UserFeedbackCard>

          <UserFeedbackCard bgClass="bg-white" borderClass="border-pink-200">
            <div className=" text-pink-600 flex mb-5">
              <UserFeedbackHeadIcon />

              <div className="text-start ml-4">
                <div className="text-pink-600">王女士</div>
                <div className="text-gray-400 text-sm">两个孩子的妈妈</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1 ">
              <UserFeedbackStarIcon />
              <UserFeedbackStarIcon />
              <UserFeedbackStarIcon />
              <UserFeedbackStarIcon />
              <UserFeedbackStarIcon />
            </div>
            <div className="flex mt-5 flex-item text-start">
              "操作简单，生成速度快，插图质量很高。孩子每晚都要我用这个给她讲新故事！"
            </div>
          </UserFeedbackCard>
          <UserFeedbackCard bgClass="bg-white" borderClass="border-orange-200">
            <div className=" text-gray-600 flex mb-5">
              <UserFeedbackHeadIcon />

              <div className="text-start ml-4">
                <div className="text-purple-600">张先生</div>
                <div className="text-gray-400 text-sm">内容创作者</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1 ">
              <UserFeedbackStarIcon />
              <UserFeedbackStarIcon />
              <UserFeedbackStarIcon />
              <UserFeedbackStarIcon />
              <UserFeedbackStarIcon />
            </div>
            <div className="flex mt-5 flex-item text-start">
              "作为内容创作者，这个工具大大提高了我的效率。编辑功能很专业，非常实用！"
            </div>
          </UserFeedbackCard>
        </div>
      </Section>
    </PageWrapper>
  );
}
