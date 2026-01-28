import { ApiConfig, request } from '@/app/(user)/form/_api/common';

export interface PostAiCreactPicture {
  prompt: string;
  model: string;
  size: string;
  sceneIndex?: number;
}

const postAiCreactPictureApiConfig: ApiConfig = {
  url: '/api/generate-ai-children-picture',
  method: 'POST',
  manual: false,
  showError: true,
};

export const postAiCreactPicture = async (data: PostAiCreactPicture) => {
  try {
    const response = await request(
      postAiCreactPictureApiConfig.url,
      postAiCreactPictureApiConfig.method,
      data
    );
    return {
      success: true,
      message: '请求成功',
      data: response,
    };
  } catch (error: any) {
    console.error('API 请求错误:', error);
    throw new Error(error.message || '请求失败');
  }
};
