import type { HydrateProps } from 'next-mdx-remote-client';

import { cn } from '../../shadcn/utils';
import { Admonition } from '../components/admonition';
import $styles from '../hydrate.module.css';

/**
 * 默认mdx水合组件配置
 */
export const defaultMdxHydrateOptions: Omit<HydrateProps, 'compiledSource'> = {
    components: {
        wrapper: ({ children }) => (
            <div className={cn('mdx-preview', $styles.content)}>{children}</div>
        ),
        // 只使用大写的组件名
        Admonition,
    },
};
