import type { FC, PropsWithChildren } from 'react';

import { ShineBorder } from '../magicui/shine-border';
import { Card } from '../shadcn/ui/card';
import { cn } from '../shadcn/utils';

interface StackCardProps {
    className?: string;
    padding?: string;
    shine?: { open?: boolean; always?: boolean };
}
export const StackCard: FC<PropsWithChildren<StackCardProps>> = ({
    children,
    shine,
    className,
    padding = '0.75rem',
}) => {
    return (
        <div className={cn(`relative flex h-80 w-full items-center justify-center`, className)}>
            <div
                className={cn(
                    'absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-2xl opacity-50 animate-pulse',
                )}
            />
            <div
                className={cn(
                    'absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-2xl opacity-50 animate-pulse',
                )}
            />
            <div className="h-full w-full">
                <div className="relative h-full w-full">
                    <Card
                        className={cn(
                            'absolute inset-0',
                            'bg-card/20 backdrop-blur-sm',
                            'rotate-[-4deg] translate-y-2',
                            'rounded-sm!',
                        )}
                    />
                    <Card
                        className={cn(
                            'absolute inset-0',
                            'bg-card/30 backdrop-blur-sm',
                            'rotate-[-2deg] translate-y-1',
                            'rounded-sm!',
                        )}
                    />
                    <Card
                        className={cn(
                            'absolute inset-0',
                            'bg-card/40 backdrop-blur-sm',
                            'rounded-sm!',
                        )}
                    >
                        {shine ? (
                            <ShineBorder
                                className="relative h-full w-full rounded-sm"
                                color={['#A07CFE', '#FE8FB5', '#FFBE7B']}
                                always={shine.always}
                                padding={padding}
                            >
                                {children}
                            </ShineBorder>
                        ) : (
                            children
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};
