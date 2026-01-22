import type { FC } from 'react';

import { Webhook } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { Button } from '@/app-old/_components/shadcn/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/app-old/_components/shadcn/ui/tooltip';
import { appConfig } from '@/config/app';

export const ApiDocButton: FC = () => (
    <Suspense fallback={null}>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" size="icon" className="ml-auto" variant="outline" asChild>
                        <Link href={`${appConfig.apiPath}/docs`} target="_blank">
                            <Webhook />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>访问API文档</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </Suspense>
);
