import type { Metadata } from 'next';
import type { FC, PropsWithChildren } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '3R教室TS全栈课线上演示',
    description:
        '3R教室 - 提供最好的typescript、react、node.js、next.js、hono.js、nestjs等全栈开发相关课程',
};

const AppLayout: FC<PropsWithChildren> = ({ children }) => (
    <div className="min-h-screen w-full flex p-0 m-0 flex-col justify-between bg-stone-200/80 dark:bg-zinc-900/60">
        {children}
    </div>
);
export default AppLayout;
