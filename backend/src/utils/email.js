import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "The Golf Draw <onboarding@resend.dev>";

// Until a custom domain is verified at resend.com/domains, Resend's sandbox
// only delivers to the account owner's email. Set RESEND_TEST_RECIPIENT to
// redirect ALL emails there during testing. Remove this var in production
// once your domain is verified.
const TEST_RECIPIENT = process.env.RESEND_TEST_RECIPIENT || null;

let resendClient = null;

const getClient = () => {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not set — emails will be skipped");
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
};

/**
 * Sends a single email.
 * In test mode (RESEND_TEST_RECIPIENT set), all emails are redirected to
 * that address with a "[TEST → original@email.com]" subject prefix.
 */
export const sendEmail = async ({ to, subject, html }) => {
  const client = getClient();
  if (!client) return { sent: false, skipped: true, reason: "RESEND_API_KEY missing" };

  const actualTo = TEST_RECIPIENT || to;
  const actualSubject = TEST_RECIPIENT && TEST_RECIPIENT !== to
    ? `[TEST → ${to}] ${subject}`
    : subject;

  try {
    const result = await client.emails.send({
      from: EMAIL_FROM,
      to: actualTo,
      subject: actualSubject,
      html,
    });

    if (result.error) {
      console.error("[Email] Resend API error:", result.error);
      return { sent: false, skipped: false, reason: result.error.message };
    }

    console.log(`[Email] ✓ Sent to ${actualTo} — subject: "${actualSubject}"`);
    return { sent: true, result };
  } catch (error) {
    console.error("[Email] Exception:", error.message);
    return { sent: false, skipped: false, reason: error.message };
  }
};

/**
 * Sends the same email to multiple recipients (sequentially).
 * In test mode, all are collapsed to RESEND_TEST_RECIPIENT.
 */
export const sendBulkEmail = async ({ recipients, subject, htmlBuilder }) => {
  const uniqueRecipients = [...new Set(recipients.filter(Boolean))];

  if (uniqueRecipients.length === 0) {
    return { sent: 0, skipped: true, reason: "No recipients" };
  }

  // In test mode, collapse all recipients to avoid hammering the test inbox
  const toProcess = TEST_RECIPIENT
    ? [uniqueRecipients[0]] // send once, addressed to first, redirected to test inbox
    : uniqueRecipients;

  const outcomes = [];

  for (const to of toProcess) {
    const result = await sendEmail({
      to,
      subject,
      html: htmlBuilder(to),
    });
    outcomes.push({ to, ok: result.sent });
  }

  return {
    sent: outcomes.filter((x) => x.ok).length,
    failed: outcomes.filter((x) => !x.ok).length,
    outcomes,
    testMode: !!TEST_RECIPIENT,
  };
};
