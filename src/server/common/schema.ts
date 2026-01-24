import { z } from 'zod';

// 统一响应 schema - 用于包装所有响应
export const unifiedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
    z.object({
        code: z.number().meta({ type: 'number' }),
        message: z.string().meta({ type: 'string' }),
        data: dataSchema.nullable().optional(),
    });

// 通用错误响应 schema（向后兼容）
export const errorSchema = z
    .object({
        code: z.number().meta({ type: 'number' }),
        message: z.string().meta({ type: 'string' }),
        data: z.null().optional(),
    })
    .strict();

// 简单成功响应 schema
export const successResultSchema = z.object({
    result: z.boolean(),
});

// 消息响应 schema
export const successMessageSchema = z.object({
    message: z.string(),
});

// 带消息的成功响应 schema
export const successMessageWithResultSchema = z.object({
    message: z.string().or(z.null()),
    result: z.boolean(),
});
