import type { FC } from 'react';

const NotFoundPage: FC = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">404</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Page not found</p>
    </div>
);

export default NotFoundPage;
