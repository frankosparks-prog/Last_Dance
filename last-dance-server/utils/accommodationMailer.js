// server/utils/accommodationMailer.js
// Brevo HTML Email Templates for Accommodations Booking & Host Confirmation

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
 * Generate HTML Email for Guest Accommodation Booking Confirmation
 */
function generateGuestBookingHtml({ booking, listing, frontendUrl }) {
    const siteUrl = frontendUrl || process.env.FRONTEND_URL || 'https://lastdance.co.ke';
    const bookingDetailsUrl = `${siteUrl}/last-dance/accommodations/booking/${encodeURIComponent(booking.bookingRef)}`;
    const hostNumber = booking.hostDetails?.phone || listing?.hostPhone || '';
    const hostWa = booking.hostDetails?.whatsApp || listing?.hostWhatsApp || hostNumber;
    const cleanWa = hostWa.replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hello ${booking.hostDetails?.name || 'Host'}, I have booked your accommodation "${booking.listingTitle}" (Ref: ${booking.bookingRef}) for Last Dance 2026. Checking in on ${booking.checkInDate}.`)}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accommodation Booking Confirmed: ${escapeHtml(booking.listingTitle)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f5f8; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #5e2590 0%, #762e99 100%); padding: 32px 30px; text-align: center;">
              <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 5px 14px; border-radius: 50px; margin-bottom: 10px;">
                Accommodation Reservation &bull; Connector Pass
              </span>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">LAST DANCE 2026</h1>
              <p style="color: #e9d5ff; margin: 6px 0 0; font-size: 13px; font-weight: 500;">Graduation Eve Lodging &amp; Stay</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 30px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Booking Reference Code</p>
                <div style="font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #5e2590; font-family: monospace;">
                  ${escapeHtml(booking.bookingRef)}
                </div>
              </div>

              <p style="font-size: 15px; line-height: 1.5; margin: 0 0 16px; color: #1e293b;">
                Hello <strong>${escapeHtml(booking.guestName)}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
                Your reservation for <strong>${escapeHtml(booking.listingTitle)}</strong> (${escapeHtml(booking.listingPropertyType)}) has been confirmed. Your connection / down payment fee has been received via M-Pesa.
              </p>

              <!-- Host Contacts Card -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 10px; font-size: 13px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">
                  ✓ Host Contact Information (Unlocked)
                </p>
                <p style="margin: 0 0 6px; font-size: 14px; color: #14532d;">
                  <strong>Host Name:</strong> ${escapeHtml(booking.hostDetails?.name || 'Property Host')}
                </p>
                <p style="margin: 0 0 6px; font-size: 14px; color: #14532d;">
                  <strong>Phone:</strong> <a href="tel:${escapeHtml(hostNumber)}" style="color: #166534; font-weight: bold;">${escapeHtml(hostNumber)}</a>
                </p>
                ${booking.hostDetails?.specificAddress ? `
                <p style="margin: 0 0 14px; font-size: 14px; color: #14532d;">
                  <strong>Specific Address / Court:</strong> ${escapeHtml(booking.hostDetails.specificAddress)}
                </p>` : ''}
                
                <div style="margin-top: 12px;">
                  <a href="${waLink}" target="_blank" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 10px;">
                    Chat with Host on WhatsApp
                  </a>
                </div>
              </div>

              <!-- Reservation Details Breakdown -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
                <tr style="background-color: #f8fafc;">
                  <td colspan="2" style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #334155; border-bottom: 1px solid #e2e8f0;">
                    Reservation Breakdown
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Location Zone</td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">
                    📍 ${escapeHtml(booking.listingZone)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Check-in Date</td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">
                    ${escapeHtml(booking.checkInDate)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Occupants / Guests</td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #f1f5f9;">
                    ${escapeHtml(String(booking.guestCount))} person(s)
                  </td>
                </tr>
                <tr style="background-color: #f0fdf4;">
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 700; color: #166534;">
                    Connection Fee Paid
                  </td>
                  <td style="padding: 12px 18px; font-size: 13px; font-weight: 800; color: #166534; text-align: right;">
                    KES ${Number(booking.connectionFeeKES).toLocaleString()} (${escapeHtml(booking.mpesaReceiptNumber || 'Paid')})
                  </td>
                </tr>
              </table>

              <!-- Action Link -->
              <div style="text-align: center; margin: 24px 0;">
                <a href="${bookingDetailsUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #5e2590 0%, #762e99 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px;">
                  View Booking &amp; House Details
                </a>
              </div>

              <!-- Disclaimer -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 24px; font-size: 11px; color: #64748b; line-height: 1.6;">
                <strong>Platform Terms &amp; Connector Notice:</strong><br>
                Last Dance Festival is an intermediary marketplace connector only and does not own, inspect, manage, or insure this property. All stays and arrangements are agreed directly between the host and guest.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Last Dance Festival 2026 &bull; Accommodation Marketplace
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
 * Dispatch Guest Accommodation Confirmation Email via Brevo
 */
async function sendGuestAccommodationEmail({ booking, listing, frontendUrl }) {
    if (!booking || !booking.guestEmail) {
        throw new Error("sendGuestAccommodationEmail: 'booking' with 'guestEmail' is required");
    }

    const subject = `Accommodation Booking Confirmed: ${booking.listingTitle} [Ref: ${booking.bookingRef}]`;
    const html = generateGuestBookingHtml({ booking, listing, frontendUrl });

    return sendMail({
        to: booking.guestEmail,
        subject,
        html
    });
}

module.exports = {
    generateGuestBookingHtml,
    sendGuestAccommodationEmail
};
