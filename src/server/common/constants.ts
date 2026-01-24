/**
 * 统一错误码常量定义
 *
 * 错误码范围划分：
 * - 0: 成功
 * - 1-999: HTTP 错误（直接映射 HTTP 状态码）
 * - 1000-9999: 业务错误
 */
export enum ErrorCode {
    // 成功
    SUCCESS = 0,

    // HTTP 错误（1-999，直接映射）
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    SERVER_ERROR = 500,

    // 通用错误 9000-9999
    VALIDATION_ERROR = 9000,
    RESOURCE_NOT_FOUND = 9001,
    OPERATION_FAILED = 9002,

    // 用户模块 1000-1999
    USER_NOT_FOUND = 1001,
    USER_ALREADY_EXISTS = 1002,
    INVALID_CREDENTIALS = 1003,

    // 文章模块 2000-2999
    POST_NOT_FOUND = 2001,
    SLUG_ALREADY_EXISTS = 2002,

    // 分类模块 3000-3999
    CATEGORY_NOT_FOUND = 3001,
    CATEGORY_HAS_CHILDREN = 3002,

    // 标签模块 4000-4999
    TAG_NOT_FOUND = 4001,

    // 计数器模块 5000-5999
    COUNT_NOT_FOUND = 5001,
}
