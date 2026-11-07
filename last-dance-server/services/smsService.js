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
        console.warn('[TextSMS] Credentials missing. Mocking SMS dispatch to', formattedPhone, ':\n', message);
        return { success: true, mocked: true, message: 'TextSMS credentials not configured; simulated send' };
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
        const isSuccess = 
            resData.response_code === 200 || 
            resData.success === true || 
            (resData.responses && resData.responses[0]?.['response-code'] === 200) ||
            resData.status === 'success';

        return {
            success: true,
            data: resData
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

module.exports = {
    formatKenyanPhone,
    sendSms,
    sendBookingConfirmationSms,
    sendProviderAssignedSms,
    sendBalanceCompletedSms
};

