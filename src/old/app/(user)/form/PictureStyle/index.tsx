'use client';

import {
  OptionCard,
  OptionGroup,
  OptionTitle,
  SectionTitle,
} from '../commonStyle';
import {
  PictureStyle3DClayIcon,
  PictureStyleCartoonIcon,
  PictureStyleCuttingIcon,
  PictureStylePencilIcon,
  PictureStyleWatercolourIcon,
} from './icon';
import { PictureStyleProps } from '../pageApi';

// 图片风格选项数据
const pictureStyleOptions = [
  {
    id: '水彩/墨水画',
    title: '水彩/墨水画',
    icon: <PictureStyleWatercolourIcon />,
  },
  { id: '蜡笔/涂鸦', title: '蜡笔/涂鸦', icon: <PictureStylePencilIcon /> },
  {
    id: '卡通/扁平化',
    title: '卡通/扁平化',
    icon: <PictureStyleCartoonIcon />,
  },
  {
    id: '3D粘土动画',
    title: '3D粘土动画',
    icon: <PictureStyle3DClayIcon />,
  },
  { id: '剪纸拼贴', title: '剪纸拼贴', icon: <PictureStyleCuttingIcon /> },
];

export default function PictureStyle({
  selectedStyle,
  onStyleChange,
}: PictureStyleProps) {
  return (
    <>
      <div className="flex flex-wrap gap-4 mt-4">
        <div>
          <SectionTitle>🎨 插画风格 *</SectionTitle>
          <OptionGroup>
            {pictureStyleOptions.map((option) => (
              <OptionCard
                key={option.id}
                selected={selectedStyle === option.id}
                onClick={() => onStyleChange(option.id)}
              >
                <OptionTitle selected={selectedStyle === option.id}>
                  <div className="flex flex-col items-center gap-2 mx-7">
                    {option.icon}
                    <div className="text-xs">{option.title}</div>
                  </div>
                </OptionTitle>
              </OptionCard>
            ))}
          </OptionGroup>
        </div>
      </div>
    </>
  );
}
