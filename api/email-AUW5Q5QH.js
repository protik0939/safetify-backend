// src/app/utills/email.ts
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var transporter = null;
async function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (user && pass) {
    console.log("[Email] Initializing SMTP Transporter with configured credentials...");
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      },
      connectionTimeout: 3e3,
      greetingTimeout: 3e3,
      socketTimeout: 3e3,
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    console.warn("[Email] SMTP credentials not provided. Falling back to Ethereal test account...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Email] Ethereal test account created: User=${testAccount.user}`);
    } catch (err) {
      console.error("[Email] Failed to create Ethereal test account, email sending will log to console:", err);
      transporter = {
        sendMail: async (options) => {
          console.log("[Email Dummy Transporter] Logged email content:", options);
          return { messageId: "dummy-id-" + Date.now() };
        }
      };
    }
  }
  return transporter;
}
async function sendVerificationEmail(to, otp) {
  const mailTransporter = await getTransporter();
  const logoPath = path.join(__dirname, "../assets/logo.png");
  const attachments = [];
  const hasLogo = fs.existsSync(logoPath);
  if (hasLogo) {
    attachments.push({
      filename: "logo.png",
      path: logoPath,
      cid: "logo"
    });
  }
  const fromName = process.env.SMTP_FROM_NAME || "Safetify";
  const fromEmail = process.env.SMTP_FROM_EMAIL || "no-reply@safetify.com";
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6fa; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6fa; padding: 40px 0;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border-top: 6px solid #f09129; box-shadow: 0 4px 12px rgba(30, 49, 95, 0.06); border-left: 1px solid rgba(30, 49, 95, 0.08); border-right: 1px solid rgba(30, 49, 95, 0.08); border-bottom: 1px solid rgba(30, 49, 95, 0.08);">
          <!-- Header (Logo & Brand Name) -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              ${hasLogo ? `<img src="cid:logo" alt="Safetify Logo" style="width: 72px; height: 72px; display: block; margin: 0 auto 12px auto; border-radius: 16px;" />` : ""}
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #1e315f; letter-spacing: -0.5px;">Safetify</h1>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 20px 40px 30px 40px; text-align: left; color: #475569; font-size: 16px; line-height: 1.6;">
              <p style="margin-top: 0; color: #1e315f; font-weight: 600; font-size: 18px;">Verify your email address</p>
              <p style="margin-bottom: 24px;">Thank you for choosing Safetify! To complete your email verification and secure your account, please use the 8-digit verification code below:</p>
              
              <!-- OTP Box -->
              <div style="background-color: #fff7ed; border: 1px dashed #f09129; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #f09129; letter-spacing: 6px; display: inline-block; padding-left: 6px;">${otp}</span>
              </div>
              
              <p style="margin-top: 24px; font-size: 14px; color: #64748b;">This code is valid for <strong>15 minutes</strong>. If you did not request this verification, you can safely ignore this email.</p>
            </td>
          </tr>

          <!-- Security Banner -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="font-size: 13px; color: #475569; line-height: 1.5; text-align: left;">
                    <strong>\u{1F6E1}\uFE0F Security Reminder:</strong> Safetify support will never ask for your verification code or password over email, phone, or chat. Please keep this code private and do not share it with anyone.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer divider -->
          <tr>
            <td style="padding: 10px 40px 0 40px;">
              <div style="border-top: 1px solid #e2e8f0; height: 1px;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">This is an automated message, please do not reply directly to this email.</p>
              <p style="margin: 0;">&copy; 2026 Safetify. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `\u{1F510} Verify your Safetify Account - ${otp}`,
    text: `Your Safetify 8-digit verification code is: ${otp}. It expires in 15 minutes.`,
    html: htmlContent,
    attachments
  };
  try {
    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`[Email] Verification email successfully sent to ${to}. MessageId: ${info.messageId}`);
    const testUrl = nodemailer.getTestMessageUrl(info);
    if (testUrl) {
      console.log(`[Email] Ethereal Preview URL: ${testUrl}`);
    }
    return info;
  } catch (error) {
    console.error(`[Email] Error occurred while sending email to ${to}:`, error);
    throw error;
  }
}
export {
  getTransporter,
  sendVerificationEmail
};
