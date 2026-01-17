import type { MailConfig } from '@/libs/mail/types';

export const mailConfig: MailConfig = {
    defaultClient: 'smtp',
    clients: [
        {
            name: 'smtp',
            type: 'smtp',
            options: {
                host: process.env.SMTP_HOST || 'smtp.qq.com',
                port: Number.parseInt(process.env.SMTP_PORT || '465'),
                secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER || 'pincman@foxmail.com',
                    pass: process.env.SMTP_PASS || '12345678',
                },
            },
            default: {
                from: '471412450@qq.com',
            },
        },
        {
            name: 'aliyun',
            type: 'aliyun',
            default: {
                from: 'pincman@mail2.3rcd.com',
                fromName: 'pincman',
                reply: 'pincman@foxtmail.com',
                replyName: 'pincman',
            },
            options: {
                defaultFrom: 'pincman@mail.3rcd.com',
                type: 'access_key',
                accessKeyId: process.env.ALIYUN_KEY || '',
                accessKeySecret: process.env.ALIYUN_SECRET || '',
                endpoint: 'dm.aliyuncs.com',
            },
        },
        {
            name: 'tcloud',
            type: 'tcloud',
            default: { from: 'pincman@mail.3rcd.com' },
            options: {
                credential: {
                    secretId: process.env.TENCENTCLOUD_SECRET_ID || '',
                    secretKey: process.env.TENCENTCLOUD_SECRET_KEY || '',
                },
                region: 'ap-guangzhou',
                profile: {
                    httpProfile: {
                        endpoint: 'ses.tencentcloudapi.com',
                    },
                },
            },
        },
    ],
};
