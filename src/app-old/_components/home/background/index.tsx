import type { FC } from 'react';

import { MouseMoveEffect } from './mouse-move-effect';

export const HomeBackground: FC = () => (
    <>
        <div className="pointer-events-none fixed inset-0">
            <div className="absolute right-0 top-0 h-[30rem] w-[30rem] bg-orange-500/10 blur-[100px]" />
            <div className="absolute bottom-0 left-0 h-[30rem] w-[30rem] bg-blue-500/10 blur-[100px]" />
        </div>
        <MouseMoveEffect />
    </>
);
