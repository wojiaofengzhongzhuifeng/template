import type { ReactNode } from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

// 页面骨架
export function PageWrapper(props: { children: ReactNode }) {
    return <div className="py-20 bg-yellow-50">{props.children}</div>;
}

export function Section(props: { children: ReactNode; className?: string }) {
    const { children, className = '' } = props;
    const baseClass = 'mx-auto w-full max-w-[1152px] px-4 sm:px-6 lg:px-8 text-center';
    const combined = `${baseClass}${className ? ` ${className}` : ''}`;
    return <div className={combined}>{children}</div>;
}

export function HeroSection(props: { children: ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-[1152px] px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            {props.children}
        </div>
    );
}

// 标题/副标题
export function HeroTitle(props: { children: ReactNode }) {
    return <p className="text-[72px] text-orange-600">{props.children}</p>;
}

export function HeroSubtitle(props: { children: ReactNode }) {
    return <p className="text-[24px] text-gray-600">{props.children}</p>;
}

// CTA 按钮组件
export function CtaPrimaryButton(props: { children: ReactNode; href?: string }) {
    const button = (
        <Button className="bg-orange-500 rounded-sm px-14 py-8 border-2 border-orange-200 hover:bg-orange-500/80">
            {props.children}
        </Button>
    );

    if (props.href) {
        return <Link href={props.href}>{button}</Link>;
    }

    return button;
}

export function CtaSecondaryButton(props: { children: ReactNode }) {
    return (
        <Button className="bg-white rounded-sm px-14 py-8 border-2 border-orange-200 hover:bg-orange-200/10">
            {props.children}
        </Button>
    );
}

// 特性标签组件
export function FeatureChipOrange(props: { children: ReactNode }) {
    return (
        <div className="rounded-full py-4 px-8 shadow-md border-2 border-orange-200 text-orange-600">
            {props.children}
        </div>
    );
}

export function FeatureChipPink(props: { children: ReactNode }) {
    return (
        <div className="rounded-full py-4 px-8 shadow-md border-2 border-pink-200 text-pink-600">
            {props.children}
        </div>
    );
}

export function FeatureChipPurple(props: { children: ReactNode }) {
    return (
        <div className="rounded-full py-4 px-8 shadow-md border-2 border-purple-200 text-purple-600">
            {props.children}
        </div>
    );
}
