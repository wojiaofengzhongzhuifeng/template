import type { Metadata, ResolvingMetadata } from 'next';
import type { FC } from 'react';

export const generateMetadata = async (
    _metadata: Record<string, any>,
    parent: ResolvingMetadata,
): Promise<Metadata> => ({
    title: `首页 | ${(await parent).title?.absolute}`,
});

const HomePage: FC = () => (
    <div style={{ padding: '2rem' }}>
        <h1>Welcome to Home123321</h1>
    </div>
);

export default HomePage;
