'use client';
import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

import { useMyLibraryStore } from './_store';
import { exportBooksToPDF } from './ExprotBooks';
import {
    MyLibraryCreate,
    MyLibraryDelete,
    MyLibraryDownload,
    MyLibraryEdit,
    MyLibraryPageTotal,
    MyLibraryPictureTotal,
    MyLibraryRead,
    MyLibrarySearch,
} from './icon';

export default function MyLibraryPage() {
    const router = useRouter();
    const { books, setBooks } = useMyLibraryStore();
    const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键词
    const [isExportMode, setIsExportMode] = useState(false); // 是否处于导出模式
    const [selectedBooks, setSelectedBooks] = useState<string[]>([]); // 选中的书籍ID
    const [exportCount, setExportCount] = useState(0); // 导出次数

    console.log(`books`, books);

    // 初始化：加载绘本数据和导出次数
    useEffect(() => {
        try {
            // 加载绘本数据
            const storedBooks = localStorage.getItem('myLibrary');
            if (storedBooks) {
                const parsed = JSON.parse(storedBooks);
                // 确保解析出来的是数组
                if (Array.isArray(parsed)) {
                    setBooks(parsed);
                } else {
                    // 数据损坏，清除它
                    localStorage.removeItem('myLibrary');
                    setBooks([]);
                }
            }

            // 加载导出次数
            const storedExportCount = localStorage.getItem('exportCount');
            if (storedExportCount) {
                setExportCount(Number.parseInt(storedExportCount, 10) || 0);
            }
        } catch (e) {
            // JSON 解析失败，清除损坏的数据
            localStorage.removeItem('myLibrary');
            setBooks([]);
        }
    }, []);

    //删除功能
    const handleDelete = (book: any) => {
        try {
            // 确认删除
            const bookTitle = book.data?.central_idea || '这本绘本';
            if (!window.confirm(`确定要删除「${bookTitle}」吗？`)) {
                return;
            }

            // 从 localStorage 读取完整的书籍列表
            const storedBooks = localStorage.getItem('myLibrary');
            if (!storedBooks) return;

            const allBooks = JSON.parse(storedBooks);

            // 确保 book.id 存在
            if (book.id === undefined || book.id === null) {
                console.error('删除失败：绘本 ID 不存在', book);
                window.alert('删除失败：绘本 ID 不存在');
                return;
            }

            const bookIdToDelete = book.id;

            // 记录删除前的数量和匹配的书籍
            const beforeCount = allBooks.length;
            const matchingBooks = allBooks.filter((item: any) => {
                // 统一转换为字符串进行比较，避免类型不一致
                return String(item.id) === String(bookIdToDelete);
            });

            // 如果找到多个相同 ID 的书籍，只删除第一个（或者更精确匹配的那个）
            if (matchingBooks.length > 1) {
                console.warn(
                    `警告：找到 ${matchingBooks.length} 本相同 ID 的绘本，将使用更精确的匹配`,
                    {
                        bookId: bookIdToDelete,
                    },
                );

                // 尝试找到最匹配的那一本（通过比较 central_idea 和创建时间）
                const exactMatch = allBooks.findIndex((item: any) => {
                    const idMatch = String(item.id) === String(bookIdToDelete);
                    const titleMatch = item.data?.central_idea === book.data?.central_idea;
                    return idMatch && titleMatch;
                });

                if (exactMatch !== -1) {
                    // 找到了精确匹配，只删除这一本
                    const newBooks = allBooks.filter(
                        (_item: any, index: number) => index !== exactMatch,
                    );
                    localStorage.setItem('myLibrary', JSON.stringify(newBooks));

                    // 更新显示
                    if (searchKeyword) {
                        const filteredBooks = newBooks.filter((item: any) =>
                            item.data.central_idea
                                .toLowerCase()
                                .includes(searchKeyword.toLowerCase()),
                        );
                        setBooks(filteredBooks);
                    } else {
                        setBooks(newBooks);
                    }
                    return;
                }
            }

            // 正常情况下，只删除第一个匹配的
            let deleted = false;
            const newBooks = allBooks.filter((item: any) => {
                if (!deleted && String(item.id) === String(bookIdToDelete)) {
                    deleted = true;
                    return false; // 删除第一个匹配的
                }
                return true;
            });

            // 验证删除结果
            const deletedCount = beforeCount - newBooks.length;
            if (deletedCount !== 1) {
                console.error(`删除异常：预期删除 1 本，实际删除了 ${deletedCount} 本`, {
                    bookId: bookIdToDelete,
                    beforeCount,
                    afterCount: newBooks.length,
                    matchingBooksCount: matchingBooks.length,
                });
                window.alert(`删除异常：检测到 ${matchingBooks.length} 本相同 ID 的绘本`);
                return;
            }

            // 保存更新后的完整列表
            localStorage.setItem('myLibrary', JSON.stringify(newBooks));

            // 如果当前有搜索关键词，需要在删除后重新执行搜索
            if (searchKeyword) {
                const filteredBooks = newBooks.filter((item: any) =>
                    item.data.central_idea.toLowerCase().includes(searchKeyword.toLowerCase()),
                );
                setBooks(filteredBooks);
            } else {
                setBooks(newBooks);
            }

            console.log('删除成功:', {
                deletedBookId: bookIdToDelete,
                remainingBooks: newBooks.length,
            });
        } catch (e) {
            console.error('删除绘本失败:', e);
            window.alert('删除绘本失败');
        }
    };

    //编辑功能
    const handleEdit = (book: any) => {
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

    //搜索功能
    const handleSearch = (search: string) => {
        setSearchKeyword(search);

        try {
            const storedBooks = localStorage.getItem('myLibrary');
            if (!storedBooks) return;

            const allBooks = JSON.parse(storedBooks);

            if (search === '') {
                // 搜索框为空，显示所有绘本
                setBooks(allBooks);
            } else {
                // 搜索过滤
                const filteredBooks = allBooks.filter((book: any) =>
                    book.data.central_idea.toLowerCase().includes(search.toLowerCase()),
                );
                setBooks(filteredBooks);
            }
        } catch (e) {
            console.error('搜索绘本失败:', e);
        }
    };
    //下载功能
    const handleSelectBook = (bookId: string) => {
        if (selectedBooks.includes(bookId)) {
            setSelectedBooks(selectedBooks.filter((id) => id !== bookId));
        } else {
            setSelectedBooks([...selectedBooks, bookId]);
        }
    };

    // 切换导出模式
    const handleExport = () => {
        setIsExportMode(!isExportMode);
        if (isExportMode) {
            // 如果退出导出模式，清空选择
            setSelectedBooks([]);
        }
    };
    // 添加全选功能
    const handleSelectAll = () => {
        setSelectedBooks(books.map((book: any) => book.id));
    };

    // 添加清空选择功能
    const handleClearSelection = () => {
        setSelectedBooks([]);
    };

    // 生成PDF的函数
    const handleGeneratePDF = async () => {
        if (selectedBooks.length === 0) {
            alert('请至少选择一本绘本');
            return;
        }

        try {
            // 确认操作
            const isConfirm = window.confirm(
                `确定要导出 ${selectedBooks.length} 本绘本吗？\n生成可能需要一些时间，请耐心等待。`,
            );

            if (!isConfirm) return;

            // 筛选选中的书籍
            const booksToExport = books.filter((book: any) => selectedBooks.includes(book.id));

            console.log('准备导出的绘本:', booksToExport);

            // 调用导出模块
            const success = await exportBooksToPDF(booksToExport, (current, total) => {
                console.log(`处理进度: ${current}/${total}`);
            });

            if (success) {
                // 更新导出次数
                const newExportCount = exportCount + 1;
                setExportCount(newExportCount);
                localStorage.setItem('exportCount', newExportCount.toString());

                alert('PDF生成成功！');

                // 退出导出模式
                setIsExportMode(false);
                setSelectedBooks([]);
            }
        } catch (error) {
            console.error('PDF生成失败:', error);
            alert('PDF生成失败，请重试');
        }
    };
    //阅读功能
    const handleRead = (book: any) => {
        router.push(`/playbook?bookId=${book.id}`);
    };

    //处理主题翻译问题
    const handleLabelTranslation = (label: string) => {
        let theme = '';
        let style = '';
        let age = '';
        if (label === 'cognitive_learning') {
            theme = '认知学习';
        } else if (label === 'emotional_education') {
            theme = '情感教育';
        } else if (label === 'social_behavior') {
            theme = '社会行为';
        } else if (label === 'natural_science') {
            theme = '自然科学';
        } else if (label === 'fantasy_adventure') {
            theme = '奇幻冒险';
        } else if (label === 'adventure_exploration') {
            theme = '冒险探索';
        }
        if (label === 'watercolor') {
            style = '水彩画风格';
        } else if (label === 'crayon') {
            style = '蜡笔画风格';
        } else if (label === 'cartoon') {
            style = '卡通动画风格';
        } else if (label === 'clay_3d') {
            style = '3D黏土风格';
        } else if (label === 'paper_cut') {
            style = '剪纸拼贴风格';
        }
        if (label === 'infant') {
            age = '0-2岁婴幼儿';
        } else if (label === 'preschool') {
            age = '3-6岁学龄前儿童';
        } else if (label === 'early_elementary') {
            age = '6-8岁小学低年级';
        }
        return { theme, style, age };
    };

    //遍历data生成绘本卡片
    const bookCards = books.map((book: any, index: number) => {
        const isSelected = selectedBooks.includes(book.id);

        return (
            <div
                key={book.id || index}
                className={`border-2 rounded-lg p-4 bg-white hover:shadow-xl transition-all shadow-lg relative ${
                    isExportMode ? 'cursor-pointer' : ''
                } ${
                    isSelected
                        ? 'border-blue-500 border-4'
                        : 'border-orange-300 hover:border-orange-400'
                }`}
                onClick={() => {
                    if (isExportMode) {
                        handleSelectBook(book.id);
                    }
                }}
            >
                {/* 左上角勾选框 - 仅在导出模式下显示 */}
                {isExportMode && (
                    <div className="absolute top-2 left-2 z-10">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectBook(book.id)}
                            className="w-5 h-5 cursor-pointer accent-blue-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                <div className="flex flex-col gap-2 border-b-2 border-orange-100 mb-4 pb-4">
                    <div className="w-full h-40 bg-orange-50 rounded-md flex items-center justify-center relative">
                        <img
                            src={book.data.scenes[0]?.imageUrl || '/images/myLibrary/book.png'}
                            alt="绘本封面"
                            className="max-w-full max-h-full object-contain"
                        />
                        <div className="absolute top-2 right-2 text-white text-sm bg-orange-500 rounded-md px-2 py-1">
                            {book.data.scenes.length}页
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                        <div className="text-md font-bold text-orange-600 line-clamp-1">
                            {book.data.central_idea}
                        </div>
                        <div className="text-sm text-orange-500">
                            年龄段：{handleLabelTranslation(book.data.child_age).age}
                        </div>
                        <div className="text-sm text-orange-500">
                            风格：
                            {handleLabelTranslation(book.data.illustration_style_label).style}
                        </div>
                        <div className="text-sm text-orange-500 line-clamp-1">
                            主题：{handleLabelTranslation(book.data.themes[0]).theme}
                        </div>
                    </div>
                </div>
                {/* 按钮区 - 导出模式下禁用 */}
                <div className="flex gap-2 justify-between">
                    <Button
                        className="flex-1 bg-orange-500 shadow-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (!isExportMode) handleRead(book);
                        }}
                        disabled={isExportMode}
                    >
                        <MyLibraryRead />
                        阅读
                    </Button>
                    <Button
                        className="flex-1 bg-blue-500 shadow-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (!isExportMode) handleEdit(book);
                        }}
                        disabled={isExportMode}
                    >
                        <MyLibraryEdit />
                        编辑
                    </Button>
                    <Button
                        className="bg-red-500 shadow-lg hover:bg-red-600 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (!isExportMode) handleDelete(book);
                        }}
                        disabled={isExportMode}
                    >
                        <MyLibraryDelete />
                    </Button>
                </div>
            </div>
        );
    });

    return (
        <div className="w-3/5 mx-auto mt-10">
            {/* 顶部搜索栏 */}
            <div className="border-4 border-orange-300 rounded-md p-4 shadow-lg mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-md font-bold text-orange-500 mb-2">
                            📚我的绘本图书馆
                        </div>
                        <div className="text-sm text-orange-500">共有{books.length}本绘本</div>
                    </div>
                    <div className="flex gap-2 items-center">
                        {/* 非导出模式：显示搜索框和常规按钮 */}
                        {!isExportMode && (
                            <>
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2">
                                        <MyLibrarySearch />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="搜索绘本..."
                                        className="border-2 border-yellow-200 rounded-md p-2 pl-8 shadow-lg"
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                                <Button
                                    className="bg-orange-500 shadow-lg hover:bg-orange-600"
                                    onClick={handleExport}
                                >
                                    <VerticalAlignBottomOutlined />
                                    导出
                                </Button>
                                <Button
                                    className="bg-orange-500 shadow-lg hover:bg-orange-600"
                                    onClick={() => router.push('/form')}
                                >
                                    <MyLibraryCreate />
                                    创建新绘本
                                </Button>
                            </>
                        )}

                        {/* 导出模式：显示选择控制按钮 */}
                        {isExportMode && (
                            <>
                                <span className="text-orange-500 font-bold">
                                    已选择 {selectedBooks.length} 本绘本
                                </span>
                                <Button
                                    className="bg-blue-500 shadow-lg hover:bg-blue-600"
                                    onClick={handleSelectAll}
                                >
                                    全选
                                </Button>
                                <Button
                                    className="bg-gray-500 shadow-lg hover:bg-gray-600"
                                    onClick={handleClearSelection}
                                >
                                    清空
                                </Button>
                                <Button
                                    className="bg-green-500 shadow-lg hover:bg-green-600"
                                    onClick={handleGeneratePDF}
                                    disabled={selectedBooks.length === 0}
                                >
                                    ✓ 确认导出
                                </Button>
                                <Button
                                    className="bg-red-500 shadow-lg hover:bg-red-600"
                                    onClick={handleExport}
                                >
                                    取消
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 绘本卡片列表 */}
            {books.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">{bookCards}</div>
            ) : searchKeyword ? (
                <div className="text-center text-orange-500 py-10 border-2 border-orange-200 rounded-md bg-orange-50">
                    🔍 暂无符合关键词「{searchKeyword}」的绘本
                </div>
            ) : (
                <div className="text-center text-orange-500 py-50 border-2 border-orange-200 rounded-md bg-orange-50 ">
                    📚 暂无绘本，快去创建第一本吧！
                </div>
            )}

            {/* 状态栏 */}
            <div className="border-4 border-green-300 rounded-md p-4 shadow-lg mt-8 flex justify-around bg-white mb-10">
                <div className="flex flex-col items-center gap-2">
                    <MyLibraryPictureTotal />
                    <div className="text-lg text-orange-500">{books.length}</div>
                    <div className="text-sm text-orange-500">创作总数</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <MyLibraryPageTotal />
                    <div className="text-lg text-blue-500">
                        {books.reduce((acc: number, book: any) => acc + book.data.scenes.length, 0)}
                    </div>
                    <div className="text-sm text-blue-500">总页数</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <MyLibraryDownload />
                    <div className="text-lg text-purple-500">{exportCount}</div>
                    <div className="text-sm text-purple-500">导出次数</div>
                </div>
            </div>
        </div>
    );
}
