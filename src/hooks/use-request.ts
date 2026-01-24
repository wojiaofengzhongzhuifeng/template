'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useRequest Hook Options
 */
export interface UseRequestOptions<TData, TParams extends any[]> {
    /** Whether to execute the request manually, default is false (auto execution) */
    manual?: boolean;
    /** Default parameters for the service function */
    defaultParams?: TParams;
    /** Success callback */
    onSuccess?: (data: TData, params: TParams) => void;
    /** Error callback */
    onError?: (error: Error, params: TParams) => void;
}

/**
 * useRequest Hook Return Value
 */
export interface UseRequestResult<TData, TParams extends any[]> {
    /** Response data */
    data: TData | undefined;
    /** Error object */
    error: Error | undefined;
    /** Loading status */
    loading: boolean;
    /** Manual execution function */
    run: (...params: TParams) => Promise<TData>;
}

/**
 * Hook to simplify data fetching with axios
 *
 * @param service Async function to fetch data
 * @param options Configuration options
 * @returns Hook result containing data, error, loading, and run function
 */
export function useRequest<TData, TParams extends any[]>(
    service: (...args: TParams) => Promise<TData>,
    options: UseRequestOptions<TData, TParams> = {},
): UseRequestResult<TData, TParams> {
    const { manual = false, defaultParams, onSuccess: _onSuccess, onError: _onError } = options;

    const [data, setData] = useState<TData>();
    const [error, setError] = useState<Error>();
    const [loading, setLoading] = useState<boolean>(!manual);

    // Use ref to keep track of the latest service function and options to avoid unnecessary re-renders or stale closures
    const serviceRef = useRef(service);
    serviceRef.current = service;

    const optionsRef = useRef(options);
    optionsRef.current = options;

    const run = useCallback(async (...params: TParams): Promise<TData> => {
        setLoading(true);
        setError(undefined);

        try {
            const result = await serviceRef.current(...params);

            // Only update state if component is still mounted (not strictly necessary with modern React batching but good practice)
            setData(result);
            optionsRef.current.onSuccess?.(result, params);

            return result;
        } catch (err: any) {
            setError(err);
            optionsRef.current.onError?.(err, params);
            // Re-throw if needed, or just let the user handle it via error state
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!manual) {
            // @ts-expect-error - defaultParams might not match exactly but we trust the user for auto-run
            run(...(defaultParams || []));
        }
    }, [manual, run, defaultParams]);

    return {
        data,
        error,
        loading,
        run,
    };
}
