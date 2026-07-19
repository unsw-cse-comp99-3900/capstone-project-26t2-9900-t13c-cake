import nodemailer from "nodemailer";

const MESSAGE =
  "Your Consumer Rep Remuneration Tool administrator recovery code is {{CODE}}. It expires in 10 minutes.";

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

export const recoveryDeliveryService = {
  isConfigured(): boolean {
    return Boolean(readSmtpConfig());
  },

  async sendEmail(to: string, code: string): Promise<void> {
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
      await transporter.sendMail({
        from: config.from,
        to,
        subject: "Administrator password recovery code",
        text: MESSAGE.replace("{{CODE}}", code),
      });
    } finally {
      transporter.close();
    }
  },
};
