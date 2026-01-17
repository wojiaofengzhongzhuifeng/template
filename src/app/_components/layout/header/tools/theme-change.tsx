import type { FC } from 'react';

import { Moon, Sun } from 'lucide-react';
import { Suspense, useCallback } from 'react';

import { Button } from '@/app/_components/shadcn/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/app/_components/shadcn/ui/tooltip';
import { useThemeActions, useThemeColor } from '@/app/_components/theme/hooks';

export const ThemeChangeButton: FC = () => {
    const { changeMode } = useThemeActions();
    const color = useThemeColor();
    const toggleMode = useCallback(() => changeMode(color === 'light' ? 'dark' : 'light'), [color]);
    return (
        <Suspense>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            className="ml-auto"
                            size="icon"
                            variant="outline"
                            onClick={toggleMode}
                        >
                            {color === 'light' ? <Sun /> : <Moon />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{color === 'light' ? '切换暗黑模式' : '切换明亮模式'}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </Suspense>
    );
};
