// One-off SMTP connectivity check: node scripts/test-smtp.mjs [recipient]
import nodemailer from "nodemailer";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^"|"$/g, "")];
    }),
);

const to = process.argv[2] ?? env.SMTP_USER;

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: Number(env.SMTP_PORT) === 465,
  requireTLS: Number(env.SMTP_PORT) === 587,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD?.replace(/\s+/g, "") },
  logger: true,
  debug: true,
});

try {
  await transporter.verify();
  console.log("VERIFY OK — SMTP login works");
  const info = await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "SMTP test",
    text: "SMTP connectivity test from t13c-cake.",
  });
  console.log("SEND OK:", info.response);
} catch (error) {
  console.error("SMTP FAILED:", error);
} finally {
  transporter.close();
}
