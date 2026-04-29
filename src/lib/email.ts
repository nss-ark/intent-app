/**
 * Email service with Gmail SMTP (nodemailer).
 *
 * Set EMAIL_PROVIDER="gmail", GMAIL_USER, and GMAIL_APP_PASSWORD in env to enable.
 * Falls back to console logging when not configured.
 */

import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const DEFAULT_FROM = `Intent <${process.env.GMAIL_USER ?? "noreply@intent.community"}>`;

let transporter: nodemailer.Transporter | null = null;
function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

/**
 * Send an email. Uses Gmail SMTP when configured, otherwise logs to console.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const from = options.from ?? DEFAULT_FROM;

  if (process.env.EMAIL_PROVIDER === "gmail" && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transport = getTransporter();
      await transport.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      return true;
    } catch (err) {
      console.error("[email] Gmail SMTP send failed:", err);
      return false;
    }
  }

  // MVP fallback: console log
  console.log(`[email] To: ${options.to} | Subject: ${options.subject}`);
  return true;
}

// ── Fire-and-forget wrapper ──────────────────────────────────────────

/** Send email without blocking the caller */
export function sendEmailAsync(options: EmailOptions) {
  sendEmail(options).catch((err) =>
    console.error("[email] Async send failed:", err)
  );
}

// ── Email Templates ──────────────────────────────────────────────────

const baseUrl = process.env.NEXTAUTH_URL ?? "https://intent.community";

export function welcomeEmail(name: string, tenantName: string): EmailOptions & { to: string } {
  const firstName = name.split(" ")[0];
  return {
    to: "", // caller sets this
    subject: `Welcome to Intent, ${firstName}!`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #F7F8FB;">
        <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <h1 style="color: #1A1A1A; font-size: 24px; margin: 0 0 16px;">Welcome to Intent</h1>
          <p style="color: #6B6B66; font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
            Hi ${firstName},
          </p>
          <p style="color: #6B6B66; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            Your ${tenantName} community account is ready. Start by completing your profile
            and sending your first nudge to someone whose work aligns with yours.
          </p>
          <a href="${baseUrl}/home"
             style="display: inline-block; padding: 14px 32px; background: #1B3A5F; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
            Explore your community
          </a>
        </div>
        <p style="color: #6B6B66; font-size: 12px; margin-top: 24px; text-align: center;">
          Intent &middot; Community networking for universities
        </p>
      </div>
    `,
  };
}

export function otpEmail(name: string, code: string): Omit<EmailOptions, "to"> {
  const firstName = name.split(" ")[0];
  return {
    subject: `${code} is your Intent verification code`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #F7F8FB;">
        <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <h1 style="color: #1A1A1A; font-size: 24px; margin: 0 0 16px;">Verify your email</h1>
          <p style="color: #6B6B66; font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
            Hi ${firstName},
          </p>
          <p style="color: #6B6B66; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            Use the code below to verify your email address and complete your Intent signup.
          </p>
          <div style="text-align: center; margin: 0 0 24px; padding: 20px; background: #F7F8FB; border-radius: 12px; border: 1px solid #D8DCE5;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1A1A1A;">${code}</span>
          </div>
          <p style="color: #6B6B66; font-size: 14px; line-height: 1.6; margin: 0;">
            This code expires in 10 minutes. If you didn&rsquo;t request this, you can safely ignore this email.
          </p>
        </div>
        <p style="color: #6B6B66; font-size: 12px; margin-top: 24px; text-align: center;">
          Intent &middot; Community networking for universities
        </p>
      </div>
    `,
  };
}

export function nudgeNotificationEmail(
  receiverName: string,
  senderName: string,
  signal: string,
  nudgePreview: string
): Omit<EmailOptions, "to"> {
  const firstName = receiverName.split(" ")[0];
  return {
    subject: `${senderName} sent you a nudge on Intent`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #F7F8FB;">
        <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <h1 style="color: #1A1A1A; font-size: 24px; margin: 0 0 16px;">New nudge</h1>
          <p style="color: #6B6B66; font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
            Hi ${firstName},
          </p>
          <p style="color: #6B6B66; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
            <strong style="color: #1A1A1A;">${senderName}</strong> reached out about
            <span style="color: #1B3A5F; font-weight: 600;">${signal}</span>.
          </p>
          <div style="margin: 0 0 24px; padding: 16px; background: #F7F8FB; border-radius: 12px; border: 1px solid #D8DCE5;">
            <p style="color: #1A1A1A; font-size: 14px; line-height: 1.5; margin: 0; font-style: italic;">
              &ldquo;${nudgePreview}&rdquo;
            </p>
          </div>
          <a href="${baseUrl}/inbox"
             style="display: inline-block; padding: 14px 32px; background: #1B3A5F; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
            View in Intent
          </a>
        </div>
        <p style="color: #6B6B66; font-size: 12px; margin-top: 24px; text-align: center;">
          Intent &middot; Community networking for universities
        </p>
      </div>
    `,
  };
}

export function verificationApprovedEmail(name: string, badgeName: string): Omit<EmailOptions, "to"> {
  const firstName = name.split(" ")[0];
  return {
    subject: `Your ${badgeName} badge has been verified`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #F7F8FB;">
        <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
          <h1 style="color: #1A1A1A; font-size: 24px; margin: 0 0 16px;">Badge verified</h1>
          <p style="color: #6B6B66; font-size: 16px; line-height: 1.6; margin: 0 0 12px;">
            Hi ${firstName},
          </p>
          <p style="color: #6B6B66; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            Your <strong style="color: #2D4A3A;">${badgeName}</strong> badge has been verified
            and is now visible on your profile.
          </p>
          <a href="${baseUrl}/my-profile"
             style="display: inline-block; padding: 14px 32px; background: #1B3A5F; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
            View your profile
          </a>
        </div>
      </div>
    `,
  };
}
