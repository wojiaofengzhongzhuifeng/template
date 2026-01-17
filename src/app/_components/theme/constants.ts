import { createContext } from 'react';

import type { ThemeStoreType } from './types';

/**
 * 主题模式
 */
export enum ThemeMode {
    LIGHT = 'light',
    DARK = 'dark',
    SYSTEM = 'system',
}

/**
 * 主题操作类型
 */
export enum ThemeActions {
    // 切换主题黑亮
    CHANGE_MODE = 'change_mode',
    // 反转主题黑亮
    TOOGLE_MODE = 'toggle_mode',
    // 切换紧凑主题
    CHANGE_COMPACT = 'change_compact',
    // 反转紧凑主题
    TOOGLE_COMPACT = 'toggle_compact',
}

/**
 * 默认配置
 */
export const defaultThemeOptions: ThemeOptions = {
    mode: 'system',
    compact: false,
};

// src/app/_components/theme/types.ts
/**
 * 状态类型
 */
export interface ThemeOptions {
    mode: `${ThemeMode}`;
    compact: boolean;
}

/**
 * Redux dispatch
 */
export type ThemeDispatchs =
    | { type: `${ThemeActions.CHANGE_MODE}`; value: `${ThemeMode}` }
    | { type: `${ThemeActions.TOOGLE_MODE}` }
    | { type: `${ThemeActions.CHANGE_COMPACT}`; value: boolean }
    | { type: `${ThemeActions.TOOGLE_COMPACT}` };

/**
 * 状态参数
 */
export type ThemeState = ThemeOptions & {
    dispatch: (action: ThemeDispatchs) => ThemeDispatchs;
};

/**
 * 创建用于全局共享的状态Context
 */
export const ThemeContext = createContext<ThemeStoreType | null>(null);
