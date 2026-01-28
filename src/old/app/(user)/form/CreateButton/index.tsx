'use client';

import { CreateButtonIcon } from './icon';
import { CreateButtonProps } from '../pageApi';
import { usePostFormListHooks } from '../_hooks/postFormListHooks';
import { PostFormList } from '../_api/postFormLIst';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateButton({ onSubmit }: CreateButtonProps) {
  const { run, loading, success, data } = usePostFormListHooks();
  const router = useRouter();

  // 监听成功状态，成功后跳转
  useEffect(() => {
    if (success && data) {
      // 将数据存储到 sessionStorage，以便在 show 页面使用
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bookData', JSON.stringify(data));
      }
      // 跳转到 show 页面
      router.push('/show');
    }
  }, [success, data, router]);

  const handleCreate = async () => {
    const formData = onSubmit(); // 这里就是你现在的 FormData（child_age 等）

    // 调试：打印当前要生成绘本时的表单数据
    console.log('CreateButton - 即将生成绘本的表单数据:', formData);

    // 把整份表单对象序列化并编码
    const payload = encodeURIComponent(JSON.stringify(formData));
    console.log('CreateButton - 生成的 payload 字符串:', payload);

    // 用 query 传参
    router.push(`/show?payload=${payload}`);
  };

  return (
    <div className="flex justify-center mt-10">
      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-orange-500 text-white px-14 py-4 rounded-md w-[825px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CreateButtonIcon />
        {loading ? '生成中...' : '生成我的绘本'}
        <CreateButtonIcon />
      </button>
    </div>
  );
}
