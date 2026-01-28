import { toast } from '@/hooks/use-toast';
import { PostFormList, postFormList } from '../_api/postFormLIst';
import { useRequest } from 'ahooks';
import { useEffect } from 'react';

interface PostFormListResponse {
  success: boolean;
  message: string;
  data: any;
}

export const usePostFormListHooks = () => {
  const { data, error, loading, run } = useRequest<
    PostFormListResponse,
    [PostFormList]
  >((params: PostFormList) => postFormList(params), {
    manual: true, // 手动触发，不自动执行
  });

  useEffect(() => {
    console.log('data', data);
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
    run: (params: PostFormList) => {
      run(params);
    },
  };
};
