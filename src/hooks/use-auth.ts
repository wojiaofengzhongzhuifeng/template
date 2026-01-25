import { useEffect, useState } from 'react';

import { authClient } from '@/api/auth';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuth = async () => {
            console.log('[useAuth] Fetching auth session...');
            try {
                setLoading(true);
                console.log('[useAuth] Calling authClient.getSession()');
                const response: any = await authClient.getSession();
                console.log('[useAuth] Session response:', response);

                const userData =
                    response?.data?.data?.user || response?.data?.user || response?.user;
                console.log('[useAuth] Extracted userData:', userData);

                if (userData && typeof userData === 'object' && Object.keys(userData).length > 0) {
                    console.log('[useAuth] User found:', userData);
                    setUser(userData);
                } else {
                    console.log('[useAuth] No user found in session');
                    setUser(null);
                }
            } catch (error) {
                console.error('[useAuth] Failed to fetch auth session:', error);
                setUser(null);
            } finally {
                console.log('[useAuth] Loading complete');
                setLoading(false);
            }
        };

        fetchAuth();
    }, []);

    return { user, loading, refresh: () => window.location.reload() };
}
