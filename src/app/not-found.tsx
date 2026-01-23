import type { FC } from 'react';

const AppNotFound: FC = () => (
    <div className="min-h-screen w-full flex p-0 m-0 flex-col justify-between bg-stone-200/80 dark:bg-zinc-900/60">
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
            <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">404</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Page not found</p>
        </div>
    </div>
);

export default AppNotFound;
