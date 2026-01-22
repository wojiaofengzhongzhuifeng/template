'use client';
import type { FC, ReactNode } from 'react';

import { isNil } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import Typed from 'typed.js';

import { cn } from '../shadcn/utils';

export const TypedText: FC<{ className?: string; data: (string | ReactNode)[] }> = ({
    className,
    data,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const el = useRef<HTMLDivElement | null>(null);
    const [show, setShow] = useState(false);
    useEffect(() => {
        let typed: Typed | undefined;
        if (!isNil(ref.current) && !isNil(el.current)) {
            typed = new Typed(ref.current, {
                stringsElement: el.current,
                typeSpeed: 50,
                backDelay: 1700,
                smartBackspace: true,
                startDelay: 500,
                onStart: (_a, _s) => {
                    setShow(true);
                },
                onComplete: (_self) => {
                    const cursor = document.getElementsByClassName('typed-cursor');
                    if (cursor.length) cursor[0].remove();
                },
            });
        }

        return () => {
            if (typed) typed.destroy();
        };
    }, []);
    return (
        <div className={cn(className)}>
            <div ref={ref} className="inline-block" />
            <div
                ref={el}
                className={cn({
                    hidden: !show,
                })}
            >
                {data.map((item, index) => (
                    <p key={index.toFixed()}>{item}</p>
                ))}
            </div>
        </div>
    );
};
