import type { FC } from 'react';

import $styles from '@/app/(pages)/layout.module.css';

const AppNotFound: FC = () => (
    <div className={$styles.layout}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>404</h1>
            <p>Page not found</p>
        </div>
    </div>
);

export default AppNotFound;
