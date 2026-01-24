import { create } from 'zustand';

import type { CountList } from '@/server/count/type';

interface HomeStore {
    countList: CountList | null | undefined;
    setCountList: (value: CountList | undefined) => void;
}

export const useHomeStore = create<HomeStore>((set) => ({
    countList: null,
    setCountList: (value: CountList | undefined) => set({ countList: value }),
}));
