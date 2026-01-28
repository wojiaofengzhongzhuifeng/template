'use client';

import {
  FormTitle,
  FormSubtitle,
  SectionTitle,
  OptionGroup,
  OptionCard,
  OptionTitle,
  OptionDesc,
} from './style';
import { ChildhoodAgeProps } from '../pageApi';

// 年龄选项数据
const ageOptions = [
  { id: '0-3', title: '0-3岁(婴儿期)', desc: '感官、简单词汇' },
  { id: '3-6', title: '3-6岁(学龄前)', desc: '简单故事、认知' },
  { id: '6-12', title: '6-12岁(小学低年级)', desc: '复杂情节、道理' },
];

export default function CreateNewBookForm({
  selectedAge,
  onAgeChange,
}: ChildhoodAgeProps) {
  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div>
          <FormTitle>创建您的专属绘本 ✨</FormTitle>
          <FormSubtitle>
            填写以下信息,让 AI 为您生成个性化的儿童绘本
          </FormSubtitle>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mt-4">
        <div>
          <SectionTitle>🎂儿童年龄</SectionTitle>
          <OptionGroup>
            {ageOptions.map((option) => (
              <OptionCard
                key={option.id}
                selected={selectedAge === option.id}
                onClick={() => onAgeChange(option.id)}
              >
                <OptionTitle selected={selectedAge === option.id}>
                  {option.title}
                </OptionTitle>
                <OptionDesc>{option.desc}</OptionDesc>
              </OptionCard>
            ))}
          </OptionGroup>
        </div>
      </div>
    </>
  );
}
