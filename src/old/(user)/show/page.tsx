'use client';

import { CopyIcon, DeleteIcon, EditIcon, SaveIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { usePostFormListHooks } from '../form/_hooks/postFormListHooks';
import { postAiCreactPicture } from './_api/postAiCreactPicture';
import { usePostAiCreactPitureHooks } from './_hooks/postAiCreactPitureHooks';
import { useShowPageStore, useStoryDataStore } from './_store';
import { AddIcon, RefreshIcon } from './icon';

// 场景类型定义
interface Scene {
    text: string;
    img_text_prompt: string;
    imageUrl?: string | null;
}

export default function ShowPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const payload = searchParams.get('payload');
    const [bookData, setBookData] = useState<any>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const hasRunRef = useRef(false);
    const hasStartedImageGeneration = useRef(false);
    const [isEditMode, setIsEditMode] = useState(false); // 是否是编辑模式
    const [editBookId, setEditBookId] = useState<number | null>(null); // 编辑的书籍 ID
    const { data, run, success } = usePostFormListHooks();
    const { aiCreactPicture, setAiCreactPicture } = useShowPageStore();
    const {
        storyData,
        setStoryData,
        updateSceneImage,
        updateSceneImagePrompt,
        updateSceneText,
        insertScene,
        deleteScene,
        copyScene,
    } = useStoryDataStore();
    const postAiCreactPictureHooks = usePostAiCreactPitureHooks();
    const [editPosition, setEditPosition] = useState<'photos' | 'text'>('photos');

    useEffect(() => {
        if (!payload) return;

        // 每次携带 payload 进入 /show，都认为是一次「全新的生成 / 编辑会话」
        // 先把上一次的全局状态清空，避免看到旧绘本内容
        hasRunRef.current = false;
        hasStartedImageGeneration.current = false;
        setIsGeneratingImages(false);
        setStoryData(null);
        setAiCreactPicture([]);
        setIsEditMode(false);
        setEditBookId(null);
        setPageIndex(0);

        // 调试：打印原始 payload 字符串
        console.log('ShowPage - 原始 payload 查询参数:', payload);

        try {
            const decoded = decodeURIComponent(payload);
            console.log('ShowPage - 解码后的 payload 字符串:', decoded);

            const parsed = JSON.parse(decoded);
            console.log('ShowPage - 解析后的 bookData 对象:', parsed);
            setBookData(parsed);

            // 检测是否是编辑模式（有 bookId 和 scenes）
            if (parsed.bookId && parsed.scenes) {
                setIsEditMode(true);
                setEditBookId(parsed.bookId);
                hasRunRef.current = true; // 跳过 AI 生成文字
                hasStartedImageGeneration.current = true; // 跳过 AI 生成图片

                // 直接使用已有的数据
                setStoryData({
                    id: parsed.bookId,
                    data: {
                        child_age: parsed.child_age,
                        illustration_style_label: parsed.illustration_style,
                        story_overview: parsed.story_overview,
                        central_idea: parsed.central_idea,
                        themes: parsed.themes,
                        usage: { completion_tokens: 0, prompt_tokens: 0, total_tokens: 0 },
                        scenes: parsed.scenes,
                    },
                });
            }
        } catch (e) {
            console.error('解析 payload 失败:', e);
        }
    }, [payload, setStoryData]); // 只依赖 payload 字符串，不依赖整个 searchParams 对象

    useEffect(() => {
        if (!bookData || hasRunRef.current) return;

        hasRunRef.current = true; // 标记已执行过

        run({
            child_age: bookData.child_age,
            illustration_style: bookData.illustration_style,
            themes: bookData.themes,
            story_overview: bookData.story_overview,
            central_idea: bookData.central_idea,
        });
    }, [bookData, run]); // 添加依赖数组，防止无限执行

    useEffect(() => {
        if (data && success && data.scenes && !isGeneratingImages) {
            setAiCreactPicture(data.scenes.map((scene: any) => scene.img_text_prompt));
        }
    }, [data, success, setAiCreactPicture, isGeneratingImages]);

    useEffect(() => {
        if (aiCreactPicture.length > 0 && !hasStartedImageGeneration.current) {
            hasStartedImageGeneration.current = true;
            setIsGeneratingImages(true);

            // 使用 forEach 带 index，并直接调用 API
            const promises = aiCreactPicture.map(async (prompt: string | null, index: number) => {
                if (prompt) {
                    try {
                        const response = await postAiCreactPicture({
                            prompt,
                            model: 'glm-image',
                            size: '512x512',
                            sceneIndex: index,
                        });

                        // 获取图片 URL 并保存到 Store
                        if (response.success && response.data) {
                            const imageUrl = response.data.imageUrl;
                            updateSceneImage(index, imageUrl);
                        }
                    } catch (error) {
                        console.error(`场景 ${index} 图片生成失败:`, error);
                    }
                }
            });
            Promise.all(promises).then(() => {
                setIsGeneratingImages(false);
            });
        }
    }, [aiCreactPicture, updateSceneImage]);

    useEffect(() => {
        if (bookData && data && data.scenes) {
            setStoryData({
                id: Date.now(), // 或者使用其他唯一 ID
                data: {
                    child_age: bookData.child_age,
                    illustration_style_label: bookData.illustration_style,
                    story_overview: bookData.story_overview,
                    central_idea: bookData.central_idea,
                    themes: bookData.themes,
                    usage: data.usage || {
                        completion_tokens: 0,
                        prompt_tokens: 0,
                        total_tokens: 0,
                    },
                    scenes: data.scenes, // AI 返回的场景数据
                },
            });
        }
    }, [bookData, data]);

    // Loading 组件
    const LoadingScreen = ({ message = '加载中...' }: { message?: string }) => (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
            <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="text-orange-600 text-xl font-semibold">{message}</div>
                <div className="text-orange-400 text-sm mt-2">请稍候...</div>
            </div>
        </div>
    );

    // 正在生成图片的状态（优先级最高）
    if (isGeneratingImages) {
        return <LoadingScreen message="正在生成图片，请稍候..." />;
    }

    // 如果没有 payload，显示加载
    if (!payload) {
        return <LoadingScreen message="正在加载页面..." />;
    }

    // 如果还没有解析 bookData，显示加载
    if (!bookData) {
        return <LoadingScreen message="正在解析数据..." />;
    }

    // 编辑模式下：如果还没有 storyData，显示加载
    if (isEditMode && !storyData) {
        return <LoadingScreen message="正在加载绘本数据..." />;
    }

    // 新建模式下：如果还没有 storyData，显示加载
    if (!isEditMode && !storyData) {
        return <LoadingScreen message="正在生成绘本内容..." />;
    }

    // 如果 storyData 存在但没有场景数据，显示加载
    if (storyData && (!storyData.data.scenes || storyData.data.scenes.length === 0)) {
        return <LoadingScreen message="正在准备场景数据..." />;
    }

    const handleSave = () => {
        if (!storyData) return;

        const savedBooks = localStorage.getItem('myLibrary');
        let books = savedBooks ? JSON.parse(savedBooks) : [];

        if (isEditMode && editBookId) {
            // 编辑模式：更新原有的书籍
            books = books.map((book: any) => {
                if (book.id === editBookId) {
                    return {
                        ...storyData,
                        id: editBookId, // 保持原有 ID
                        updatedAt: new Date().toISOString(),
                        createdAt: book.createdAt, // 保持原有创建时间
                    };
                }
                return book;
            });
        } else {
            // 新建模式：添加新书籍
            // 生成唯一 ID：时间戳 + 随机数 + 现有书籍数量，确保唯一性
            const existingIds = books.map((b: any) => b.id).filter(Boolean);
            let newId = Date.now() + Math.random() * 1000;
            // 如果 ID 已存在，继续生成直到唯一
            while (existingIds.includes(newId)) {
                newId = Date.now() + Math.random() * 1000;
            }

            const newBook = {
                ...storyData,
                id: Math.floor(newId), // 确保是数字
                createdAt: new Date().toISOString(),
            };
            books.push(newBook);
        }

        localStorage.setItem('myLibrary', JSON.stringify(books));
        router.push('/myLibrary');
    };

    const handleEditPosition = (e: 'photos' | 'text') => {
        setEditPosition(e);
    };

    // 当前选中的场景
    const scenes = storyData?.data.scenes || [];
    const currentScene = scenes[pageIndex] as Scene | undefined;
    const totalPages = scenes.length;

    console.log('storyData', storyData);
    return (
        <div className="flex gap-2 h-screen">
            {/* 左侧页面列表 */}
            <div className="h-screen overflow-y-auto w-1/6">
                <div className="bg-white border-blue-200 border-solid border-4 rounded-md p-4">
                    <h2 className="text-orange-500 text-2xl mb-2">页面列表</h2>
                    <div className="text-orange-400 text-sm mb-4">共{totalPages}页</div>
                    <hr className="border-gray-300 my-2" />

                    {/* 页面缩略图列表 */}
                    <div className="space-y-4">
                        {scenes.map((scene: Scene, index: number) => (
                            <div
                                key={index}
                                className={`bg-yellow-50 p-2 rounded-lg border-solid border-4 cursor-pointer relative overflow-hidden transition-all ${
                                    pageIndex === index
                                        ? 'border-pink-500 ring-2 ring-pink-300'
                                        : 'border-orange-300 hover:border-orange-400'
                                }`}
                                onClick={() => setPageIndex(index)}
                            >
                                <img
                                    src={scene.imageUrl || ''}
                                    alt={`第${index + 1}页`}
                                    className="w-full h-32 object-cover rounded-md"
                                />
                                <div className="absolute bottom-15 right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm shadow-md">
                                    {index + 1}
                                </div>
                                <div className="text-gray-700 text-sm mt-2 px-1 line-clamp-2">
                                    {scene.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 底部操作按钮 */}
                    <div className="sticky bottom-0 bg-white pt-4 mt-4 space-y-2">
                        <button
                            className="flex items-center justify-center gap-1 bg-green-500 text-white px-4 py-2 rounded-full w-full hover:bg-green-600 transition-colors"
                            onClick={() => {
                                insertScene(pageIndex, {
                                    text: '新页面文字内容',
                                    img_text_prompt: '请输入图片提示词',
                                    imageUrl: null,
                                });
                                // 跳转到新插入的页面（当前页的下一页）
                                setPageIndex(pageIndex + 1);
                            }}
                        >
                            <AddIcon />
                            添加新页
                        </button>
                        <div className="flex gap-2">
                            <button
                                className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-full hover:bg-blue-600 transition-colors"
                                onClick={() => copyScene(pageIndex)}
                            >
                                <CopyIcon className="w-4 h-4" />
                                复制
                            </button>
                            <button
                                className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-full hover:bg-red-600 transition-colors"
                                onClick={() => deleteScene(pageIndex)}
                            >
                                <DeleteIcon className="w-4 h-4" />
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 中间预览区域 */}
            <div className="w-5/7 bg-white border-blue-200 border-solid border-4 rounded-md p-4 h-screen overflow-y-auto">
                {/* 头部 */}
                <div className="flex justify-between border-b-2 border-pink-300 pb-2 pt-2 items-center">
                    <div className="font-medium">👁 预览区域</div>
                    <div className="flex gap-2 items-center">
                        <div className="text-pink-500 text-sm">
                            第{pageIndex + 1}/{totalPages}页
                        </div>
                        <button
                            className="bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors flex items-center gap-1 text-sm"
                            onClick={() => handleSave()}
                        >
                            <SaveIcon className="w-4 h-4" />
                            {isEditMode ? '保存并返回' : '保存'}
                        </button>
                    </div>
                </div>

                {/* 预览内容 */}
                <div className="flex justify-center mt-4">
                    <div className="w-3/5 flex flex-col gap-4">
                        {/* 图片区域 */}
                        <div className="border-4 border-orange-300 rounded-md p-4 bg-gray-200 shadow-lg">
                            <img
                                src={currentScene?.imageUrl || ''}
                                alt={`第${pageIndex + 1}页预览`}
                                className="w-full h-auto object-cover rounded-md"
                                onClick={() => handleEditPosition('photos')}
                            />
                        </div>
                        {/* 文字区域 */}
                        <div
                            className="border-4 border-yellow-300 rounded-md p-4 text-orange-500 flex items-center gap-2"
                            onClick={() => handleEditPosition('text')}
                        >
                            <EditIcon className="w-4 h-4 shrink-0" />
                            <span>{currentScene?.text || '暂无文字'}</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* 右侧编辑内容 */}
            <div className="h-screen w-1/6">
                <div className="bg-white border-green-200 border-solid border-4 rounded-md p-4 h-full flex flex-col">
                    <h2 className="text-orange-500 text-2xl mb-2">🖊编辑属性</h2>
                    <div className="text-orange-400 text-sm mb-4">
                        {' '}
                        正在编辑{editPosition === 'photos' ? '图片' : '文字'}
                    </div>
                    <hr className="border-gray-300 my-2" />

                    {editPosition === 'photos' ? (
                        <>
                            <div className="text-orange-500 text-sm mb-2  ">图片提示词</div>
                            <textarea
                                value={currentScene?.img_text_prompt || ''}
                                onChange={(e) => updateSceneImagePrompt(pageIndex, e.target.value)}
                                className="border-4 border-yellow-300 rounded-md p-2 h-64"
                            />
                            <button
                                onClick={() => {
                                    postAiCreactPictureHooks.run({
                                        prompt: currentScene?.img_text_prompt || '',
                                        model: 'glm-image',
                                        size: '512x512',
                                    });
                                }}
                                className="bg-blue-500 text-white px-3 py-2 mt-2 rounded-full hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm w-full justify-center"
                            >
                                <RefreshIcon />
                                重新生成图片
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-orange-500 text-sm mb-2">文字内容</div>
                            <textarea
                                value={currentScene?.text || ''}
                                onChange={(e) => updateSceneText(pageIndex, e.target.value)}
                                className="border-4 border-yellow-300 rounded-md p-2 h-64"
                            />
                            <button
                                onClick={() => {
                                    postAiCreactPictureHooks.run({
                                        prompt: currentScene?.text || '',
                                        model: 'glm-image',
                                        size: '512x512',
                                    });
                                }}
                                className="bg-orange-500 text-white px-3 py-2 mt-2 rounded-full hover:bg-orange-600 transition-colors flex items-center gap-1 text-sm w-full justify-center"
                            >
                                <RefreshIcon />
                                重新生成文字
                            </button>
                        </>
                    )}
                    {editPosition === 'photos' && (
                        <div className="border-2 border-blue-300 rounded-md p-2 mt-4 text-blue-500 bg-blue-50">
                            <div>💡提示</div>
                            <div>
                                点击中间预览区的图片可以选择并编辑它。修改提示词后点击重新生成。
                            </div>
                        </div>
                    )}
                    {editPosition === 'text' && (
                        <div className="border-2 border-orange-300 rounded-md p-2 mt-4 text-orange-500 bg-orange-50">
                            <div>💡提示</div>
                            <div>
                                简单文字应该简短、有力，适合儿童快速理解。建议使用 8-15 个字。
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
