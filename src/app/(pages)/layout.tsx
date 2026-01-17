import type { Metadata } from 'next';
import type { FC, PropsWithChildren, ReactNode } from 'react';

import { Auth } from '../_components/auth';
import { Footer } from '../_components/layout/footer';
import { Header } from '../_components/layout/header';
import { Toaster } from '../_components/shadcn/ui/sonner';
import Theme from '../_components/theme';
import $styles from './layout.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '3R教室TS全栈课线上演示',
    description:
        '3R教室 - 提供最好的typescript、react、node.js、next.js、hono.js、nestjs等全栈开发相关课程',
};

const AppLayout: FC<PropsWithChildren<{ modal: ReactNode }>> = ({ children, modal }) => (
    <Theme>
        <Auth>
            <div className={$styles.layout}>
                <Header />
                {children}
                <Footer />
            </div>
            {modal}
            <Toaster />
        </Auth>
    </Theme>
);
export default AppLayout;
