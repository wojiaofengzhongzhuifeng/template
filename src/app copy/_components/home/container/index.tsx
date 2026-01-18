import type { FC, PropsWithChildren } from 'react';

import { cn } from '../../shadcn/utils';
import $styles from './style.module.css';
export const HomeContainer: FC<
    PropsWithChildren<{ className?: string; containerClass?: string }>
> = ({ children, className, containerClass }) => (
    <div className={cn($styles.container, containerClass)}>
        <div className={cn('page-container', $styles.main, className)}>{children}</div>
    </div>
);

export const HomeBlock: FC<PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
}) => {
    return <div className={cn($styles.block, className)}>{children}</div>;
};
