import 'dotenv/config';
import nodemailer from 'nodemailer';
import { generateSecret } from '../otplib/connection';

export async function sendMessage(to: string, subject: string, token: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: to,
      subject: subject,
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">Two-Factor Authentication Setup</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #666; margin-bottom: 15px;">Your verification code is:</p>
              <div style="background-color: #fff; padding: 15px; border-radius: 4px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #333;">
                ${token}
              </div>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 2 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div> `, // HTML body
    });
    console.log('Message sent:', info.messageId);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
