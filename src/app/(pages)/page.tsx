import type { Metadata, ResolvingMetadata } from 'next';
import type { FC } from 'react';

export const generateMetadata = async (
    _metadata: Record<string, any>,
    parent: ResolvingMetadata,
): Promise<Metadata> => ({
    title: `首页 | ${(await parent).title?.absolute}`,
});

const HomePage: FC = () => (
    <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">Welcome to Home</h1>
    </div>
);

export default HomePage;
