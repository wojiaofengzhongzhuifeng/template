import type { Metadata, ResolvingMetadata } from 'next';
import type { FC } from 'react';

import { Home } from '../_components/home';
export const generateMetadata = async (
    _metadata: Record<string, any>,
    parent: ResolvingMetadata,
): Promise<Metadata> => ({
    title: `首页 | ${(await parent).title?.absolute}`,
});
const HomePage: FC = async () => <Home />;

export default HomePage;
