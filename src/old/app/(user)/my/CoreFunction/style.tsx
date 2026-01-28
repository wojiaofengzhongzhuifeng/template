import type { ReactNode } from 'react';

export function PageWrapper(props: { children: ReactNode }) {
  return <div className="py-20 bg-white">{props.children}</div>;
}

export function Section(props: { children: ReactNode; className?: string }) {
  const { children, className = '' } = props;
  const baseClass =
    'mx-auto w-full max-w-[1152px] px-4 sm:px-6 lg:px-8 text-center';
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

// 核心功能卡片通用容器
export function FeatureCard(props: {
  children: ReactNode;
  bgClass: string;
  borderClass: string;
}) {
  const { children, bgClass, borderClass } = props;
  return (
    <div className="flex justify-center w-full">
      <div className={`flex flex-col h-full ${bgClass}`}>
        <div
          className={`rounded-xl p-6 w-full max-w-[360px] h-[300px] flex flex-col border-4 ${borderClass}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
