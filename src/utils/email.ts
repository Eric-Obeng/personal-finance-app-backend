import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessToken = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.MY_EMAIL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken.token ?? "",
    },
  });

  return transporter;
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `"Personal Finance App" <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `Email sent to ${options.email} with subject: ${options.subject}`
    );
  } catch (error) {
    console.error(`Failed to send email to ${options.email}:`, error);
  }
};
