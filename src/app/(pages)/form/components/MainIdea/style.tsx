import type { ReactNode } from 'react';

// 页面容器
export function PageWrapper(props: { children: ReactNode }) {
    return (
        <div className="py-20 bg-yellow-50 mx-auto w-full max-w-[1152px] px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            {props.children}
        </div>
    );
}

// 表单标题
export function FormTitle(props: { children: ReactNode }) {
    return (
        <h1 className="bg-yellow-100 text-orange-600 px-6 py-2 rounded-full text-xl font-bold inline-block">
            {props.children}
        </h1>
    );
}

// 表单副标题
export function FormSubtitle(props: { children: ReactNode }) {
    return <div className="text-orange-600 p-4">{props.children}</div>;
}

// 表单区块标题
export function SectionTitle(props: { children: ReactNode }) {
    return <div className="text-orange-600 mb-4 flex mx-10">{props.children}</div>;
}

// 选项卡片容器
export function OptionGroup(props: { children: ReactNode }) {
    return <div className="flex flex-wrap gap-3 mx-10">{props.children}</div>;
}

// 选项卡片
export function OptionCard(props: { children: ReactNode; selected: boolean; onClick: () => void }) {
    const { children, selected, onClick } = props;
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    };
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            className={`pl-4 pr-32 py-3 pb-4 rounded-lg border-3 flex flex-col gap-1 cursor-pointer hover:border-pink-300 transition-all ${
                selected ? 'border-orange-500 bg-orange-50 scale-105' : 'border-yellow-200 bg-white'
            }`}
        >
            {children}
        </div>
    );
}

// 选项卡片标题
export function OptionTitle(props: { children: ReactNode; selected: boolean }) {
    return (
        <span className={props.selected ? 'text-orange-600' : 'text-gray-700'}>
            {props.children}
        </span>
    );
}

// 选项卡片描述
export function OptionDesc(props: { children: ReactNode }) {
    return <span className="text-xs text-gray-500 flex">{props.children}</span>;
}
