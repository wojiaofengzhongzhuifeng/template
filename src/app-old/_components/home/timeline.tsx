import type { FC, JSX } from 'react';

import type { FadeInMotionProps } from '../motion/fadeIn';

import { FadeInMotion } from '../motion/fadeIn';
import {
    Timeline,
    TimelineContent,
    TimelineDot,
    TimelineHeading,
    TimelineItem,
    TimelineLine,
} from '../shadcn/ui/timeline';
export interface HomeTimelineType {
    title: string | JSX.Element;
    content: string | JSX.Element;
}

interface Props {
    data: HomeTimelineType[];
}

const getMotionSide = (side: 'left' | 'right' | null | undefined): FadeInMotionProps['side'] => {
    switch (side) {
        case 'left':
            return 'left';
        case 'right':
            return 'right';
        default:
            return 'none';
    }
};

export const HomeTimeline: FC<Props> = ({ data }) => (
    <Timeline positions="center">
        {data.map((item, index) => (
            <TimelineItem status="done" key={index.toFixed()}>
                <TimelineHeading
                    side={index % 2 === 0 ? 'left' : 'right'}
                    Wrapper={({ children, className, side }) => (
                        <FadeInMotion className={className} side={getMotionSide(side)}>
                            {children}
                        </FadeInMotion>
                    )}
                >
                    {item.title}
                </TimelineHeading>
                <TimelineContent
                    side={index % 2 === 0 ? 'right' : 'left'}
                    Wrapper={({ children, className, side }) => (
                        <FadeInMotion className={className} side={getMotionSide(side)}>
                            {children}
                        </FadeInMotion>
                    )}
                >
                    {item.content}
                </TimelineContent>
                <TimelineDot
                    status="done"
                    Wrapper={({ children, className }) => (
                        <FadeInMotion className={className} side="none">
                            {children}
                        </FadeInMotion>
                    )}
                />
                <TimelineLine
                    done
                    Wrapper={({ children, className }) => (
                        <FadeInMotion className={className} side="none">
                            {children}
                        </FadeInMotion>
                    )}
                />
            </TimelineItem>
        ))}
    </Timeline>
);
