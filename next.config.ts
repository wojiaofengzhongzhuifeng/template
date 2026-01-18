import type { NextConfig } from 'next';

/**
 * Next.js 配置文件
 */
const nextConfig: NextConfig = {
    // 开启 React 严格模式
    reactStrictMode: true,

    // 启用 standalone 输出模式（用于 Docker 部署）
    output: 'standalone',

    // 将部分仅支持 Node.js 的依赖从服务端打包中排除，避免 webpack 对其动态 require 产生告警
    serverExternalPackages: ['bullmq', 'email-templates'],
};

export default nextConfig;
