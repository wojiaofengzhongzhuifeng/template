'use client';

import { Heart, History, Image } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { Generation, Image as ImageType } from '@/lib';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { authService, generationRepository, imageRepository } from '@/lib';

export default function MyPage() {
    const [user, setUser] = useState<any>(null);
    const [userImages, setUserImages] = useState<ImageType[]>([]);
    const [userGenerations, setUserGenerations] = useState<Generation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                if (!currentUser) {
                    window.location.href = '/auth/login';
                    return;
                }

                setUser(currentUser);

                // 获取用户图片
                const images = await imageRepository.findAll({
                    userId: currentUser.id,
                });
                setUserImages(images);

                // 获取用户生成记录
                const generations = await generationRepository.findAll({
                    userId: currentUser.id,
                });
                setUserGenerations(generations);
            } catch (error) {
                console.error('获取用户数据失败:', error);
                toast({
                    title: '获取失败',
                    description: '无法加载用户数据，请稍后重试',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className="container py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="space-y-2">
                            <div className="h-6 w-40 bg-gray-200 animate-pulse rounded"></div>
                            <div className="h-4 w-60 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="h-40">
                                <div className="h-full w-full bg-gray-200 animate-pulse rounded"></div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container py-8">
            <div className="max-w-4xl mx-auto">
                {/* 用户信息 */}
                <div className="flex items-center space-x-4 mb-8">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                        <AvatarFallback className="text-2xl">
                            {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {user.user_metadata?.nickname || user.email}
                        </h1>
                        <p className="text-muted-foreground">{user.email}</p>
                        <div className="flex items-center mt-2 space-x-2">
                            <Badge
                                variant={
                                    user.user_metadata?.role === 'admin' ? 'default' : 'secondary'
                                }
                            >
                                {user.user_metadata?.role === 'admin' ? '管理员' : '普通用户'}
                            </Badge>
                            <Badge variant="outline">
                                注册于 {new Date(user.created_at).toLocaleDateString()}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">生成图片</CardTitle>
                            <Image className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userImages.length}</div>
                            <p className="text-xs text-muted-foreground">总共生成的图片数量</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">生成次数</CardTitle>
                            <History className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userGenerations.length}</div>
                            <p className="text-xs text-muted-foreground">总共的生成请求次数</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">获得点赞</CardTitle>
                            <Heart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {userImages.reduce((sum, img) => sum + img.likes_count, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">所有图片获得的点赞总数</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 详细内容 */}
                <Tabs defaultValue="images" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="images">我的图片</TabsTrigger>
                        <TabsTrigger value="history">生成历史</TabsTrigger>
                    </TabsList>

                    <TabsContent value="images" className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {userImages.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-muted-foreground">您还没有生成任何图片</p>
                                    <Button className="mt-4" asChild>
                                        <a href="/generate">开始生成</a>
                                    </Button>
                                </div>
                            ) : (
                                userImages.map((image) => (
                                    <Card key={image.id} className="overflow-hidden">
                                        <div className="relative aspect-square overflow-hidden">
                                            <img
                                                src={image.image_url || ''}
                                                alt={image.prompt}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <Badge
                                                    variant={
                                                        image.is_public ? 'default' : 'secondary'
                                                    }
                                                >
                                                    {image.is_public ? '公开' : '私有'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <CardContent className="p-4">
                                            <p className="text-sm font-medium line-clamp-2 mb-2">
                                                {image.prompt}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{image.model}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1">
                                                        <Heart className="h-3 w-3" />
                                                        {image.likes_count}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Image className="h-3 w-3" />
                                                        {image.width}×{image.height}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <div className="space-y-4">
                            {userGenerations.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">您还没有生成记录</p>
                                </div>
                            ) : (
                                userGenerations.map((generation) => (
                                    <Card key={generation.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        {generation.prompt}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>模型: {generation.model}</span>
                                                        <span>
                                                            状态:{' '}
                                                            {generation.status === 'success'
                                                                ? '成功'
                                                                : generation.status === 'failed'
                                                                  ? '失败'
                                                                  : generation.status ===
                                                                      'processing'
                                                                    ? '处理中'
                                                                    : '等待中'}
                                                        </span>
                                                        {generation.generation_time && (
                                                            <span>
                                                                耗时: {generation.generation_time}ms
                                                            </span>
                                                        )}
                                                    </div>
                                                    {generation.error_message && (
                                                        <p className="text-sm text-red-500">
                                                            {generation.error_message}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(
                                                        generation.created_at,
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
