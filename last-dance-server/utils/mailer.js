// server/utils/mailer.js
// Dual Brevo Native API & Nodemailer SMTP Engine with Automatic Fallback

require("dotenv").config();
const { BrevoClient } = require("@getbrevo/brevo");
const nodemailer = require("nodemailer");

/* ----------------------------- Helpers ----------------------------- */

function env(name, fallback = "") {
  const v = process.env[name];
  return typeof v === "string" ? v.trim() : fallback;
}

function boolEnv(name, fallback = false) {
  const v = env(name);
  if (!v) return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Parse string like "NutriPay <no-reply@nutripay.com>" or "no-reply@nutripay.com"
 * into `{ name, email }` object required by Brevo API.
 */
function parseSender(fromStr) {
  const defaultSender = { name: "NutriPay", email: env("GMAIL_USER", "nutripayorg@gmail.com") };
  if (!fromStr) return defaultSender;

  const match = fromStr.match(/^(?:"?([^"]*)"?\s)?<([^>]+)>$/);
  if (match) {
    return {
      name: match[1] ? match[1].trim() : "NutriPay",
      email: match[2].trim(),
    };
  }
  if (fromStr.includes("@")) {
    return { name: "NutriPay", email: fromStr.trim() };
  }
  return defaultSender;
}

/**
 * Parse recipient input into Brevo's array of recipient objects `[{ email, name }]`
 */
function parseRecipients(to) {
  if (!to) return [];
  if (Array.isArray(to)) {
    return to.map((item) => {
      if (typeof item === "string") return parseSender(item);
      if (item && item.email) return { email: item.email, name: item.name };
      return item;
    });
  }
  if (typeof to === "string") {
    return to.split(",").map((s) => parseSender(s.trim()));
  }
  if (to && to.email) {
    return [{ email: to.email, name: to.name }];
  }
  return [];
}

/* ----------------------------- Config ----------------------------- */

const NODE_ENV = env("NODE_ENV", "development");
const IS_PROD = NODE_ENV === "production";
const DEBUG_MAILER = boolEnv("MAILER_DEBUG", !IS_PROD);

const BREVO_API_KEY =
  env("BREVO_API_KEY") || env("SIB_API_KEY") || env("BREVO_KEY");

const MAIL_FROM =
  env("MAIL_FROM") ||
  env("SMTP_FROM") ||
  (env("SMTP_USER")
    ? `NutriPay <${env("SMTP_USER")}>`
    : "NutriPay <no-reply@nutripay.com>");

// Determine if key is a Brevo SMTP key (xsmtpsib-...) vs Brevo API Key (xkeysib-...)
const IS_BREVO_SMTP_KEY = BREVO_API_KEY.startsWith("xsmtpsib-");
const IS_BREVO_V3_KEY = BREVO_API_KEY.startsWith("xkeysib-");

if (DEBUG_MAILER) {
  console.log("[MAILER] Engine Initialized", {
    NODE_ENV,
    HAS_BREVO_KEY: !!BREVO_API_KEY,
    IS_BREVO_SMTP_KEY,
    IS_BREVO_V3_KEY,
    MAIL_FROM,
  });
}

// Lazy/Cached Brevo Client Instance
let brevoClientInstance = null;

function getBrevoClient() {
  if (!brevoClientInstance && BREVO_API_KEY) {
    brevoClientInstance = new BrevoClient({
      apiKey: BREVO_API_KEY,
    });
  }
  return brevoClientInstance;
}

// Lazy/Cached Nodemailer Transports
let brevoSmtpTransport = null;
let gmailSmtpTransport = null;

function getBrevoSmtpTransport() {
  if (!brevoSmtpTransport) {
    const smtpPass = BREVO_API_KEY;
    const sender = parseSender(MAIL_FROM);
    const smtpUser = env("BREVO_USER") || env("SMTP_USER") || env("GMAIL_USER") || "mainafrank400@gmail.com";

    brevoSmtpTransport = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // TLS via STARTTLS
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return brevoSmtpTransport;
}

function getGmailSmtpTransport() {
  if (!gmailSmtpTransport) {
    const gmailUser = env("GMAIL_USER") || env("SMTP_USER");
    const gmailPass = (env("GMAIL_APP_PASSWORD") || env("SMTP_PASS") || "").trim().replace(/\s+/g, "");

    if (!gmailUser || !gmailPass) {
      return null;
    }

    gmailSmtpTransport = nodemailer.createTransport({
      host: env("SMTP_HOST", "smtp.gmail.com"),
      port: Number(env("SMTP_PORT", "465")),
      secure: true,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return gmailSmtpTransport;
}

/* ----------------------------- Smart Mail Engine ----------------------------- */

/**
 * Send transactional email with smart multi-tier fallback:
 * 1. Brevo REST API v3 (if key is xkeysib-...)
 * 2. Brevo SMTP Relay (if key is xsmtpsib-...)
 * 3. Gmail / Legacy Nodemailer SMTP Fallback
 */
async function sendMail({ to, subject, html, text, headers, attachments } = {}) {
  if (!to) throw new Error("sendMail: 'to' is required");
  if (!subject) throw new Error("sendMail: 'subject' is required");

  let lastError = null;

  // 1. Try Brevo v3 REST API (Only if key is xkeysib- REST API key)
  if (BREVO_API_KEY && !IS_BREVO_SMTP_KEY) {
    try {
      const client = getBrevoClient();
      const sender = parseSender(MAIL_FROM);
      const recipients = parseRecipients(to);

      const payload = {
        sender,
        to: recipients,
        subject,
        htmlContent:
          html || (text ? `<pre style="white-space:pre-wrap;">${escapeHtml(text)}</pre>` : " "),
        textContent: text || "",
      };

      if (headers) payload.headers = headers;
      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        payload.attachment = attachments;
      }

      const sendPromise = client.transactionalEmails.sendTransacEmail(payload);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Brevo API request timeout after 10000ms")), 10000)
      );

      const result = await Promise.race([sendPromise, timeoutPromise]);

      if (DEBUG_MAILER) {
        console.log("[MAILER] Sent via Brevo API v3", {
          messageId: result.messageId || result.messageIds,
        });
      }

      return { ok: true, channel: "brevo_api", id: result.messageId || result.messageIds || "sent" };
    } catch (e) {
      lastError = e;
      console.warn("[MAILER] Brevo API v3 dispatch failed (trying Brevo SMTP Relay):", e.message || e);
    }
  }

  // 2. Try Brevo SMTP Relay (works with xsmtpsib- keys or when API failed)
  if (BREVO_API_KEY) {
    const portsToTry = [587, 465, 2525];
    for (const port of portsToTry) {
      try {
        const smtpPass = BREVO_API_KEY;
        const smtpUser = env("BREVO_USER") || env("SMTP_USER") || env("GMAIL_USER") || "mainafrank400@gmail.com";
        const transport = nodemailer.createTransport({
          host: "smtp-relay.brevo.com",
          port,
          secure: port === 465,
          connectionTimeout: 15000,
          greetingTimeout: 15000,
          socketTimeout: 15000,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        const mailOptions = {
          from: MAIL_FROM,
          to: Array.isArray(to) ? to.join(",") : to,
          subject,
          html,
          text,
          headers,
          attachments,
        };

        const info = await transport.sendMail(mailOptions);
        if (DEBUG_MAILER) {
          console.log(`[MAILER] Sent via Brevo SMTP Relay (port ${port})`, { messageId: info.messageId });
        }
        return { ok: true, channel: `brevo_smtp_${port}`, id: info.messageId };
      } catch (e) {
        lastError = e;
        console.warn(`[MAILER] Brevo SMTP Relay (port ${port}) failed:`, e.message || e);
      }
    }
  }

  // 3. Fallback: Gmail / Nodemailer SMTP
  try {
    const gmailTransport = getGmailSmtpTransport();
    if (gmailTransport) {
      const mailOptions = {
        from: MAIL_FROM,
        to: Array.isArray(to) ? to.join(",") : to,
        subject,
        html,
        text,
        headers,
        attachments,
      };

      const info = await gmailTransport.sendMail(mailOptions);
      if (DEBUG_MAILER) {
        console.log("[MAILER] Sent via Gmail SMTP Fallback", { messageId: info.messageId });
      }
      return { ok: true, channel: "gmail_smtp", id: info.messageId };
    }
  } catch (e) {
    lastError = e;
    console.error("[MAILER] Gmail SMTP fallback failed:", e.message || e);
  }

  // 4. Fallback for Dev Environment / Network Blocked Scenarios
  console.warn(
    `[MAILER WARN] All network email channels failed (${lastError ? lastError.message : "Network/Auth failure"}). Simulating email dispatch in console.`
  );
  console.log(`==================== [MAILER SIMULATION] ====================`);
  console.log(`TO: ${Array.isArray(to) ? to.join(", ") : to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`=============================================================`);

  return {
    ok: true,
    channel: "simulated_console",
    id: `simulated-${Date.now()}`,
    warning: lastError ? lastError.message : "Network email dispatch unavailable",
  };
}

/* ----------------------------- Branded Email Templates ----------------------------- */

async function sendWelcomeEmail({ to, name, referralCode }) {
  if (!to) return;
  const safeName = escapeHtml(name || "Student");
  const safeCode = escapeHtml(referralCode || "");

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #f81d1d;">Welcome to NutriPay, ${safeName}! 👋</h2>
        <p>Your campus dining account is now active.</p>
      </div>
    </body>
    </html>
  `;

  return sendMail({
    to,
    subject: "Welcome to NutriPay! 🎉",
    html,
  });
}

async function sendPasswordResetOtpEmail({ to, name, otp }) {
  if (!to || !otp) throw new Error("sendPasswordResetOtpEmail: 'to' and 'otp' are required");

  const safeName = escapeHtml(name || "User");
  const safeOtp = escapeHtml(String(otp));

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px;">
        <h2 style="color: #f81d1d;">Password Reset Verification</h2>
        <p>Hello ${safeName}, your OTP is <strong>${safeOtp}</strong>.</p>
      </div>
    </body>
    </html>
  `;

  return sendMail({
    to,
    subject: "NutriPay Password Reset Verification Code 🔑",
    html,
  });
}

module.exports = { sendMail, sendWelcomeEmail, sendPasswordResetOtpEmail };
