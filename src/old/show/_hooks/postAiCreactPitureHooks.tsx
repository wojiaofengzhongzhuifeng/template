import { useRequest } from 'ahooks';
import {
  postAiCreactPicture,
  PostAiCreactPicture,
} from '../_api/postAiCreactPicture';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface PostAiCreactPictureResponse {
  success: boolean;
  message: string;
  data: any;
}

export const usePostAiCreactPitureHooks = () => {
  const { data, error, loading, run } = useRequest<
    PostAiCreactPictureResponse,
    [PostAiCreactPicture]
  >((params: PostAiCreactPicture) => postAiCreactPicture(params), {
    manual: true,
  });

  useEffect(() => {
    if (data && data.success) {
      toast({
        title: '成功',
        description: data.message || '请求成功',
      });
    }
    if (error) {
      toast({
        title: '错误',
        description: error.message || '请求失败',
        variant: 'destructive',
      });
    }
  }, [data, error]);

  return {
    data: data?.data,
    error: error?.message,
    loading,
    success: data?.success || false,
    run: (params: PostAiCreactPicture) => {
      run(params);
    },
  };
};
