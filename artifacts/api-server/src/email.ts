import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${process.env.APP_URL ?? "http://localhost:5173"}/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: `"ThesisFlow" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Нулиране на парола — ThesisFlow",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #0a192f;">Нулиране на парола</h2>
        <p>Получихме заявка за нулиране на вашата парола.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Нулирай паролата
        </a>
        <p style="color: #94a3b8; font-size: 13px;">Линкът е валиден 1 час. Ако не сте поискали нулиране, игнорирайте този имейл.</p>
      </div>
    `,
  });
}
