import type { FC } from 'react';

import { Skeleton } from '../shadcn/ui/skeleton';
import { HomeContainer } from './container';
const OneBlock: FC = () => (
    <HomeContainer
        containerClass="h-full w-full flex-auto items-stretch!"
        className="items-stretch!"
    >
        <div className="flex flex-auto items-stretch!">
            <Skeleton className="flex w-full flex-auto bg-gray-950/30 dark:bg-zinc-500/10 backdrop-blur-sm" />
        </div>
    </HomeContainer>
);
const TwoBlock: FC = () => (
    <HomeContainer
        containerClass="h-full w-full flex-auto items-stretch!"
        className="flex-col items-stretch! space-y-2 md:flex-row md:space-x-3 md:space-y-0"
    >
        <div className="flex flex-auto items-stretch!">
            <Skeleton className="flex  w-full flex-auto bg-gray-950/30 dark:bg-zinc-500/10 backdrop-blur-sm" />
        </div>
        <div className="flex flex-auto items-stretch!">
            <Skeleton className="flex w-full flex-auto bg-gray-950/30 dark:bg-zinc-500/10 backdrop-blur-sm" />
        </div>
    </HomeContainer>
);

export const HomeSeketon: FC = () => (
    <>
        <TwoBlock />
        <OneBlock />
        <TwoBlock />
    </>
);
