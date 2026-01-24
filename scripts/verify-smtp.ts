
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
    host: process.env.SMTP_HOST || 'smtp.qq.com',
    port: Number.parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || 'pincman@foxmail.com',
        pass: process.env.SMTP_PASS || '12345678',
    },
};

console.log('Testing SMTP Config with:');
console.log({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
        user: config.auth.user,
        pass: config.auth.pass ? '******' : 'undefined'
    }
});

const transporter = nodemailer.createTransport(config);

transporter.verify(function (error, success) {
    if (error) {
        console.error('Connection failed!');
        console.error(error);
        process.exit(1);
    } else {
        console.log('Server is ready to take our messages');
        process.exit(0);
    }
});
