import type { FC } from 'react';

import { Suspense } from 'react';

import { homeConfig } from '@/config/home';

import { FadeInMotion } from '../motion/fadeIn';
import { TypedText } from '../text/typed';
// import { FadeInMotion } from '../motion/fadeIn';
// import { TypedText } from '../text/typed';
import { HomeBackground } from './background';
import { HomeListCard } from './cards/list';
import { HomeVideoCard } from './cards/video';
import { HomeWelcomeCard } from './cards/welcome';
import { HomeBlock, HomeContainer } from './container';
import { HomeSeketon } from './skeleton';
import $styles from './style.module.css';
import { HomeTimeline } from './timeline';
const { welcome, video, list, typed, timeline } = homeConfig;
export const Home: FC = () => (
    <>
        <HomeBackground />
        <Suspense fallback={<HomeSeketon />}>
            <div className={$styles.home}>
                {(welcome || video) && (
                    <HomeContainer>
                        {welcome && (
                            <HomeBlock>
                                <FadeInMotion>
                                    <HomeWelcomeCard {...welcome} />
                                </FadeInMotion>
                            </HomeBlock>
                        )}
                        {video && (
                            <HomeBlock>
                                <FadeInMotion className="flex h-auto w-full" side="top-right">
                                    <HomeVideoCard {...video} />
                                </FadeInMotion>
                            </HomeBlock>
                        )}
                    </HomeContainer>
                )}
                {typed && (
                    <HomeContainer className="items-center justify-center space-y-2 md:flex-col">
                        <TypedText
                            className="flex w-full items-center justify-center font-lxgw text-xl"
                            data={typed}
                        />
                    </HomeContainer>
                )}
                {list && (
                    <HomeContainer>
                        <HomeBlock className="lg:px-5">
                            <FadeInMotion className="h-full w-full" side="left">
                                <HomeListCard {...list.first} />
                            </FadeInMotion>
                        </HomeBlock>
                        <HomeBlock className="lg:px-5">
                            <FadeInMotion className="h-full w-full" side="right">
                                <HomeListCard {...list.second} />
                            </FadeInMotion>
                        </HomeBlock>
                    </HomeContainer>
                )}
                {timeline && (
                    <HomeContainer>
                        <div className="h-full w-full">
                            <HomeTimeline data={timeline} />
                        </div>
                    </HomeContainer>
                )}
            </div>
        </Suspense>
    </>
);
