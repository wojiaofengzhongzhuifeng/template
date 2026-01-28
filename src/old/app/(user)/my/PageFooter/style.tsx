import type { ReactNode } from 'react';

export function Section(props: { children: ReactNode; className?: string }) {
    const { children, className = '' } = props;
    const baseClass = 'mx-auto w-full max-w-[1152px] px-4 sm:px-6 lg:px-8 text-center';
    const combined = `${baseClass}${className ? ` ${className}` : ''}`;
    return <div className={combined}>{children}</div>;
}

export function PageFooterWrapper(props: { children: ReactNode }) {
    return <div className="py-20 bg-gray-900">{props.children}</div>;
}

export function PageFooterTitle(props: { children: ReactNode }) {
    return <p className="text-[32px] text-white flex justify-center gap-2">{props.children}</p>;
}

export function PageFooterItem(props: { children: ReactNode }) {
    return <p className="text-[20px]  text-gray-400 mt-4">{props.children}</p>;
}

export function PageFooterSubtitle(props: { children: ReactNode }) {
    return <p className="text-[16px]  text-gray-400 mt-6">{props.children}</p>;
}
