// server/utils/serviceMailer.js
// Brevo HTML Email Templates for Services & Merchandise Bookings

const { sendMail } = require('./mailer');
require('dotenv').config();

function escapeHtml(s = '') {
    return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/**
 * Generate Responsive HTML Email for Service Booking Confirmation
 */
function generateServiceBookingHtml({ booking, frontendUrl }) {
    const siteUrl = frontendUrl || process.env.FRONTEND_URL || 'https://lastdance.co.ke';
    const bookingDetailsUrl = `${siteUrl}/last-dance/services/booking/${encodeURIComponent(booking.bookingRef)}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation: ${escapeHtml(booking.serviceTitle)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f5f8; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Top Brand Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #5e2590 0%, #762e99 100%); padding: 32px 30px; text-align: center;">
              <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 5px 14px; border-radius: 50px; margin-bottom: 10px;">
                Service &amp; Order Confirmation
              </span>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">LAST DANCE 2026</h1>
              <p style="color: #e9d5ff; margin: 6px 0 0; font-size: 13px; font-weight: 500;">Services &amp; Merchandise Booking</p>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 30px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Booking Reference Code</p>
                <div style="font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #5e2590; font-family: monospace;">
                  ${escapeHtml(booking.bookingRef)}
                </div>
              </div>

              <p style="font-size: 15px; line-height: 1.5; margin: 0 0 16px; color: #1e293b;">
                Hello <strong>${escapeHtml(booking.clientName)}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
                Your booking for <strong>${escapeHtml(booking.serviceTitle)}</strong> has been confirmed. Your upfront commitment deposit has been successfully received via M-Pesa.
              </p>

              <!-- Order Summary Breakdown Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
                <tr style="background-color: #f8fafc;">
                  <td colspan="2" style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #334155; border-bottom: 1px solid #e2e8f0;">
                    Booking &amp; Order Breakdown
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Service / Product</td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">
                    ${escapeHtml(booking.serviceTitle)} <span style="font-size: 11px; color: #762e99; background: #f3e8ff; padding: 2px 8px; border-radius: 10px;">${escapeHtml(booking.serviceCategory)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Place of Service / Pickup</td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">
                    📍 ${escapeHtml(booking.preferredLocation)}
                  </td>
                </tr>
                ${booking.scheduledDate ? `
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Scheduled Date / Time</td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 600; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">
                    ${escapeHtml(booking.scheduledDate)} ${escapeHtml(booking.scheduledTimeSlot || '')}
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Total Price</td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">
                    KES ${Number(booking.totalPriceKES).toLocaleString()}
                  </td>
                </tr>
                <tr style="background-color: #f0fdf4;">
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #166534; border-bottom: 1px solid #e2e8f0;">
                    ✓ Upfront Deposit Paid
                  </td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 800; color: #166534; text-align: right; border-bottom: 1px solid #e2e8f0;">
                    KES ${Number(booking.depositAmountKES).toLocaleString()} <span style="font-size: 11px; font-weight: normal;">(${escapeHtml(booking.depositReceiptNumber || 'Paid')})</span>
                  </td>
                </tr>
                <tr style="background-color: #fff7ed;">
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #9a3412;">
                    Remaining Balance Due on Delivery
                  </td>
                  <td style="padding: 12px 18px; font-size: 14px; font-weight: 800; color: #c2410c; text-align: right;">
                    KES ${Number(booking.remainingBalanceKES).toLocaleString()}
                  </td>
                </tr>
              </table>

              <!-- Direct View Booking Details Button (No QR Code) -->
              <div style="text-align: center; margin: 28px 0 24px;">
                <a href="${bookingDetailsUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #5e2590 0%, #762e99 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 34px; border-radius: 14px; box-shadow: 0 4px 15px rgba(94, 37, 144, 0.25);">
                  View Booking &amp; Order Details
                </a>
              </div>

              <!-- Next Steps Notice -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 24px; font-size: 12px; color: #475569; line-height: 1.6;">
                <strong>What Happens Next?</strong><br>
                1. Our team will pair you with a verified specialist or prepare your merchandise.<br>
                2. You will receive an SMS update once your specialist has been linked.<br>
                3. After your service or merchandise is delivered, you will receive an M-Pesa prompt on your phone for the remaining balance of KES ${Number(booking.remainingBalanceKES).toLocaleString()}.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Last Dance Festival 2026 &bull; Graduation Send-Off Services &amp; Merchandise<br>
                Need assistance? Call or WhatsApp our helpline.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Dispatch Service Booking Confirmation Email via Brevo
 */
async function sendServiceBookingEmail({ booking, frontendUrl }) {
    if (!booking || !booking.clientEmail) {
        throw new Error("sendServiceBookingEmail: 'booking' with 'clientEmail' is required");
    }

    const subject = `Booking & Order Confirmation: ${booking.serviceTitle} [Ref: ${booking.bookingRef}]`;
    const html = generateServiceBookingHtml({ booking, frontendUrl });

    return sendMail({
        to: booking.clientEmail,
        subject,
        html
    });
}

module.exports = {
    generateServiceBookingHtml,
    sendServiceBookingEmail
};
