'use client';
import type { FC } from 'react';

import { Calendar } from 'antd';

import $styles from '../../demo/_components/style.module.css';
import { AntdThemeSetting } from './setting';
const ThemeDemo: FC = () => (
    <div className={$styles.container}>
        <h2 className="text-center">Setting Demo</h2>
        <div className="flex flex-col items-center">
            <div className="mb-5 flex-auto">
                <AntdThemeSetting />
            </div>
            <div className="max-w-md">
                <Calendar fullscreen={false} />
            </div>
        </div>
    </div>
);
export default ThemeDemo;
