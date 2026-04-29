import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@digitalheroes.app";

let resendClient = null;

const getClient = () => {
  if (!RESEND_API_KEY) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }

  return resendClient;
};

export const sendEmail = async ({ to, subject, html }) => {
  const client = getClient();

  if (!client) {
    return { sent: false, skipped: true, reason: "RESEND_API_KEY missing" };
  }

  try {
    const result = await client.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    return { sent: true, result };
  } catch (error) {
    return { sent: false, skipped: true, reason: error.message };
  }
};

export const sendBulkEmail = async ({ recipients, subject, htmlBuilder }) => {
  const uniqueRecipients = [...new Set(recipients.filter(Boolean))];

  if (uniqueRecipients.length === 0) {
    return { sent: 0, skipped: true, reason: "No recipients" };
  }

  const outcomes = [];

  for (const to of uniqueRecipients) {
    try {
      const result = await sendEmail({
        to,
        subject,
        html: htmlBuilder(to),
      });
      outcomes.push({ to, ok: true, result });
    } catch (error) {
      outcomes.push({ to, ok: false, error: error.message });
    }
  }

  return {
    sent: outcomes.filter((x) => x.ok).length,
    failed: outcomes.filter((x) => !x.ok).length,
    outcomes,
  };
};
