import type { Reducer } from 'react';

import { produce } from 'immer';

import { createPersistReduxStore } from '@/libs/store';

import type { ThemeDispatchs, ThemeOptions } from './constants';

import { defaultThemeOptions } from './constants';
import { getSystemTheme } from './utils';

/**
 * 创建reducer
 */
const ThemeReducer: Reducer<ThemeOptions, ThemeDispatchs> = produce((draft, action) => {
    switch (action.type) {
        case 'change_mode':
            draft.mode = action.value;
            break;
        case 'toggle_mode':
            if (draft.mode === 'system') {
                draft.mode = getSystemTheme() === 'dark' ? 'light' : 'dark';
            } else {
                draft.mode = draft.mode === 'dark' ? 'light' : 'dark';
            }
            break;
        case 'change_compact':
            draft.compact = action.value;
            break;
        case 'toggle_compact':
            draft.compact = !draft.compact;
            break;
        default:
            break;
    }
});

/**
 * 状态池创建函数
 */
export const createThemeStore = (options: Partial<ThemeOptions> = {}) =>
    createPersistReduxStore(
        ThemeReducer,
        { ...defaultThemeOptions, ...options },
        {
            name: 'theme',
            partialize: (state) => ({ mode: state.mode, compact: state.compact }),
        },
    );
