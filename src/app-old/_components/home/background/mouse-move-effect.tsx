'use client';

import type { FC } from 'react';

import { useEffect, useMemo, useState } from 'react';

import { useThemeColor } from '../../theme/hooks';

export const MouseMoveEffect: FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const themeColor = useThemeColor();
    const opacity = useMemo(() => (themeColor === 'dark' ? 0.07 : 0.15), [themeColor]);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div
            className="pointer-events-none fixed inset-0 z-(--z-index-home-mouse) transition-opacity duration-300"
            style={{
                background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(220, 231, 69, ${opacity}), transparent 80%)`,
            }}
        />
    );
};
