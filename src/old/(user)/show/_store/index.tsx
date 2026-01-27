import { create } from 'zustand';

export interface ShowPageStore {
    aiCreactPicture: (string | null)[];
    setAiCreactPicture: (aiCreactPicture: (string | null)[]) => void;
}

export const useShowPageStore = create<ShowPageStore>()((set) => ({
    aiCreactPicture: [],
    setAiCreactPicture: (aiCreactPicture: (string | null)[]) => set({ aiCreactPicture }),
}));

export interface StoryDataStore {
    storyData: StoryData | null;
    setStoryData: (storyData: StoryData | null) => void;
    updateSceneImage: (index: number, imageUrl: string) => void;
    updateSceneImagePrompt: (index: number, prompt: string) => void;
    updateSceneText: (index: number, text: string) => void;
    insertScene: (
        index: number,
        scene: {
            text: string;
            img_text_prompt: string;
            imageUrl?: string | null;
        },
    ) => void;
    deleteScene: (index: number) => void;
    copyScene: (index: number) => void;
}

export interface StoryData {
    id: number;
    data: {
        child_age: string;
        illustration_style_label: string;
        story_overview: string;
        central_idea: string;
        themes: string[];
        usage: {
            completion_tokens: number;
            prompt_tokens: number;
            total_tokens: number;
        };
        scenes: {
            text: string;
            img_text_prompt: string;
            imageUrl?: string | null; // 新增：存储生成的图片 URL
        }[];
    };
}

export const useStoryDataStore = create<StoryDataStore>()((set) => ({
    storyData: null,
    setStoryData: (storyData: StoryData | null) => set({ storyData }),

    updateSceneImage: (index: number, imageUrl: string) =>
        set((state) => {
            if (!state.storyData) return state;
            const newScenes = [...state.storyData.data.scenes];
            if (newScenes[index]) {
                newScenes[index].imageUrl = imageUrl;
            }
            return {
                storyData: {
                    ...state.storyData,
                    data: { ...state.storyData.data, scenes: newScenes },
                },
            };
        }),

    updateSceneImagePrompt: (index: number, prompt: string) =>
        set((state) => {
            if (!state.storyData) return state;
            const newScenes = [...state.storyData.data.scenes];
            if (newScenes[index]) {
                newScenes[index].img_text_prompt = prompt;
            }
            return {
                storyData: {
                    ...state.storyData,
                    data: { ...state.storyData.data, scenes: newScenes },
                },
            };
        }),

    updateSceneText: (index: number, text: string) =>
        set((state) => {
            if (!state.storyData) return state;
            const newScenes = [...state.storyData.data.scenes];
            if (newScenes[index]) {
                newScenes[index].text = text;
            }
            return {
                storyData: {
                    ...state.storyData,
                    data: { ...state.storyData.data, scenes: newScenes },
                },
            };
        }),

    insertScene: (
        index: number,
        scene: {
            text: string;
            img_text_prompt: string;
            imageUrl?: string | null;
        },
    ) =>
        set((state) => {
            if (!state.storyData) return state;
            const newScenes = [...state.storyData.data.scenes];
            // 在 index 后面插入新场景
            newScenes.splice(index + 1, 0, scene);
            return {
                storyData: {
                    ...state.storyData,
                    data: { ...state.storyData.data, scenes: newScenes },
                },
            };
        }),

    deleteScene: (index: number) =>
        set((state) => {
            if (!state.storyData) return state;
            const newScenes = [...state.storyData.data.scenes];
            newScenes.splice(index, 1);
            return {
                storyData: {
                    ...state.storyData,
                    data: { ...state.storyData.data, scenes: newScenes },
                },
            };
        }),

    copyScene: (index: number) =>
        set((state) => {
            if (!state.storyData) return state;
            const newScenes = [...state.storyData.data.scenes];
            newScenes.splice(index, 0, newScenes[index]);
            return {
                storyData: {
                    ...state.storyData,
                    data: { ...state.storyData.data, scenes: newScenes },
                },
            };
        }),
}));
