# 第一阶段：安装依赖
FROM docker.m.daocloud.io/library/node:20-alpine AS deps

# 使用阿里云 Alpine 镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 配置淘宝 npm 镜像（必须在 corepack 之前配置）
RUN npm config set registry https://registry.npmmirror.com

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 第二阶段：构建应用
FROM docker.m.daocloud.io/library/node:20-alpine AS builder

WORKDIR /app

# 配置淘宝 npm 镜像
RUN npm config set registry https://registry.npmmirror.com

RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 生成 Prisma 客户端（提供虚拟 DATABASE_URL，仅用于生成客户端，不实际连接）
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN pnpm dbg

# 构建应用
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# 第三阶段：运行应用
FROM docker.m.daocloud.io/library/node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 复制 Prisma 相关文件
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
