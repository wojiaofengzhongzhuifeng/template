import { create } from 'zustand';

import type { CountItem } from '@/server/count/type';

interface CountStore {
    counts: CountItem[] | null | undefined;
    setCounts: (value: CountItem[] | undefined) => void;
}

export const useCountStore = create<CountStore>((set) => ({
    counts: null,
    setCounts: (value: CountItem[] | undefined) => set({ counts: value }),
}));
