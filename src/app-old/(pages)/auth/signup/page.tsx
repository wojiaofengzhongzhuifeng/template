import type { Metadata, ResolvingMetadata } from 'next';
import type { FC } from 'react';

import { SignUpForm } from '@/app-old/_components/auth/forms/signUp';
import { cn } from '@/app-old/_components/shadcn/utils';

import $styles from './style.module.css';

export const generateMetadata = async (_: any, parent: ResolvingMetadata): Promise<Metadata> => {
    return {
        title: `用户注册 - ${(await parent).title?.absolute}`,
        description: '用户注册页面',
    };
};

const AuthSingupPage: FC = async () => (
    <div className="page-item">
        <div className={cn($styles.item, 'page-container page-block')} style={{ flex: 'none' }}>
            <div className="text-center text-xl font-bold">用户注册</div>
            <SignUpForm />
        </div>
    </div>
);
export default AuthSingupPage;
