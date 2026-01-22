'use client';

import type { FC } from 'react';

import type { ErrorBoundaryProps } from '../_components/errors/boundary';

import { ErrorBoundary } from '../_components/errors/boundary';

const ErrorPage: FC<ErrorBoundaryProps> = (props) => <ErrorBoundary {...props} />;

export default ErrorPage;
