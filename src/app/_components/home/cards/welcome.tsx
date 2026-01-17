'use client';
import type { FC } from 'react';

import Link from 'next/link';

import { RainbowButton } from '../../magicui/rainbow-button';
import { TextAnimate } from '../../text/animate';
import { SparklesText } from '../../text/sparkles';
import $styles from './welcome.module.css';

export interface HomeWelcomeCardType {
    title: string;
    colorTitle?: string;
    content: string;
}
type Props = HomeWelcomeCardType;

export const HomeWelcomeCard: FC<Props> = ({ title, colorTitle, content }) => {
    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-center text-3xl lg:justify-start lg:text-left lg:text-5xl">
                {title}
                <SparklesText
                    as={
                        <span>
                            {colorTitle && <span className={$styles.colorTitle}>{colorTitle}</span>}
                        </span>
                    }
                />
            </div>
            <div className="mt-5 flex-auto py-3 font-lxgw text-xl leading-8! lg:pr-16">
                <TextAnimate animation="blurInUp" by="line" once delay={0.8}>
                    {content}
                </TextAnimate>
            </div>
            <div className="flex w-full items-center justify-center py-3 lg:justify-start lg:py-1">
                <RainbowButton>
                    <Link href="https://3rcd.com/classroom/" target="_blank">
                        点此购买课程🤝
                    </Link>
                </RainbowButton>
            </div>
        </div>
    );
};
