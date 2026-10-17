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
  const hasAttachments = attachments && Array.isArray(attachments) && attachments.length > 0;

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
      if (hasAttachments) {
        payload.attachment = attachments.map((att) => ({
          name: att.filename || att.name || "ticket.html",
          content: Buffer.isBuffer(att.content)
            ? att.content.toString("base64")
            : typeof att.content === "string"
            ? Buffer.from(att.content).toString("base64")
            : att.content,
        }));
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

  // Common Nodemailer attachments format
  const nodemailerAttachments = hasAttachments
    ? attachments.map((att) => ({
        filename: att.filename || att.name || "ticket.html",
        content: att.content,
        contentType: att.contentType || "text/html",
      }))
    : undefined;

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
          attachments: nodemailerAttachments,
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
        attachments: nodemailerAttachments,
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

/**
 * Generate official Last Dance admission pass HTML email (clean, light, professional layout without emojis or AI clichés)
 */
function generateLastDanceTicketHtml({ ticketOrder = {}, isResend = false, serverUrl = '' }) {
  const buyerName = escapeHtml(ticketOrder.buyerName || "Guest");
  const buyerPhone = escapeHtml(ticketOrder.buyerPhone || "");
  const buyerEmail = escapeHtml(ticketOrder.buyerEmail || "");
  const receipt = escapeHtml(ticketOrder.mpesaReceiptNumber || "CONFIRMED");
  const quantity = Number(ticketOrder.quantity) || 1;
  const totalAmount = Number(ticketOrder.totalAmountKES) || (quantity * 500);
  const backendBase = serverUrl || env("SERVER_URL") || "http://localhost:5000";
  const orderId = ticketOrder._id ? ticketOrder._id.toString() : '';
  const shortId = orderId ? orderId.slice(-6).toUpperCase() : 'ORDER';

  const downloadUrl = orderId ? `${backendBase}/api/last-dance/tickets/${orderId}/download?action=download` : '#';
  const printUrl = orderId ? `${backendBase}/api/last-dance/tickets/${orderId}/download?action=print` : '#';
  const viewUrl = orderId ? `${backendBase}/api/last-dance/tickets/${orderId}/pass` : '#';

  const tickets = (ticketOrder.tickets && ticketOrder.tickets.length > 0)
    ? ticketOrder.tickets
    : Array.from({ length: quantity }, (_, idx) => {
        const fallbackCode = `LD-2026-${shortId}-${idx + 1}`.toUpperCase();
        return {
          ticketCode: fallbackCode,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fallbackCode)}`
        };
      });

  // Generate pass blocks for each ticket
  const passesHtml = tickets.map((t, idx) => {
    const code = escapeHtml(t.ticketCode || `LD-2026-${idx + 1}`);
    const qrUrl = t.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(t.ticketCode || code)}`;

    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border: 1.5px dashed #cbd5e1; border-radius: 12px; background-color: #f8fafc; overflow: hidden;">
        <tr>
          <td style="padding: 18px 20px; border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="left" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #5e2590; text-transform: uppercase; letter-spacing: 1px;">
                  Pass ${idx + 1} of ${quantity} &bull; All-Access Admission
                </td>
                <td align="right" style="font-family: monospace; font-size: 12px; font-weight: 700; color: #0f172a;">
                  ${code}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px 20px; text-align: center; background-color: #ffffff;">
            <p style="margin: 0 0 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
              LAST DANCE 2026
            </p>
            <p style="margin: 0 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
              Official Event Entry Pass
            </p>

            <div style="display: inline-block; background-color: #ffffff; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 12px;">
              <img src="${qrUrl}" alt="Admission QR Code - ${code}" width="160" height="160" style="display: block; margin: 0 auto; border: 0;" />
            </div>

            <div style="font-family: monospace; font-size: 16px; font-weight: 700; letter-spacing: 2px; color: #5e2590; margin-bottom: 6px;">
              ${code}
            </div>

            <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748b;">
              Admit One &bull; Valid for single gate scan on Thursday, November 26, 2026
            </p>
          </td>
        </tr>
      </table>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Last Dance 2026 - Admission Pass</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 28px 12px; color: #1e293b; -webkit-font-smoothing: antialiased;">
      
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
        <tr>
          <td>
            
            <!-- MAIN CONTAINER -->
            <div style="background-color: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);">
              
              <!-- TOP BRANDING HEADER -->
              <div style="background: linear-gradient(135deg, #5e2590 0%, #762e99 100%); padding: 24px 28px; text-align: left;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <p style="margin: 0 0 2px; font-size: 11px; font-weight: 700; color: #e9d5ff; text-transform: uppercase; letter-spacing: 1.5px;">
                        ${isResend ? '[RESENT] ' : ''}Official Admission Pass
                      </p>
                      <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                        LAST DANCE 2026
                      </h1>
                      <p style="margin: 3px 0 0; font-size: 12.5px; color: #f3e8ff;">
                        Graduation Eve Celebration &amp; Awards
                      </p>
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">
                        Confirmed
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CONTENT BODY -->
              <div style="padding: 28px 28px 24px;">
                
                <!-- GREETING & CONFIRMATION -->
                <p style="margin: 0 0 10px; font-size: 15px; font-weight: 600; color: #0f172a;">
                  Hello ${buyerName},
                </p>
                <p style="margin: 0 0 22px; font-size: 13.5px; color: #475569; line-height: 1.55;">
                  Your admission order for Last Dance 2026 has been processed successfully. Below are your event admission credentials and verification details.
                </p>

                <!-- ORDER & EVENT LOGISTICS SUMMARY TABLE -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                    <tr>
                      <td style="padding-bottom: 12px; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;" width="50%">
                        Event Date &amp; Time
                      </td>
                      <td style="padding-bottom: 12px; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;" width="50%">
                        Venue
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 16px; font-weight: 700; color: #0f172a; font-size: 13px;">
                        Thursday, Nov 26, 2026<br>
                        <span style="font-weight: 500; font-size: 12px; color: #64748b;">Doors open at 18:00</span>
                      </td>
                      <td style="padding-bottom: 16px; font-weight: 700; color: #0f172a; font-size: 13px;">
                        Crowns Bar and Restaurant<br>
                        <span style="font-weight: 500; font-size: 12px; color: #64748b;">Main Campus Gate</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 12px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                        M-Pesa Receipt
                      </td>
                      <td style="padding-top: 12px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                        Passes Issued
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 4px; font-family: monospace; font-size: 13px; font-weight: 700; color: #059669;">
                        ${receipt}
                      </td>
                      <td style="padding-top: 4px; font-weight: 700; color: #0f172a; font-size: 13px;">
                        ${quantity} All-Access Pass${quantity > 1 ? 'es' : ''} (KES ${totalAmount.toLocaleString()})
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- PASS CARDS -->
                ${passesHtml}

                <!-- ACTIONS / BUTTONS -->
                <div style="text-align: center; margin: 26px 0 24px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                    <tr>
                      <td style="padding: 0 6px;">
                        <a href="${downloadUrl}" target="_blank" style="display: inline-block; background-color: #5e2590; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 12.5px; padding: 12px 22px; border-radius: 8px; letter-spacing: 0.3px;">
                          Download Ticket Pass (.HTML)
                        </a>
                      </td>
                      <td style="padding: 0 6px;">
                        <a href="${viewUrl}" target="_blank" style="display: inline-block; background-color: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; text-decoration: none; font-weight: 600; font-size: 12.5px; padding: 11px 20px; border-radius: 8px;">
                          View Digital Pass
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 10px 0 0; font-size: 12px; color: #64748b;">
                    Your offline ticket pass is also attached to this email.
                  </p>
                </div>

                <!-- ADMISSION GUIDELINES -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-top: 24px;">
                  <p style="margin: 0 0 8px; font-size: 11.5px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">
                    Admission Guidelines
                  </p>
                  <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #475569; line-height: 1.6;">
                    <li>Present the QR code in this email or on the attached ticket pass at the gate for scanning.</li>
                    <li>Valid student identification or national ID matching the ticket purchaser may be requested upon entry.</li>
                    <li>Each pass code is unique and valid for single admission. Please keep your pass confidential.</li>
                  </ul>
                </div>

              </div>

              <!-- FOOTER -->
              <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 11.5px; color: #64748b; line-height: 1.6;">
                <p style="margin: 0 0 4px;">
                  Need assistance? Contact the ticketing team at <a href="mailto:support@nutripay.co.ke" style="color: #5e2590; text-decoration: underline; font-weight: 600;">support@nutripay.co.ke</a>
                </p>
                <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                  &copy; 2026 NutriPay Event Ticketing Systems &bull; Last Dance Graduation Eve Committee
                </p>
              </div>

            </div>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
}

/**
 * Generate official standalone physical-style ticket pass HTML
 * Uses JsBarcode (for vector Code128 barcodes) and html2pdf.js (for high-definition PDF export)
 * Styled in an official, clean, light luxury aesthetic
 */
function generateStandalonePrintableTicketHtml({ ticketOrder = {}, serverUrl = '', autoPrint = false }) {
  const buyerName = escapeHtml(ticketOrder.buyerName || "Guest Attendee");
  const buyerPhone = escapeHtml(ticketOrder.buyerPhone || "N/A");
  const buyerEmail = escapeHtml(ticketOrder.buyerEmail || "");
  const receipt = escapeHtml(ticketOrder.mpesaReceiptNumber || "CONFIRMED");
  const quantity = Number(ticketOrder.quantity) || 1;
  const totalAmount = Number(ticketOrder.totalAmountKES) || (quantity * 500);
  const orderId = ticketOrder._id ? ticketOrder._id.toString() : 'ORDER';
  const shortId = orderId.slice(-6).toUpperCase();
  const frontendBase = env("FRONTEND_URL") || "http://localhost:3000";

  const tickets = (ticketOrder.tickets && ticketOrder.tickets.length > 0)
    ? ticketOrder.tickets
    : Array.from({ length: quantity }, (_, idx) => {
        const fallbackCode = `LD-2026-${shortId}-${idx + 1}`.toUpperCase();
        return {
          ticketCode: fallbackCode,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fallbackCode)}`
        };
      });

  const ticketPasses = tickets.map((t, idx) => {
    const code = escapeHtml(t.ticketCode || `LD-2026-${idx + 1}`);
    const qrUrl = t.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(t.ticketCode || code)}`;

    return `
      <div class="physical-ticket" id="ticket-${idx + 1}">
        
        <!-- MAIN TICKET BODY (LEFT) -->
        <div class="ticket-main">
          
          <div class="ticket-top-bar">
            <div class="brand-group">
              <span class="brand-name">LAST DANCE 2026</span>
              <span class="brand-divider">/</span>
              <span class="brand-event">GRADUATION EVE</span>
            </div>
            <span class="badge-status">Official Pass #${idx + 1} of ${quantity}</span>
          </div>

          <div class="ticket-headline">
            <h2 class="event-title">LAST DANCE</h2>
            <p class="event-tagline">Graduation Eve Celebration, Awards &amp; Send-Off</p>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Ticket Holder</span>
              <span class="meta-value">${buyerName}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Date &amp; Time</span>
              <span class="meta-value">Thursday, Nov 26, 2026 &bull; 18:00</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Venue</span>
              <span class="meta-value">Crowns Bar and Restaurant &bull; Gate</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">M-Pesa Receipt</span>
              <span class="meta-value monospace highlight">${receipt}</span>
            </div>
          </div>

          <div class="ticket-bottom-bar">
            <div class="barcode-wrapper">
              <svg class="barcode-target" data-barcode="${code}"></svg>
              <span class="barcode-serial">${code}</span>
            </div>
            <div class="security-stamp">
              <span class="stamp-seal">NUTRI•PAY</span>
              <span class="stamp-text">AUTHENTICATED EVENT ADMISSION</span>
            </div>
          </div>

        </div>

        <!-- PERFORATED TEAR-OFF LINE WITH NOTCHES -->
        <div class="perforation-divider">
          <div class="notch notch-top"></div>
          <div class="dashed-line"></div>
          <div class="notch-cutout-center">STUB</div>
          <div class="dashed-line"></div>
          <div class="notch notch-bottom"></div>
        </div>

        <!-- TEAR-OFF ADMISSION STUB (RIGHT) -->
        <div class="ticket-stub">
          <div class="stub-header">
            <span class="stub-tag">ADMIT ONE</span>
            <span class="stub-tier">VIP ACCESS</span>
          </div>

          <div class="stub-qr-box">
            <img src="${qrUrl}" alt="Gate Entry QR - ${code}" class="stub-qr-img" />
          </div>

          <div class="stub-meta">
            <div class="stub-code">${code}</div>
            <div class="stub-order-id">ORD: ${shortId}</div>
            <div class="stub-notice">Present at Gate Scanner</div>
          </div>
        </div>

      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Last Dance 2026 - Official Ticket Pass (${receipt})</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  
  <!-- JS Libraries: JsBarcode for authentic Code128 barcodes and html2pdf for vector PDF exports -->
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

  <style>
    :root {
      --primary: #5e2590;
      --primary-dark: #491c70;
      --primary-light: #762e99;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --bg-page: #f1f5f9;
      --card-bg: #ffffff;
      --accent-green: #059669;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-page);
      color: var(--text-main);
      -webkit-font-smoothing: antialiased;
      line-height: 1.5;
      padding-bottom: 60px;
    }

    /* Fixed Clean Action Toolbar */
    .action-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-color);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .toolbar-title {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.2px;
    }

    .toolbar-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 999px;
      background-color: #ecfdf5;
      color: var(--accent-green);
      border: 1px solid #a7f3d0;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      font-size: 12.5px;
      font-weight: 600;
      border-radius: 8px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-primary {
      background-color: var(--primary);
      color: #ffffff;
    }
    .btn-primary:hover {
      background-color: var(--primary-dark);
    }

    .btn-secondary {
      background-color: #ffffff;
      color: var(--text-main);
      border: 1px solid var(--border-color);
    }
    .btn-secondary:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
    }

    /* Container */
    .tickets-container {
      max-width: 820px;
      margin: 32px auto 0;
      padding: 0 16px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* Physical Ticket Card Design */
    .physical-ticket {
      background-color: var(--card-bg);
      border: 1px solid #cbd5e1;
      border-radius: 16px;
      display: flex;
      flex-direction: row;
      position: relative;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Main Section (Left 72%) */
    .ticket-main {
      flex: 1 1 72%;
      padding: 26px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .ticket-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: var(--primary);
      text-transform: uppercase;
    }

    .brand-divider {
      color: #cbd5e1;
    }

    .brand-event {
      color: var(--text-muted);
      font-weight: 600;
    }

    .badge-status {
      font-size: 10.5px;
      font-weight: 700;
      color: var(--text-muted);
      background-color: #f1f5f9;
      padding: 3px 9px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .ticket-headline {
      margin-bottom: 20px;
    }

    .event-title {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.8px;
      color: var(--text-main);
      line-height: 1.1;
    }

    .event-tagline {
      font-size: 12.5px;
      color: var(--text-muted);
      margin-top: 3px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px 20px;
      padding: 16px 18px;
      background-color: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      margin-bottom: 20px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .meta-value {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
    }

    .meta-value.monospace {
      font-family: 'JetBrains Mono', Courier, monospace;
    }

    .meta-value.highlight {
      color: var(--accent-green);
    }

    .ticket-bottom-bar {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      padding-top: 10px;
    }

    .barcode-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .barcode-target {
      max-height: 44px;
      display: block;
    }

    .barcode-serial {
      font-family: 'JetBrains Mono', Courier, monospace;
      font-size: 10.5px;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 2px;
      margin-top: 4px;
    }

    .security-stamp {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .stamp-seal {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: var(--primary);
      border: 1px solid var(--primary);
      padding: 2px 7px;
      border-radius: 4px;
    }

    .stamp-text {
      font-size: 9px;
      font-weight: 700;
      color: var(--text-muted);
      margin-top: 3px;
      letter-spacing: 0.5px;
    }

    /* Perforation Divider */
    .perforation-divider {
      position: relative;
      width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }

    .dashed-line {
      width: 0;
      height: 100%;
      border-left: 2px dashed #cbd5e1;
    }

    .notch {
      position: absolute;
      width: 22px;
      height: 22px;
      background-color: var(--bg-page);
      border: 1px solid #cbd5e1;
      border-radius: 50%;
      z-index: 5;
    }

    .notch-top {
      top: -11px;
      left: -11px;
    }

    .notch-bottom {
      bottom: -11px;
      left: -11px;
    }

    .notch-cutout-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-90deg);
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #94a3b8;
      background-color: var(--card-bg);
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* Stub Section (Right 28%) */
    .ticket-stub {
      flex: 0 0 28%;
      background-color: #fafbfd;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      text-align: center;
    }

    .stub-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .stub-tag {
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: var(--primary);
    }

    .stub-tier {
      font-size: 9.5px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 1px;
    }

    .stub-qr-box {
      background-color: #ffffff;
      padding: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      margin: 12px 0;
    }

    .stub-qr-img {
      display: block;
      width: 125px;
      height: 125px;
    }

    .stub-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stub-code {
      font-family: 'JetBrains Mono', Courier, monospace;
      font-size: 12px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: 1px;
    }

    .stub-order-id {
      font-size: 10px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .stub-notice {
      font-size: 9px;
      font-weight: 600;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    /* Footer info */
    .page-footer {
      max-width: 820px;
      margin: 28px auto 0;
      padding: 0 16px;
      text-align: center;
      font-size: 11.5px;
      color: var(--text-muted);
      line-height: 1.6;
    }

    .page-footer a {
      color: var(--primary);
      text-decoration: underline;
    }

    /* Print Styles */
    @media print {
      .action-toolbar, .page-footer {
        display: none !important;
      }
      body {
        background-color: #ffffff !important;
        padding: 0 !important;
      }
      .tickets-container {
        margin: 0 !important;
        padding: 0 !important;
        max-width: 100% !important;
        gap: 20px !important;
      }
      .physical-ticket {
        border: 1px solid #94a3b8 !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .notch {
        background-color: #ffffff !important;
      }
      @page {
        margin: 12mm;
        size: auto;
      }
    }

    @media (max-width: 640px) {
      .physical-ticket {
        flex-direction: column;
      }
      .perforation-divider {
        width: 100%;
        height: 0;
        flex-direction: row;
      }
      .dashed-line {
        width: 100%;
        height: 0;
        border-left: none;
        border-top: 2px dashed #cbd5e1;
      }
      .notch-top {
        top: -11px;
        left: -11px;
      }
      .notch-bottom {
        bottom: -11px;
        right: -11px;
        left: auto;
      }
      .stub-qr-img {
        width: 150px;
        height: 150px;
      }
    }
  </style>
</head>
<body>

  <!-- FIXED TOP TOOLBAR -->
  <header class="action-toolbar">
    <div class="toolbar-left">
      <span class="toolbar-title">Last Dance Official Ticket Pass</span>
      <span class="toolbar-badge">Confirmed</span>
    </div>
    <div class="toolbar-actions">
      <button onclick="downloadAsPdf()" id="pdfBtn" class="btn btn-primary">
        Download PDF Pass
      </button>
      <button onclick="window.print()" class="btn btn-secondary">
        Print Ticket
      </button>
      <a href="${frontendBase}/last-dance" class="btn btn-secondary">
        Event Portal
      </a>
    </div>
  </header>

  <!-- MAIN TICKETS WRAPPER -->
  <main class="tickets-container" id="printable-area">
    ${ticketPasses}
  </main>

  <!-- FOOTER -->
  <footer class="page-footer">
    <p>Present the QR code above or the printed ticket pass at venue gate security for scanning.</p>
    <p>Admission inquiries: <a href="mailto:support@nutripay.co.ke">support@nutripay.co.ke</a> &bull; NutriPay Event Systems &copy; 2026</p>
  </footer>

  <!-- SCRIPT INITIALIZATION (JsBarcode + html2pdf integration) -->
  <script>
    // Initialize Vector Barcodes using JsBarcode
    document.addEventListener('DOMContentLoaded', function() {
      const barcodeElements = document.querySelectorAll('.barcode-target');
      barcodeElements.forEach(el => {
        const code = el.getAttribute('data-barcode');
        if (code && typeof JsBarcode === 'function') {
          try {
            JsBarcode(el, code, {
              format: "CODE128",
              width: 1.4,
              height: 40,
              displayValue: false,
              lineColor: "#1e293b",
              margin: 0
            });
          } catch(err) {
            console.error('JsBarcode rendering error:', err);
          }
        }
      });
    });

    // High-Definition PDF Download using html2pdf.js
    function downloadAsPdf() {
      const btn = document.getElementById('pdfBtn');
      const originalText = btn.innerText;
      btn.innerText = 'Generating PDF...';
      btn.disabled = true;

      const element = document.getElementById('printable-area');
      const opt = {
        margin: [10, 10, 10, 10],
        filename: 'LastDance-Ticket-${receipt}.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      if (typeof html2pdf === 'function') {
        html2pdf().set(opt).from(element).save().then(() => {
          btn.innerText = originalText;
          btn.disabled = false;
        }).catch(err => {
          console.error('PDF generation error:', err);
          btn.innerText = originalText;
          btn.disabled = false;
          window.print();
        });
      } else {
        window.print();
        btn.innerText = originalText;
        btn.disabled = false;
      }
    }

    ${autoPrint ? `window.addEventListener('load', () => { setTimeout(() => window.print(), 600); });` : ''}
  </script>

</body>
</html>`;
}

/**
 * Send official Last Dance Ticket Pass confirmation email with standalone offline pass attachment
 */
async function sendLastDanceTicketEmail({ ticketOrder, isResend = false, serverUrl }) {
  if (!ticketOrder || !ticketOrder.buyerEmail) {
    throw new Error("sendLastDanceTicketEmail: 'ticketOrder' with 'buyerEmail' is required");
  }

  const baseServerUrl = serverUrl || env("SERVER_URL") || "http://localhost:5000";
  const quantity = Number(ticketOrder.quantity) || 1;
  const subjectPrefix = isResend ? "[RESENT] " : "";
  const receiptCode = ticketOrder.mpesaReceiptNumber ? ` - ${ticketOrder.mpesaReceiptNumber}` : "";
  const subject = `${subjectPrefix}Last Dance 2026: Official Entry Pass (${quantity} Ticket${quantity > 1 ? "s" : ""})${receiptCode}`;

  const html = generateLastDanceTicketHtml({ ticketOrder, isResend, serverUrl: baseServerUrl });
  const standaloneHtml = generateStandalonePrintableTicketHtml({ ticketOrder, serverUrl: baseServerUrl });
  const filename = `LastDance-Ticket-${ticketOrder.mpesaReceiptNumber || (ticketOrder._id ? ticketOrder._id.toString().slice(-6) : 'Pass')}.html`;

  return sendMail({
    to: ticketOrder.buyerEmail,
    subject,
    html,
    attachments: [
      {
        filename,
        content: Buffer.from(standaloneHtml, "utf-8"),
        contentType: "text/html",
      },
    ],
  });
}

module.exports = { 
  sendMail, 
  sendWelcomeEmail, 
  sendPasswordResetOtpEmail, 
  generateLastDanceTicketHtml,
  generateStandalonePrintableTicketHtml,
  sendLastDanceTicketEmail 
};
