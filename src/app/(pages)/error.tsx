'use client';

import type { FC } from 'react';

interface ErrorBoundaryProps {
    error: Error & { digest?: string };
    reset: () => void;
}

const ErrorPage: FC<ErrorBoundaryProps> = ({ error, reset }) => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Something went wrong!</h2>
        <p>{error.message}</p>
        <button onClick={() => reset()}>Try again</button>
    </div>
);

export default ErrorPage;
