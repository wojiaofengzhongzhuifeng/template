import { useEffect, useState } from 'react';

import { authApi } from '@/api/auth';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authApi.getAuth().then((data) => {
            setUser(data);
            setLoading(false);
        });
    }, []);

    return { user, loading };
}
