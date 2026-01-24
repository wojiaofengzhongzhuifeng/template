import { authClient } from '@/api/auth';

export async function getServerSession() {
    const session = await authClient.getSession();
    return session.data;
}
