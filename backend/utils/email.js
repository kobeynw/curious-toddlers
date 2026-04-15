const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const APP_NAME = 'Curious Toddlers';
const FRONTEND_URL = () => process.env.FRONTEND_URL || 'http://localhost:5173';
const FROM = () => process.env.EMAIL_FROM || `${APP_NAME} <noreply@curioustoddlers.com>`;

function buildHtml({ heading, greeting, message, ctaText, ctaUrl, footer }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #faf8f5; padding: 32px 16px;">
  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 32px; border: 1px solid #e8e2d9;">
    <h1 style="color: #2c2c2c; font-size: 20px; margin: 0 0 8px;">${heading}</h1>
    <p style="color: #555; font-size: 15px; margin: 0 0 16px;">${greeting}</p>
    <p style="color: #555; font-size: 15px; margin: 0 0 24px;">${message}</p>
    <a href="${ctaUrl}" style="display: inline-block; background: #c4704b; color: #faf8f5; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px;">${ctaText}</a>
    <p style="color: #999; font-size: 13px; margin: 24px 0 0;">${footer}</p>
    <hr style="border: none; border-top: 1px solid #e8e2d9; margin: 24px 0 16px;" />
    <p style="color: #999; font-size: 12px; margin: 0;">${APP_NAME}</p>
  </div>
</body>
</html>`.trim();
}

async function sendVerificationEmail(to, name, token) {
  const url = `${FRONTEND_URL()}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM(),
    to,
    subject: `Verify your ${APP_NAME} email`,
    text: `Hi ${name},\n\nPlease verify your email by visiting the link below:\n\n${url}\n\nThis link expires in 24 hours.\n\n${APP_NAME}`,
    html: buildHtml({
      heading: APP_NAME,
      greeting: `Hi ${name},`,
      message: 'Please verify your email address to get started.',
      ctaText: 'Verify Email',
      ctaUrl: url,
      footer: 'This link expires in 24 hours.',
    }),
  });
}

async function sendPasswordResetEmail(to, name, token) {
  const url = `${FRONTEND_URL()}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: FROM(),
    to,
    subject: `Reset your ${APP_NAME} password`,
    text: `Hi ${name},\n\nWe received a request to reset your password. Visit the link below to set a new password:\n\n${url}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.\n\n${APP_NAME}`,
    html: buildHtml({
      heading: APP_NAME,
      greeting: `Hi ${name},`,
      message: 'We received a request to reset your password. Click the button below to set a new password.',
      ctaText: 'Reset Password',
      ctaUrl: url,
      footer: 'This link expires in 1 hour. If you didn\'t request this, you can safely ignore this email.',
    }),
  });
}

module.exports = { transporter, sendVerificationEmail, sendPasswordResetEmail };
