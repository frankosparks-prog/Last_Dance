// server/services/smsService.js
// TextSMS Kenya Gateway Integration

const axios = require('axios');
const path = require('path');
try {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
    // Ignore if dotenv is loaded globally
}

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

    const apiKey = process.env.TEXTSMS_API_KEY || TEXTSMS_API_KEY;
    const partnerId = process.env.PARTNER_ID || PARTNER_ID;
    const senderId = process.env.SENDER_ID || SENDER_ID || 'TextSMS';
    const endpoint = process.env.TEXTSMS_ENDPOINT || SMS_ENDPOINT || 'https://sms.textsms.co.ke/api/services/sendsms/';

    if (!apiKey || !partnerId) {
        console.warn('[TextSMS] Credentials missing on server! TEXTSMS_API_KEY or PARTNER_ID is not configured.');
        return { 
            success: false, 
            error: 'SMS service credentials (TEXTSMS_API_KEY / PARTNER_ID) are not configured in the server environment.' 
        };
    }

    try {
        console.log(`[TextSMS] Dispatching SMS to ${formattedPhone} (Sender: ${senderId}): "${message.substring(0, 60)}..."`);
        
        const payload = {
            apikey: apiKey,
            partnerID: partnerId,
            message: message.trim(),
            shortcode: senderId,
            mobile: formattedPhone
        };

        const response = await axios.post(endpoint, payload, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'User-Agent': 'LastDancePlatform/1.0 (Mozilla/5.0)'
            },
            timeout: 15000
        });

        console.log('[TextSMS] API Response:', JSON.stringify(response.data));
        const resData = response.data || {};
        
        // Handle common response formats from TextSMS / Advanta (including typo 'respose-code' in upstream API)
        const firstResp = Array.isArray(resData.responses) ? resData.responses[0] : null;
        const respCode = firstResp ? (firstResp['response-code'] ?? firstResp['respose-code'] ?? firstResp.response_code) : null;
        const isSuccess = 
            resData.response_code === 200 || 
            resData.success === true || 
            respCode === 200 ||
            respCode === '200' ||
            resData.status === 'success';

        const gatewayError = 
            (firstResp && (firstResp['response-description'] || firstResp['respose-description']) && respCode !== 200 && respCode !== '200' 
                ? (firstResp['response-description'] || firstResp['respose-description']) 
                : null) ||
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
 * STRICT SECURITY: Only fires if booking paymentStatus === 'completed' and receipt is present
 */
async function sendGuestAccommodationBookingSms({ booking, listing, frontendUrl }) {
    if (!booking || !booking.guestPhone) return { success: false, error: 'Booking missing guestPhone' };

    // STRICT GUARD: Guarantee no SMS containing host details is ever sent to unpaid bookings
    const isPaid = booking.paymentStatus === 'completed' && Boolean(booking.mpesaReceiptNumber);
    if (!isPaid) {
        console.warn(`[SMS SECURITY] Refused to dispatch guest booking SMS for unpaid booking (Ref: ${booking.bookingRef}, Status: ${booking.paymentStatus}).`);
        return { success: false, error: 'Cannot send host details SMS for unpaid booking' };
    }

    const siteUrl = frontendUrl || process.env.FRONTEND_URL || 'https://lastdance.co.ke';
    const detailsUrl = `${siteUrl}/last-dance/accommodations/booking/${booking.bookingRef}`;
    const hostName = booking.hostDetails?.name || listing?.hostName || 'Property Host';
    const hostNumber = booking.hostDetails?.phone || listing?.hostPhone || '';
    const hostWa = booking.hostDetails?.whatsApp || listing?.hostWhatsApp || hostNumber;
    const cleanWa = hostWa ? String(hostWa).replace(/[^0-9]/g, '') : '';
    const propTitle = booking.listingTitle || listing?.title || 'Property';

    const message = `Confirmed! Accommodation booking for "${propTitle}" (Ref: ${booking.bookingRef}). Host: ${hostName} (${hostNumber}). WhatsApp: https://wa.me/${cleanWa} Stay Pass: ${detailsUrl}`;

    return sendSms({
        phone: booking.guestPhone,
        message
    });
}

/**
 * Send Host Notification SMS when Guest Books
 * STRICT SECURITY: Only fires if booking paymentStatus === 'completed'
 */
async function sendHostAccommodationBookedSms({ booking, listing }) {
    if (!booking) return { success: false, error: 'Missing booking' };

    // STRICT GUARD: Never notify host of a booking until the guest has completed payment
    const isPaid = booking.paymentStatus === 'completed' && Boolean(booking.mpesaReceiptNumber);
    if (!isPaid) {
        console.warn(`[SMS SECURITY] Refused to dispatch host booking alert for unpaid booking (Ref: ${booking.bookingRef}, Status: ${booking.paymentStatus}).`);
        return { success: false, error: 'Cannot notify host for unpaid booking' };
    }

    const hostPhone = listing?.hostPhone || booking?.hostDetails?.phone;
    if (!hostPhone) return { success: false, error: 'Missing hostPhone' };

    const hostName = listing?.hostName || booking?.hostDetails?.name || 'Host';
    const propTitle = booking.listingTitle || listing?.title || 'Property';
    const message = `Hello ${hostName}! Your property "${propTitle}" has been booked by ${booking.guestName} (${booking.guestPhone}) for ${booking.checkInDate} (${booking.guestCount || 1} guest(s)). Ref: ${booking.bookingRef}. Please reach out to coordinate arrival & keys.`;

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

