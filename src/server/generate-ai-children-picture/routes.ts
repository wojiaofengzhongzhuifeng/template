import { describeRoute, validator as zValidator } from 'hono-openapi';

import { createHonoApp } from '../common/app';
import { createErrorResult, defaultValidatorErrorHandler } from '../common/error';
import {
    createServerErrorResponse,
    createSuccessResponse,
    createValidatorErrorResponse,
} from '../common/response';
import { generateAiChildrenPictureResponseSchema, generateAiChildrenPictureSchema } from './schema';
import { generateAiChildrenPicture } from './service';

interface Env {}

const app = createHonoApp<Env>();

export const generateAiChildrenPictureTags = ['AI 图片生成'];

export const generateAiChildrenPictureRoutes = app.post(
    '/',
    describeRoute({
        tags: generateAiChildrenPictureTags,
        summary: '生成 AI 儿童绘本图片',
        description: '使用智谱 CogView-4 模型生成儿童绘本风格的图片',
        responses: {
            ...createSuccessResponse(generateAiChildrenPictureResponseSchema),
            ...createValidatorErrorResponse(),
            ...createServerErrorResponse('生成图片失败'),
        },
    }),
    zValidator('json', generateAiChildrenPictureSchema, defaultValidatorErrorHandler),
    async (c) => {
        try {
            const data = c.req.valid('json');
            const result = await generateAiChildrenPicture(data);
            return c.json(result, 200);
        } catch (error) {
            return c.json(createErrorResult('生成图片失败', error), 500);
        }
    },
);
