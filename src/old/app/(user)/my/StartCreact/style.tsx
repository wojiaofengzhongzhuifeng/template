import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

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

export function CreatePictureWrapper(props: { children: ReactNode }) {
  return <div className="py-20 bg-orange-600">{props.children}</div>;
}

export function CreatePictureTitle(props: { children: ReactNode }) {
  return <p className="text-[48px] text-white">{props.children}</p>;
}

export function CreatePictureSubtitle(props: { children: ReactNode }) {
  return <p className="text-[18px] text-white mt-4">{props.children}</p>;
}

export function CreatePictureButton(props: { children: ReactNode }) {
  return (
    <Button className="bg-white rounded-sm px-14 py-8 border-2 border-white hover:bg-white/80">
      {props.children}
    </Button>
  );
}
