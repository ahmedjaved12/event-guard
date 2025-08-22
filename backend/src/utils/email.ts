import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER!;
const EMAIL_PASS = process.env.EMAIL_PASS!;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Events App";

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error("EMAIL_USER/EMAIL_PASS missing in .env");
}

const transporter = nodemailer.createTransport({
  service: "gmail", // change to SMTP host/port if using SendGrid/Mailgun
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

export async function sendOtpEmail(to: string, code: string, purpose: string) {
  const subject = `[${EMAIL_FROM_NAME}] Your ${purpose} OTP`;
  const text = `Your OTP is: ${code}\nIt expires in ${
    process.env.OTP_EXP_MINUTES || 10
  } minutes.\n\nIf you did not request this, you can ignore the email.`;
  await transporter.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}
