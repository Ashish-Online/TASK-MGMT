import transporter from "../config/mail.js";
import { env } from "../config/env.js";

export const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  await transporter.sendMail({
    from: env.SMTP_USER,
    to,
    subject,
    html,
  });
};