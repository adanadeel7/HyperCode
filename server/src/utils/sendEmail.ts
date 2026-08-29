import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });
}

function getFromAddress() {
  return process.env.EMAIL_FROM || process.env.BREVO_SMTP_USER || "no-reply@hypercode.dev";
}


async function sendVerificationEmail(toEmail : string, name : string, verificationToken: string, frontendUrl: string
) {
    const verifyLink = `${frontendUrl}/verify-email?token=${verificationToken}`

    const htmlContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b1324; color: #dae2fb; padding: 30px; border-radius: 10px; border: 1px solid #3a494a;">
      <h1 style="color: #00dce5; text-align: center;">Welcome to HyperCode!</h1>
      <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 14px; color: #808e93;">Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyLink}" style="background-color: #00dce5; color: #003739; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; text-transform: uppercase; font-size: 13px;">
          Verify My Email
        </a>
      </div>
      <p style="font-size: 12px; color: #808e93;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 12px; word-break: break-all; color: #00dce5;">${verifyLink}</p>
      <p style="font-size: 12px; color: #808e93; margin-top: 30px; border-top: 1px solid #3a494a; padding-top: 15px;">This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
    </div>`

    const transporter = getTransporter();
    await transporter.sendMail({
        from: getFromAddress(),
        to: toEmail, 
        subject: "Verify your email address - HyperCode",
        html: htmlContent,
    });
}

async function sendTwoFactorOTPEmail(
    toEmail:string, 
    name: string, 
    otpCode: string
) {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b1324; color: #dae2fb; padding: 30px; border-radius: 10px; border: 1px solid #3a494a;">
      <h1 style="color: #00dce5; text-align: center;">Two-Factor Authentication</h1>
      <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 14px; color: #808e93;">Here is your 6-digit security code to sign in to your HyperCode account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="background-color: #171f31; color: #63f7ff; padding: 15px 30px; font-size: 28px; font-weight: bold; letter-spacing: 6px; border-radius: 8px; border: 1px solid #00dce5; display: inline-block;">
          ${otpCode}
        </span>
      </div>
      <p style="font-size: 13px; color: #e2808e; text-align: center;">This code will expire in <strong>10 minutes</strong>.</p>
      <p style="font-size: 12px; color: #808e93; margin-top: 30px; border-top: 1px solid #3a494a; padding-top: 15px;">If you did not attempt to log in, please secure your account immediately.</p>
    </div>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: getFromAddress(),
    to: toEmail,
    subject: `Your Login Security Code: ${otpCode}`,
    html: htmlContent,
  });
}

export { sendTwoFactorOTPEmail, sendVerificationEmail };