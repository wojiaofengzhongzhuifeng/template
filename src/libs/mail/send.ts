import type { SendEmailRequest as DefaultTencentSendOptions } from 'tencentcloud-sdk-nodejs-ses/tencentcloud/services/ses/v20201002/ses_models';

import * as AliyunSender from '@alicloud/dm20151123';
import * as AliyunUtil from '@alicloud/tea-util';
import Email from 'email-templates';
import { isNil } from 'lodash';
import path from 'node:path';

import type {
    AliyunMailClient,
    AliyunSendMailOptions,
    SmtpMailClient,
    SmtpSendMailOptions,
    TencentCloudSendMailOptions,
    TencentMailClient,
} from './types';

import { deepMerge } from '../utils';

/**
 * email-templates 实例
 */
const emailTemplates = new Email({
    send: false,
    views: {
        root: path.join(process.cwd(), 'files/email-templates'),
        options: {
            extension: 'pug',
        },
    },
});

/**
 * 发送 SMTP 邮件
 * @param params
 * @param options
 */
export const sendSmtpMail = async (params: SmtpMailClient, options: SmtpSendMailOptions) => {
    const { others, templatePath, vars, ...rest } = options;
    const newOptions: Record<string, any> = deepMerge(
        {
            ...rest,
            from: options.from ?? params.default.from,
            replyTo: options.reply ?? params.default.reply,
            ...others,
        },
        options.others ?? {},
        'replace',
    );

    newOptions.html = await emailTemplates.render(`${templatePath.toString()}/html`, vars);
    newOptions.text = await emailTemplates.render(`${templatePath.toString()}/text`, vars);

    return params.client.sendMail(newOptions);
};

/**
 * 发送腾讯云邮件
 * @param params
 * @param options
 */
export const sendTencentMail = async (
    params: TencentMailClient,
    options: TencentCloudSendMailOptions,
) => {
    const newOptions: DefaultTencentSendOptions = deepMerge(
        {
            FromEmailAddress: options.from ?? params.default.from,
            Destination: options.to,
            Subject: options.subject,
            ReplyToAddresses: options.reply,
            Cc: options.cc,
            Bcc: options.bcc,
        },
        options.others ?? {},
        'replace',
    ) as DefaultTencentSendOptions;

    newOptions.Template = {
        TemplateID: Number(options.templateId),
        TemplateData: JSON.stringify(options.vars),
    };
    return params.client.SendEmail(newOptions);
};

/**
 * 发送阿里云邮件
 * @param params
 * @param options
 */
export const sendAliyunMail = async (params: AliyunMailClient, options: AliyunSendMailOptions) => {
    const newOptions: Record<string, any> = deepMerge(
        {
            accountName: options.from ?? params.default.from,
            fromAlias: options.fromName ?? params.default.fromName,
            addressType: options.others?.addressType ?? 1,
            toAddress: options.to.join(','),
            subject: options.subject,
            replyToAddress: !isNil(options.reply) || !isNil(params.default.reply),
            replyAddress: options.reply ?? params.default.reply,
            replyAddressAlias: options.replyName ?? params.default.replyName,
            ...options.others,
        },
        options.others ?? {},
        'replace',
    );
    if ('templateId' in options) {
        newOptions.template = new AliyunSender.SingleSendMailRequestTemplate({
            templateData: options.vars,
            templateId: options.templateId,
        });
    } else if ('templatePath' in options) {
        newOptions.htmlBody = await emailTemplates.render(
            `${options.templatePath.toString()}/html`,
            options.vars,
        );
        newOptions.textBody = await emailTemplates.render(
            `${options.templatePath.toString()}/text`,
            options.vars,
        );
    }
    const singleSendMailRequest = new AliyunSender.SingleSendMailRequest(newOptions);
    const runtime = new AliyunUtil.RuntimeOptions({});
    return params.client.singleSendMailWithOptions(singleSendMailRequest, runtime);
};
