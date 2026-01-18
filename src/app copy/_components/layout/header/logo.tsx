'use client';
import type { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import { cn } from '@/app/_components/shadcn/utils';

import { useThemeColor } from '../../theme/hooks';
import LogoDark from './logo-dark.png';
import LogoLight from './logo-light.png';
import $styles from './logo.module.css';

export const HeaderLogo: FC = () => {
    const themeColor = useThemeColor();
    const logo = useMemo(() => (themeColor === 'dark' ? LogoDark : LogoLight), [themeColor]);
    return (
        <div className={cn($styles.logo)}>
            <Link href="/">
                <Image
                    src={logo}
                    alt="logo"
                    sizes="100vw"
                    style={{
                        width: '100%',
                        height: 'auto',
                    }}
                />
            </Link>
        </div>
    );
};
