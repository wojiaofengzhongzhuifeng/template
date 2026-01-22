'use client';
import type { FC } from 'react';

import { ApiDocButton } from './api-doc';
import { PostCreateButton } from './post-create';
import $styles from './style.module.css';
import { ThemeChangeButton } from './theme-change';
import { UserActionButton } from './user-action';

export const HeaderTools: FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
    return (
        <div className={$styles.tools}>
            <PostCreateButton iconBtn={isMobile} />
            <ApiDocButton />
            <ThemeChangeButton />
            <UserActionButton />
        </div>
    );
};
