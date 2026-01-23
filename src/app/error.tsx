'use client';

import type { FC } from 'react';

interface ErrorBoundaryProps {
    error: Error & { digest?: string };
    reset: () => void;
}

const AppError: FC<ErrorBoundaryProps> = ({ error, reset }) => (
    <div className="min-h-screen w-full flex p-0 m-0 flex-col justify-between bg-stone-200/80 dark:bg-zinc-900/60">
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                Something went wrong!
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{error.message}</p>
            <button
                onClick={() => reset()}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
                Try again
            </button>
        </div>
    </div>
);
export default AppError;
