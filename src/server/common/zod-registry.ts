import { z } from 'zod';

/**
 * 处理Schema ID在next.js带着hono服务器热更新而导致的Registry重复注册问题
 */
export const clearZodRegistry = () => {
    if (process.env.NODE_ENV === 'development') {
        z.globalRegistry.clear();
    }
};

// 在模块导入时立即执行清除操作
clearZodRegistry();
