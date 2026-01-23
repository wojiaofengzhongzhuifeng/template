'use server';

import db from '@/libs/db/client';

/**
 * 查询用户的 Count 列表
 */
export const queryCountList = async (userId: string) => {
    return await db.count.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
};

/**
 * 查询单个 Count
 */
export const queryCountItem = async (id: string, userId: string) => {
    return await db.count.findFirst({
        where: { id, userId },
    });
};

/**
 * 创建 Count
 */
export const createCount = async (userId: string, number: number = 0) => {
    return await db.count.create({
        data: { userId, number },
    });
};

/**
 * 更新 Count
 */
export const updateCount = async (id: string, userId: string, number: number) => {
    return await db.count.updateMany({
        where: { id, userId },
        data: { number },
    });
};

/**
 * 删除 Count
 */
export const deleteCount = async (id: string, userId: string) => {
    return await db.count.deleteMany({
        where: { id, userId },
    });
};
