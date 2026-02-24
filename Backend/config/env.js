import {config} from 'dotenv';

config({path : `.env.${process.env.NODE_ENV || 'development'}.local`});
export const {
    PORT,
    NODE_ENV,
    REDIS_URL,
    UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN,
    MONGO_URI,
    JWT_ACCESS_EXPIRES,
    JWT_REFRESH_EXPIRES,
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    SMTP_HOST,
    SMTP_USER,
    SMTP_PORT,
    SMTP_PASS,
    CLIENT_URL,
    MAIL_PROVIDER,
    MAILJET_API_KEY,
    MAILJET_SECRET_KEY,
    MAIL_FROM_EMAIL,
    MAIL_FROM_NAME
} 
= process.env;
