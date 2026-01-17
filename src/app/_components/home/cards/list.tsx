'use client';
import type { FC } from 'react';

import Link from 'next/link';

import { ShineCard } from '../../cards/shine';
import { Button } from '../../shadcn/ui/button';
import { cn } from '../../shadcn/utils';
import $styles from './list.module.css';

interface Item {
    text: string;
    href: string;
}

interface HomeListCardItem {
    title: string;
    data?: Item[];
    button?: {
        text: string;
        href: string;
        outline?: boolean;
    };
}

export interface HomeListCardType {
    first: HomeListCardItem;
    second: HomeListCardItem;
}

type Props = HomeListCardItem & {
    className?: string;
    title: string;
    alt?: string;
};

export const HomeListCard: FC<Props> = (props) => {
    const { className, title, data, button } = props;
    const items = data ?? [];
    return (
        <ShineCard className="h-full w-full" borderRadius="0.75rem">
            <div className={cn($styles.container, className)}>
                {title && <div className={$styles.title}>{title}</div>}
                <div className={$styles.content}>
                    <ul>
                        {items.map((item, index) => (
                            <li key={index.toFixed()}>
                                <Link href={item.href}>{item.text}</Link>
                            </li>
                        ))}
                    </ul>
                    <div className={$styles.cardBtn}>
                        {button && (
                            <Button
                                asChild
                                variant={button.outline ? 'outline' : 'default'}
                                className={cn(
                                    'text-muted-foreground hover:bg-black hover:text-primary-foreground dark:text-muted-foreground dark:hover:bg-black/70 dark:hover:text-foreground',
                                    {
                                        'bg-gray-900/80 dark:bg-gray-600/30': !button.outline,
                                    },
                                )}
                            >
                                <Link href={button.href}>{button.text}</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </ShineCard>
    );
};
