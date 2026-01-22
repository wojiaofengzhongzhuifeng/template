'use client';

import type { FC, PropsWithChildren } from 'react';

import { isNil } from 'lodash';
import { useEffect, useRef } from 'react';

import type { ThemeOptions } from './constants';
import type { ThemeStoreType } from './types';

import { ThemeContext } from './constants';
import { useSystemTheme, useThemeStore } from './hooks';
import { createThemeStore } from './store';
const ThemeSubscriber: FC<PropsWithChildren> = ({ children }) => {
    const systemTheme = useSystemTheme();
    const store = useThemeStore();
    let unSub: () => void;
    useEffect(() => {
        unSub = store.subscribe(
            (state) => state.mode,
            (m) => {
                const html = document.getElementsByTagName('html');
                if (html.length) {
                    html[0].classList.remove('light');
                    html[0].classList.remove('dark');
                    if (m === 'system') html[0].classList.add(systemTheme);
                    else html[0].classList.add(m === 'dark' ? 'dark' : 'light');
                }
            },
            {
                fireImmediately: true,
            },
        );
        return () => {
            if (!isNil(unSub)) unSub();
        };
    }, [systemTheme]);
    return <>{children}</>;
};

const Theme: FC<PropsWithChildren<Partial<ThemeOptions>>> = ({ children, ...props }) => {
    const storeRef = useRef<ThemeStoreType>(null);
    if (!storeRef.current) {
        storeRef.current = createThemeStore(props);
    }
    return (
        <ThemeContext value={storeRef.current}>
            <ThemeSubscriber>{children}</ThemeSubscriber>
        </ThemeContext>
    );
};
export default Theme;
