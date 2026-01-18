'use client';

import type { FC } from 'react';

import { isNil } from 'lodash';
import { List } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { cn } from '@/app/_components/shadcn/utils';
import { useIsMobile, useIsTablet, useScroll } from '@/libs/broswer';

import { Button } from '../../shadcn/ui/button';
import { HeaderLogo } from './logo';
import { MobileHeader } from './mobile';
import { HeaderNav } from './nav';
import $styles from './style.module.css';
import { HeaderTools } from './tools';

export const Header: FC = () => {
    const scrolled = useScroll(50);
    const [mobileOpen, setMobileOpen] = useState(false);
    const toggleMobile = useCallback(() => setMobileOpen(!mobileOpen), [mobileOpen]);
    const mobile = useIsMobile();
    const tablet = useIsTablet();
    // 在平板设备和移动设备的屏下均设为移动设备状态
    const isMobile = useMemo(() => mobile || tablet, [mobile, tablet]);
    useEffect(() => {
        const element = document.querySelector('html');
        if (!isNil(element) && isMobile) {
            if (mobileOpen) element.style.overflow = 'hidden';
            else element.style.removeProperty('overflow');
        }
    }, [mobileOpen, isMobile]);
    return (
        <>
            <header
                className={cn($styles.header, {
                    [$styles['header-scrolled']]: scrolled,
                    [$styles['header-unscrolled']]: !scrolled,
                })}
            >
                <div className={cn($styles.container)}>
                    <div className={$styles.logo}>
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn('btn-icon-transparent', $styles.mobileCollapse)}
                            onClick={toggleMobile}
                        >
                            <List />
                        </Button>
                        <HeaderLogo />
                    </div>
                    <div className={cn('block-container ', $styles.nav)}>
                        <HeaderNav />
                    </div>
                    <div className={$styles.tools}>
                        <HeaderTools isMobile={isMobile} />
                    </div>
                </div>
            </header>
            {isMobile && <MobileHeader open={mobileOpen} setOpen={setMobileOpen} />}
        </>
    );
};
