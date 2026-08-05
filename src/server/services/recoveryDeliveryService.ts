import nodemailer from "nodemailer";

type RecoveryEmailPurpose = "password-recovery" | "recovery-email-verification";

const EMAIL_CONTENT: Record<RecoveryEmailPurpose, { subject: string; message: string }> = {
  "password-recovery": {
    subject: "Administrator password recovery code",
    message:
      "Your Consumer Rep Remuneration Tool administrator recovery code is {{CODE}}. It expires in 10 minutes.",
  },
  "recovery-email-verification": {
    subject: "Verify your administrator recovery email",
    message:
      "Your Consumer Rep Remuneration Tool recovery email verification code is {{CODE}}. It expires in 10 minutes. If you did not request this change, you can ignore this email.",
  },
};

function readSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.replace(/\s+/g, "");
  const from = process.env.SMTP_FROM?.trim();

  if (!host || !Number.isFinite(port) || port <= 0 || !user || !pass || !from) {
    return null;
  }

  return { host, port, user, pass, from };
}

/** Layer 3 — SMTP delivery for administrator recovery emails (CAKE-10). */
export const recoveryDeliveryService = {
  isConfigured(): boolean {
    return Boolean(readSmtpConfig());
  },

  async sendEmail(
    to: string,
    code: string,
    purpose: RecoveryEmailPurpose = "password-recovery",
  ): Promise<void> {
    const config = readSmtpConfig();
    if (!config) {
      throw new Error("SMTP recovery delivery is not configured.");
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      requireTLS: config.port === 587,
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    try {
      const content = EMAIL_CONTENT[purpose];
      await transporter.sendMail({
        from: config.from,
        to,
        subject: content.subject,
        text: content.message.replace("{{CODE}}", code),
      });
    } finally {
      transporter.close();
    }
  },
};
