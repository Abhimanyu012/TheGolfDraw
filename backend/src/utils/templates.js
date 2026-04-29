
/**
 * Common style constants for the email templates
 */
const COLORS = {
  bg: "#05050A",
  card: "#12121A",
  emerald: "#4CAF7A",
  gold: "#D4AF37",
  text: "#FFFFFF",
  muted: "#A0A0A0",
  border: "#2A2A35"
};

const BASE_STYLES = `
  body { 
    background-color: ${COLORS.bg}; 
    color: ${COLORS.text}; 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
    margin: 0; 
    padding: 0; 
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    padding: 40px 20px; 
  }
  .card { 
    background-color: ${COLORS.card}; 
    border: 1px solid ${COLORS.border}; 
    border-radius: 24px; 
    padding: 40px; 
    text-align: center;
  }
  .logo { 
    font-size: 24px; 
    font-weight: 800; 
    color: ${COLORS.text}; 
    margin-bottom: 32px;
    letter-spacing: -0.02em;
  }
  .logo span { color: ${COLORS.emerald}; }
  h1 { 
    font-size: 32px; 
    font-weight: 700; 
    margin-bottom: 16px; 
    color: ${COLORS.text}; 
    letter-spacing: -0.03em;
  }
  p { 
    font-size: 16px; 
    line-height: 1.6; 
    color: ${COLORS.muted}; 
    margin-bottom: 32px;
  }
  .btn { 
    display: inline-block; 
    background-color: ${COLORS.emerald}; 
    color: ${COLORS.bg} !important; 
    padding: 16px 32px; 
    border-radius: 12px; 
    text-decoration: none; 
    font-weight: 700; 
    font-size: 16px;
    transition: transform 0.2s ease;
  }
  .footer { 
    margin-top: 40px; 
    font-size: 12px; 
    color: ${COLORS.muted}; 
    text-align: center;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
`;

/**
 * Generates the Welcome email HTML
 */
export const welcomeTemplate = ({ fullName, dashboardUrl }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">The Golf <span>Draw</span></div>
      <h1>Welcome to the Club, ${fullName.split(' ')[0]}</h1>
      <p>
        Your membership is now active. You've joined a community where performance 
        meets purpose. You can now track your scores, participate in monthly 
        draws, and see the real-world impact of your contributions.
      </p>
      <a href="${dashboardUrl}" class="btn">Enter Your Dashboard</a>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} The Golf Draw Platform. Private & Secure.
    </div>
  </div>
</body>
</html>
`;

/**
 * Generates the Password Reset email HTML
 */
export const resetPasswordTemplate = ({ fullName, resetUrl }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">The Golf <span>Draw</span></div>
      <h1>Secure Your Access</h1>
      <p>
        Hello ${fullName.split(' ')[0]}, we received a request to reset your password. 
        Click the button below to secure your account with new credentials. 
        This link will expire in 60 minutes.
      </p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p style="margin-top: 32px; font-size: 12px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      Account Security · The Golf Draw
    </div>
  </div>
</body>
</html>
`;

/**
 * Generates the Draw Results email HTML
 */
export const drawResultsTemplate = ({ fullName, month, year, winningNumbers, dashboardUrl }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">The Golf <span>Draw</span></div>
      <h1>Results are In: ${month} ${year}</h1>
      <p>
        Hello ${fullName.split(' ')[0]}, the results for the latest draw cycle are now live. 
        The winning numbers for this month are:
      </p>
      <div style="margin: 32px 0; display: flex; justify-content: center; gap: 8px;">
        ${winningNumbers.map(n => `<span style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 50%; background: ${COLORS.bg}; border: 1px solid ${COLORS.border}; color: ${COLORS.emerald}; font-weight: 700; margin: 0 4px;">${n}</span>`).join('')}
      </div>
      <p>Log in to your dashboard to see if you matched and view the total charity impact for this cycle.</p>
      <a href="${dashboardUrl}" class="btn">Check My Results</a>
    </div>
    <div class="footer">
      Monthly Draw Results · The Golf Draw
    </div>
  </div>
</body>
</html>
`;

/**
 * Generates the Winner Notification email HTML
 */
export const winnerNotificationTemplate = ({ fullName, month, year, matchCount, amount, uploadUrl }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card" style="border-color: ${COLORS.gold};">
      <div class="logo">The Golf <span>Draw</span></div>
      <h1 style="color: ${COLORS.gold};">🏆 Congratulations, ${fullName.split(' ')[0]}!</h1>
      <p>
        You are a winner in the ${month} ${year} draw. 
        You matched <strong>${matchCount}</strong> numbers, securing a provisional prize of:
      </p>
      <div style="font-size: 48px; font-weight: 800; color: ${COLORS.text}; margin: 24px 0;">
        ₹${amount}
      </div>
      <p>
        To claim your prize, please upload your proof of scores through your dashboard 
        for verification by our administrative team.
      </p>
      <a href="${uploadUrl}" class="btn" style="background-color: ${COLORS.gold}; color: black !important;">Upload Proof of Scores</a>
    </div>
    <div class="footer">
      Official Winner Notification · The Golf Draw
    </div>
  </div>
</body>
</html>
`;

/**
 * Generates the Subscription Activated email HTML
 */
export const subscriptionTemplate = ({ fullName, plan, amount, renewsAt, dashboardUrl }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">The Golf <span>Draw</span></div>
      <h1>Membership Activated</h1>
      <p>
        Hello ${fullName.split(' ')[0]}, your ${plan} membership is now active. 
        You have unlocked full access to score tracking, premium analytics, 
        and monthly prize draws.
      </p>
      <div style="background: ${COLORS.bg}; border: 1px solid ${COLORS.border}; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: left;">
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span style="color: ${COLORS.muted}; font-size: 13px; text-transform: uppercase;">Plan</span>
          <span style="color: ${COLORS.text}; font-weight: 700;">${plan}</span>
        </div>
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span style="color: ${COLORS.muted}; font-size: 13px; text-transform: uppercase;">Amount Paid</span>
          <span style="color: ${COLORS.text}; font-weight: 700;">₹${amount}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: ${COLORS.muted}; font-size: 13px; text-transform: uppercase;">Next Renewal</span>
          <span style="color: ${COLORS.text}; font-weight: 700;">${renewsAt}</span>
        </div>
      </div>
      <p>Thank you for supporting our charity partners through your membership.</p>
      <a href="${dashboardUrl}" class="btn">Access Dashboard</a>
    </div>
    <div class="footer">
      Membership Confirmation · The Golf Draw
    </div>
  </div>
</body>
</html>
`;

/**
 * Generates the Admin Broadcast email HTML
 */
export const broadcastTemplate = ({ fullName, subject, message, actionUrl, actionText }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">The Golf <span>Draw</span></div>
      <h1>${subject}</h1>
      <p>Hello ${fullName.split(' ')[0]},</p>
      <p style="text-align: left; background: ${COLORS.bg}; padding: 24px; border-radius: 16px; border: 1px solid ${COLORS.border};">
        ${message}
      </p>
      ${actionUrl ? `<a href="${actionUrl}" class="btn" style="margin-top: 32px;">${actionText || 'View Details'}</a>` : ''}
    </div>
    <div class="footer">
      Official Platform Update · The Golf Draw
    </div>
  </div>
</body>
</html>
`;

/**
 * Generates the Winner Review Status email HTML
 */
export const winnerReviewTemplate = ({ fullName, month, year, status, payoutStatus, amount, dashboardUrl }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">The Golf <span>Draw</span></div>
      <h1>Prize Status Updated</h1>
      <p>
        Hello ${fullName.split(' ')[0]}, the verification status for your 
        <strong>${month} ${year}</strong> prize has been updated.
      </p>
      <div style="background: ${COLORS.bg}; border: 1px solid ${COLORS.border}; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: left;">
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span style="color: ${COLORS.muted}; font-size: 13px; text-transform: uppercase;">Prize Amount</span>
          <span style="color: ${COLORS.text}; font-weight: 700;">₹${amount}</span>
        </div>
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span style="color: ${COLORS.muted}; font-size: 13px; text-transform: uppercase;">Verification</span>
          <span style="${status === 'APPROVED' ? 'color: ' + COLORS.emerald : 'color: #EF4444'}; font-weight: 700;">${status}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: ${COLORS.muted}; font-size: 13px; text-transform: uppercase;">Payout Status</span>
          <span style="color: ${COLORS.text}; font-weight: 700;">${payoutStatus}</span>
        </div>
      </div>
      <p>Visit your dashboard for more details or to contact support regarding this update.</p>
      <a href="${dashboardUrl}" class="btn">View My Winnings</a>
    </div>
    <div class="footer">
      Verification Update · The Golf Draw
    </div>
  </div>
</body>
</html>
`;

/**
 * Generates a Generic Notification email HTML
 */
export const notificationTemplate = ({ fullName, title, message, actionUrl, actionText }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">The Golf <span>Draw</span></div>
      <h1>${title}</h1>
      <p>Hello ${fullName.split(' ')[0]},</p>
      <p>${message}</p>
      ${actionUrl ? `<a href="${actionUrl}" class="btn">${actionText || 'Take Action'}</a>` : ''}
    </div>
    <div class="footer">
      Notification · The Golf Draw
    </div>
  </div>
</body>
</html>
`;
