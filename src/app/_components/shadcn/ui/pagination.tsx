import type { ComponentProps } from 'react';

import { isNil } from 'lodash';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import Link from 'next/link';

import type { Button } from '@/app/_components/shadcn/ui/button';

import { buttonVariants } from '@/app/_components/shadcn/ui/button';
import { cn } from '@/app/_components/shadcn/utils';

function Pagination({ className, ...props }: ComponentProps<'nav'>) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn('mx-auto flex w-full justify-center', className)}
            {...props}
        />
    );
}

function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn('flex flex-row items-center gap-1', className)}
            {...props}
        />
    );
}

function PaginationItem({ ...props }: ComponentProps<'li'>) {
    return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
    isActive?: boolean;
    disabled?: boolean;
    text?: string;
} & Pick<ComponentProps<typeof Button>, 'size'> &
    ComponentProps<'a'>;

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
    return (
        <Link
            aria-current={isActive ? 'page' : undefined}
            aria-disabled={props.disabled}
            className={cn(
                buttonVariants({
                    variant: isActive ? 'outline' : 'ghost',
                    size,
                }),
                cn({ 'pointer-events-none opacity-50': props.disabled }),
                className,
            )}
            href={isNil(props.href) ? ':' : props.href}
            {...props}
        />
    );
}

function PaginationPrevious({ className, text, ...props }: ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="default"
            className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
            {...props}
        >
            <ChevronLeftIcon />
            <span className="hidden sm:block">{text ?? 'Next'}</span>
        </PaginationLink>
    );
}

function PaginationNext({ className, text, ...props }: ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="default"
            className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
            {...props}
        >
            <span className="hidden sm:block">{text ?? 'Next'}</span>
            <ChevronRightIcon />
        </PaginationLink>
    );
}

function PaginationEllipsis({
    className,
    text,
    ...props
}: ComponentProps<'span'> & { text?: string }) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn('flex size-9 items-center justify-center', className)}
            {...props}
        >
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">{text ?? 'More pages'}</span>
        </span>
    );
}

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
};
