import type { FC } from 'react';

import $styles from '@/app/(pages)/layout.module.css';

import { ErrorNotFound } from './_components/errors/not-found';
import { Header } from './_components/layout/header';
import Theme from './_components/theme';
const AppNotFound: FC = () => (
    <Theme>
        <div className={$styles.layout}>
            <Header />
            <ErrorNotFound />
        </div>
    </Theme>
);

export default AppNotFound;
