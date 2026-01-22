'use client';

import type { FC } from 'react';

import $styles from '@/app/(pages)/layout.module.css';

interface ErrorBoundaryProps {
    error: Error & { digest?: string };
    reset: () => void;
}

const AppError: FC<ErrorBoundaryProps> = ({ error, reset }) => (
    <div className={$styles.layout}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Something went wrong!</h2>
            <p>{error.message}</p>
            <button onClick={() => reset()}>Try again</button>
        </div>
    </div>
);
export default AppError;
