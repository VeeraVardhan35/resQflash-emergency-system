import nodemailer from 'nodemailer';
import {
  CLIENT_URL,
  MAIL_FROM_EMAIL,
  MAIL_FROM_NAME,
  MAILJET_API_KEY,
  MAILJET_SECRET_KEY,
  MAIL_PROVIDER,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER
} from '../config/env.js';
import logger from '../config/logger.js';

let transporter;

const isMailjet = (MAIL_PROVIDER || '').toLowerCase() === 'mailjet';
const fromName = MAIL_FROM_NAME || 'Team ResQFlash';
const fromEmail = MAIL_FROM_EMAIL || 'noreply@yourdomain.com';
const fromAddress = `"${fromName}" <${fromEmail}>`;
const isGmailSmtp = (SMTP_HOST || '').toLowerCase() === 'smtp.gmail.com';
const smtpPass = isGmailSmtp ? (SMTP_PASS || '').replace(/\s+/g, '') : SMTP_PASS;

const getTransporter = () => {
  if (!transporter) {
    if (isMailjet) {
      transporter = nodemailer.createTransport({
        host: 'in-v3.mailjet.com',
        port: 587,
        secure: false,
        auth: {
          user: MAILJET_API_KEY,
          pass: MAILJET_SECRET_KEY,
        },
      });
      return transporter;
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: smtpPass,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await getTransporter().sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });
    logger.info('Email sent', { to, subject, messageId: info.messageId });
  } catch (err) {
    logger.error('Email send failed', {
      to,
      subject,
      error: err.message,
      code: err.code,
      responseCode: err.responseCode,
      response: err.response,
      command: err.command,
    });
    throw err;
  }
};

export const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to,
    subject: 'Verify your email address',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;">
        <h2>Email Verification</h2>
        <p>Please verify your email. This link expires in <strong>1 hour</strong>.</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:white;text-decoration:none;border-radius:8px;">
          Verify Email
        </a>
        <p style="margin-top:20px;color:#666;font-size:12px;">If you did not register, ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${CLIENT_URL}/reset-password?resetToken=${token}`;
  await sendEmail({
    to,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;">
        <h2>Password Reset</h2>
        <p>Click below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:white;text-decoration:none;border-radius:8px;">
          Reset Password
        </a>
        <p style="margin-top:20px;color:#666;font-size:12px;">If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};
