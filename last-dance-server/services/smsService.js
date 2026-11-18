// server/services/smsService.js
// TextSMS Kenya Gateway Integration

const axios = require('axios');
require('dotenv').config();

const TEXTSMS_API_KEY = process.env.TEXTSMS_API_KEY || '';
const PARTNER_ID = process.env.PARTNER_ID || '';
const SENDER_ID = process.env.SENDER_ID || 'TextSMS';
const SMS_ENDPOINT = process.env.TEXTSMS_ENDPOINT || 'https://sms.textsms.co.ke/api/services/sendsms/';

/**
 * Standardize phone number into Kenyan 254XXXXXXXXX format
 */
function formatKenyanPhone(phone) {
    if (!phone) return '';
    let cleaned = String(phone).trim().replace(/[\s\+\-\(\)]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
        cleaned = '254' + cleaned;
    }
    return cleaned;
}

/**
 * Send SMS message via TextSMS API
 * @param {Object} options
 * @param {string} options.phone - Recipient mobile number
 * @param {string} options.message - Text SMS content
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
async function sendSms({ phone, message }) {
    const formattedPhone = formatKenyanPhone(phone);

    if (!formattedPhone) {
        console.warn('[TextSMS] Invalid or missing phone number:', phone);
        return { success: false, error: 'Invalid phone number' };
    }

    if (!message || !message.trim()) {
        console.warn('[TextSMS] Empty SMS message body');
        return { success: false, error: 'Message body cannot be empty' };
    }

    if (!TEXTSMS_API_KEY || !PARTNER_ID) {
        console.warn('[TextSMS] Credentials missing on server! TEXTSMS_API_KEY or PARTNER_ID is not configured.');
        return { 
            success: false, 
            error: 'SMS service credentials (TEXTSMS_API_KEY / PARTNER_ID) are not configured in the server environment.' 
        };
    }

    try {
        console.log(`[TextSMS] Dispatching SMS to ${formattedPhone} (Sender: ${SENDER_ID}): "${message.substring(0, 60)}..."`);
        
        const payload = {
            apikey: TEXTSMS_API_KEY,
            partnerID: PARTNER_ID,
            message: message.trim(),
            shortcode: SENDER_ID,
            mobile: formattedPhone
        };

        const response = await axios.post(SMS_ENDPOINT, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            timeout: 10000
        });

        console.log('[TextSMS] API Response:', response.data);
        const resData = response.data || {};
        
        // Handle common response formats from TextSMS / Advanta
        const firstResp = Array.isArray(resData.responses) ? resData.responses[0] : null;
        const isSuccess = 
            resData.response_code === 200 || 
            resData.success === true || 
            (firstResp && (firstResp['response-code'] === 200 || firstResp.response_code === 200)) ||
            resData.status === 'success';

        const gatewayError = 
            (firstResp && firstResp['response-description'] && firstResp['response-code'] !== 200 ? firstResp['response-description'] : null) ||
            resData.message || 
            resData.description || 
            (isSuccess ? null : 'Gateway rejected SMS dispatch');

        return {
            success: isSuccess,
            data: resData,
            error: isSuccess ? null : gatewayError
        };
    } catch (err) {
        console.error('[TextSMS] Gateway dispatch error:', err.response?.data || err.message);
        return {
            success: false,
            error: err.response?.data?.message || err.message
        };
    }
}

/**
 * Send Booking Confirmation SMS to Client
 */
async function sendBookingConfirmationSms({ booking, frontendUrl }) {
    if (!booking || !booking.clientPhone) return { success: false, error: 'Booking missing clientPhone' };

    const siteUrl = frontendUrl || process.env.FRONTEND_URL || 'https://lastdance.co.ke';
    const detailsUrl = `${siteUrl}/last-dance/services/booking/${booking.bookingRef}`;
    
    const message = `Hello ${booking.clientName}! Your order for "${booking.serviceTitle}" is confirmed (Ref: ${booking.bookingRef}). Deposit KES ${booking.depositAmountKES} received. Bal: KES ${booking.remainingBalanceKES}. Location: ${booking.preferredLocation}. View details: ${detailsUrl}`;

    return sendSms({
        phone: booking.clientPhone,
        message
    });
}

/**
 * Send Provider Assigned Notification SMS to Client
 */
async function sendProviderAssignedSms({ booking, providerName, providerPhone }) {
    if (!booking || !booking.clientPhone) return { success: false, error: 'Booking missing clientPhone' };

    const providerInfo = providerPhone ? `${providerName} (${providerPhone})` : providerName;
    const message = `Update on Ref ${booking.bookingRef} (${booking.serviceTitle}): Your specialist ${providerInfo} has been assigned! They will attend to you at ${booking.preferredLocation}.`;

    return sendSms({
        phone: booking.clientPhone,
        message
    });
}

/**
 * Send Balance Completed SMS to Client
 */
async function sendBalanceCompletedSms({ booking, receiptNumber }) {
    if (!booking || !booking.clientPhone) return { success: false, error: 'Booking missing clientPhone' };

    const receipt = receiptNumber || booking.balanceReceiptNumber || '';
    const message = `Thank you ${booking.clientName}! Balance of KES ${booking.remainingBalanceKES} for "${booking.serviceTitle}" cleared (M-Pesa: ${receipt}). Order Ref: ${booking.bookingRef}. Thank you for ordering with Last Dance!`;

    return sendSms({
        phone: booking.clientPhone,
        message
    });
}

/**
 * Send Accommodation Host Phone Verification OTP SMS
 */
async function sendAccommodationOtpSms({ phone, otpCode }) {
    const message = `Your Last Dance Accommodation Verification Code is ${otpCode}. Valid for 10 minutes. Do not share this code with anyone.`;
    return sendSms({
        phone,
        message
    });
}

/**
 * Send Host Enlisting Confirmation SMS
 */
async function sendHostEnlistingConfirmedSms({ listing, frontendUrl }) {
    if (!listing || !listing.hostPhone) return { success: false, error: 'Listing missing hostPhone' };

    const siteUrl = frontendUrl || process.env.FRONTEND_URL || 'https://lastdance.co.ke';
    const message = `Hello ${listing.hostName}! Your house "${listing.title}" is officially listed (Ref: ${listing.listingRef}). Enlisting fee KES ${listing.enlistingFeeKES || 100} received (M-Pesa: ${listing.enlistingReceiptNumber || 'Verified'}). If unbooked by festival date, KES ${listing.refundAmountKES || 50} is refunded. View: ${siteUrl}/last-dance/accommodations`;

    return sendSms({
        phone: listing.hostPhone,
        message
    });
}

/**
 * Send Guest Accommodation Booking Confirmation SMS (With Host WhatsApp & Call Reveal)
 */
async function sendGuestAccommodationBookingSms({ booking, listing, frontendUrl }) {
    if (!booking || !booking.guestPhone) return { success: false, error: 'Booking missing guestPhone' };

    const siteUrl = frontendUrl || process.env.FRONTEND_URL || 'https://lastdance.co.ke';
    const detailsUrl = `${siteUrl}/last-dance/accommodations/booking/${booking.bookingRef}`;
    const hostNumber = booking.hostDetails?.phone || listing?.hostPhone || '';
    const hostWa = booking.hostDetails?.whatsApp || listing?.hostWhatsApp || hostNumber;
    const cleanWa = hostWa.replace(/[^0-9]/g, '');

    const message = `Confirmed! Accommodation booking for "${booking.listingTitle}" (Ref: ${booking.bookingRef}). KES ${booking.connectionFeeKES || 100} paid. Host: ${booking.hostDetails?.name || listing?.hostName || 'Host'} (${hostNumber}). WhatsApp: https://wa.me/${cleanWa} View details: ${detailsUrl}`;

    return sendSms({
        phone: booking.guestPhone,
        message
    });
}

/**
 * Send Host Notification SMS when Guest Books
 */
async function sendHostAccommodationBookedSms({ booking, listing }) {
    const hostPhone = listing?.hostPhone || booking?.hostDetails?.phone;
    if (!hostPhone) return { success: false, error: 'Missing hostPhone' };

    const message = `Great news ${listing?.hostName || 'Host'}! Your house "${booking.listingTitle}" (Ref: ${listing?.listingRef || booking.bookingRef}) has been booked by ${booking.guestName} (${booking.guestPhone}) for ${booking.checkInDate} (${booking.guestCount} guest(s)). Please contact them to coordinate check-in!`;

    return sendSms({
        phone: hostPhone,
        message
    });
}

/**
 * Send Host Refund Processed SMS for Unbooked House
 */
async function sendHostRefundProcessedSms({ listing, receiptNumber }) {
    if (!listing || !listing.hostPhone) return { success: false, error: 'Missing hostPhone' };

    const receipt = receiptNumber || listing.refundReceiptNumber || '';
    const message = `Hello ${listing.hostName}, as per our accommodation policy, your unbooked property "${listing.title}" has been refunded KES ${listing.refundAmountKES || 50} (Receipt: ${receipt}). Thank you for enlisting with Last Dance Festival!`;

    return sendSms({
        phone: listing.hostPhone,
        message
    });
}

module.exports = {
    formatKenyanPhone,
    sendSms,
    sendBookingConfirmationSms,
    sendProviderAssignedSms,
    sendBalanceCompletedSms,
    sendAccommodationOtpSms,
    sendHostEnlistingConfirmedSms,
    sendGuestAccommodationBookingSms,
    sendHostAccommodationBookedSms,
    sendHostRefundProcessedSms
};

