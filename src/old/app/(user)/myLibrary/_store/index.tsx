import { create } from 'zustand';

export interface SavedBook {
  id: number;
  data: {
    child_age: string;
    illustration_style_label: string;
    story_overview: string;
    central_idea: string;
    themes: string[];
    scenes: {
      text: string;
      img_text_prompt: string;
      imageUrl?: string | null;
    }[];
  };
  createdAt: string;
}

export interface MyLibraryStore {
  books: SavedBook[];
  setBooks: (books: SavedBook[]) => void;
}

export const useMyLibraryStore = create<MyLibraryStore>((set) => ({
  books: [],
  setBooks: (books: SavedBook[]) => set({ books }),
}));
