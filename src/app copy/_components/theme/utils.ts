/**
 * 获取系统当前主题
 */
export const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light';
    const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDarkTheme ? 'dark' : 'light';
};
