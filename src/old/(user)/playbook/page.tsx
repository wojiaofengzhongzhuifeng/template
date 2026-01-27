'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Flex, Progress } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useMyLibraryStore } from '@/app/(user)/myLibrary/_store';
import { Button } from '@/components/ui/button';

import { PlayBookPlayEdit, PlayBookPlayShare } from './icon';
export default function PlayBookPage() {
    const searchParams = useSearchParams();
    const bookId = searchParams.get('bookId');
    const { books, setBooks } = useMyLibraryStore();
    const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
    const [pageIndex, setPageIndex] = useState(0); // 当前页码，从 0 开始
    const totalPages = filteredBooks[0]?.data?.scenes?.length || 0;
    const progress = totalPages > 0 ? Math.round(((pageIndex + 1) / totalPages) * 100) : 0;
    const router = useRouter();
    const [isFullScreen, setIsFullScreen] = useState(false);
    // 翻页功能
    const handlePreviousNextPage = (type: 'previous' | 'next') => {
        if (type === 'previous') {
            setPageIndex(pageIndex - 1);
        } else if (type === 'next') {
            setPageIndex(pageIndex + 1);
        }
    };

    // 从 localStorage 加载数据（如果 store 是空的）
    useEffect(() => {
        if (books.length === 0) {
            try {
                const storedBooks = localStorage.getItem('myLibrary');
                if (storedBooks) {
                    const parsed = JSON.parse(storedBooks);
                    if (Array.isArray(parsed)) {
                        setBooks(parsed);
                    }
                }
            } catch (e) {
                console.error('读取绘本失败:', e);
            }
        }
    }, [books.length, setBooks]);

    // 过滤出符合 id 的绘本
    useEffect(() => {
        if (bookId && books.length > 0) {
            const filtered = books.filter((book: any) => book.id === Number(bookId));
            setFilteredBooks(filtered);
        }
    }, [books, bookId]);

    //处理主题翻译问题
    const handleThemeTranslation = (theme: string) => {
        let Theme = '';
        if (theme === 'cognitive_learning') {
            Theme = '认知学习';
        } else if (theme === 'emotional_education') {
            Theme = '情感教育';
        } else if (theme === 'social_behavior') {
            Theme = '社会行为';
        } else if (theme === 'natural_science') {
            Theme = '自然科学';
        } else if (theme === 'fantasy_adventure') {
            Theme = '奇幻冒险';
        } else if (theme === 'adventure_exploration') {
            Theme = '冒险探索';
        }
        return Theme;
    };

    //全屏功能
    //todo
    const handleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    //编辑功能
    const handleEdit = () => {
        const book = filteredBooks[0];
        if (!book) return;
        // 构建 payload，包含绘本的原始数据
        const payload = {
            child_age: book.data.child_age,
            illustration_style: book.data.illustration_style || book.data.illustration_style_label,
            themes: book.data.themes,
            story_overview: book.data.story_overview,
            central_idea: book.data.central_idea,
            // 传递已有的场景数据，用于编辑恢复
            scenes: book.data.scenes,
            bookId: book.id, // 传递 bookId 用于更新而不是新建
        };
        const encodedPayload = encodeURIComponent(JSON.stringify(payload));
        router.push(`/show?payload=${encodedPayload}`);
    };

    return (
        <div className="w-3/5 mx-auto mt-10">
            {/* heard */}
            <div className="flex justify-between border-b-2 border-orange-300 shadow-lg px-4 py-2">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        className="bg-yellow-100 text-orange-500 shadow-lg hover:bg-yellow-200 hover:text-orange-600"
                        onClick={() => router.back()}
                    >
                        <ArrowLeftOutlined />
                        返回
                    </Button>
                    <div className="flex flex-col border-l-2 border-orange-300 pl-4">
                        <div className="text-lg text-orange-600">
                            主题：{handleThemeTranslation(filteredBooks[0]?.data?.themes[0])}
                        </div>
                        <div className="text-sm text-orange-500">
                            第 {pageIndex + 1}/{filteredBooks[0]?.data?.scenes?.length}页
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        className="bg-orange-500 text-white shadow-lg"
                        onClick={handleFullScreen}
                    >
                        {isFullScreen ? (
                            <div className="text-white">退出全屏</div>
                        ) : (
                            <div className="text-white">全屏</div>
                        )}
                    </Button>
                    <PlayBookPlayShare />
                    <Button className="bg-orange-500 text-white shadow-lg" onClick={handleEdit}>
                        <PlayBookPlayEdit /> 编辑
                    </Button>
                </div>
            </div>

            {/* 展示框 */}
            <div className="border-4 border-pink-100 p-4 shadow-lg rounded-lg flex justify-between animate-fade-in">
                <div className="w-1/2 mr-8 flex items-center justify-center bg-gray-50 rounded-lg min-h-[500px]">
                    <img
                        key={`img-${pageIndex}`}
                        src={filteredBooks[0]?.data?.scenes?.[pageIndex]?.imageUrl}
                        alt="绘本封面"
                        className="w-full h-full object-contain rounded-lg animate-fade-in"
                    />
                </div>
                <div className="flex flex-col flex-1">
                    <div className="border-b-4 text-4xl pb-8 border-orange-300">
                        {filteredBooks[0]?.data?.central_idea}
                    </div>
                    <div
                        key={`text-${pageIndex}`}
                        className="px-4 py-2 text-3xl border-2 rounded-lg mt-5 shadow-lg animate-fade-in"
                    >
                        <div className="text-2xl">
                            {filteredBooks[0]?.data?.scenes?.[pageIndex]?.text}
                        </div>
                    </div>
                    <div className="flex flex-col justify-between items-center mt-auto ">
                        <div className="w-full">
                            <Flex vertical>
                                <Progress percent={progress} />
                            </Flex>
                        </div>
                        <div className="font-bold ">进度</div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-8 mb-8">
                <button
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                    onClick={() => handlePreviousNextPage('previous')}
                    disabled={pageIndex === 0}
                >
                    {pageIndex === 0 ? '没有上一页了' : '上一页'}
                </button>
                <div>
                    第 {pageIndex + 1} / {totalPages} 页
                </div>
                <button
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
                    onClick={() => handlePreviousNextPage('next')}
                    disabled={pageIndex === totalPages - 1}
                >
                    {pageIndex === totalPages - 1 ? '没有下一页了' : '下一页'}
                </button>
            </div>
        </div>
    );
}
