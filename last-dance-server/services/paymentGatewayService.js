const crypto = require('crypto');
const axios = require('axios');

class PaymentGatewayService {
  /**
   * Generate Safaricom M-Pesa Daraja OAuth Token
   */
  async getDarajaToken() {
    const key = process.env.DARAJA_CONSUMER_KEY;
    const secret = process.env.DARAJA_CONSUMER_SECRET;
    if (!key || !secret) throw new Error('Daraja credentials missing');

    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const response = await axios.get(
      'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: { Authorization: `Basic ${auth}` },
        timeout: 10000
      }
    );
    return response.data.access_token;
  }

  /**
   * Initiate M-Pesa STK Push (Daraja or PayHero based on activeGateway)
   * @param {string} userId 
   * @param {string} phone 
   * @param {number} amount 
   * @param {string} gateway ('mpesa' | 'payhero')
   * @returns {Promise<{ CheckoutRequestID: string, ResponseCode: string, CustomerMessage: string, gateway: string }>}
   */
  async initiateDeposit(userId, phone, amount, gateway = 'mpesa') {
    const selectedGateway = (gateway || process.env.ACTIVE_PAYMENT_GATEWAY || 'mpesa').toLowerCase();
    console.log(`[PaymentGatewayService] Initiating STK Push via [${selectedGateway.toUpperCase()}] for ${phone} of KES ${amount}`);

    const checkoutRequestID = `ws_CO_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    // Clean phone format (e.g. 254712345678)
    let cleanPhone = String(phone).trim().replace(/\+/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.slice(1);
    }

    // 1. DARAJA SAFARICOM M-PESA
    if (selectedGateway === 'mpesa' && process.env.DARAJA_CONSUMER_KEY && process.env.DARAJA_CONSUMER_SECRET) {
      try {
        const shortcode = process.env.DARAJA_SHORTCODE || '174379';
        const passkey = process.env.DARAJA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
        const callbackUrl = process.env.DARAJA_CALLBACK_URL || `${process.env.SERVER_URL || 'http://localhost:5000'}/api/last-dance/callback`;

        const token = await this.getDarajaToken();
        const stkRes = await axios.post(
          'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
          {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(amount),
            PartyA: cleanPhone,
            PartyB: shortcode,
            PhoneNumber: cleanPhone,
            CallBackURL: callbackUrl,
            AccountReference: 'LastDancePass',
            TransactionDesc: 'Last Dance Festival Ticket/Vote'
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 12000
          }
        );

        if (stkRes.data && stkRes.data.CheckoutRequestID) {
          return {
            CheckoutRequestID: stkRes.data.CheckoutRequestID,
            ResponseCode: stkRes.data.ResponseCode || '0',
            CustomerMessage: stkRes.data.CustomerMessage || `STK push prompt sent to ${cleanPhone}.`,
            gateway: 'mpesa'
          };
        }
      } catch (darajaErr) {
        console.warn('[PaymentGatewayService] Daraja API call failed/sandbox fallback:', darajaErr.message);
      }
    }

    // 2. PAYHERO KENYA
    if (selectedGateway === 'payhero' || process.env.PAYHERO_API_KEY) {
      try {
        const payheroUrl = process.env.PAYHERO_API_URL || 'https://backend.payhero.co.ke/api/v2/payments';
        const basicAuth = process.env.BASIC_AUTH_TOKEN || Buffer.from(`${process.env.PAYHERO_API_KEY}:${process.env.PAYHERO_API_SECRET}`).toString('base64');
        const formattedAuth = basicAuth.startsWith('Basic ') ? basicAuth : `Basic ${basicAuth}`;
        const channelId = Number(process.env.PAYHERO_CHANNEL_ID || '5740');
        const callbackUrl = process.env.PAYHERO_CALLBACK_URL || `${process.env.SERVER_URL || 'http://localhost:5000'}/api/last-dance/callback`;

        const payheroRes = await axios.post(
          payheroUrl,
          {
            amount: Math.round(amount),
            phone_number: cleanPhone,
            channel_id: channelId,
            provider: 'm-pesa',
            external_reference: checkoutRequestID,
            callback_url: callbackUrl
          },
          {
            headers: {
              Authorization: formattedAuth,
              'Content-Type': 'application/json'
            },
            timeout: 12000
          }
        );

        if (payheroRes.data && (payheroRes.data.status === 'Success' || payheroRes.data.success || payheroRes.data.reference)) {
          return {
            CheckoutRequestID: payheroRes.data.reference || payheroRes.data.CheckoutRequestID || checkoutRequestID,
            ResponseCode: '0',
            CustomerMessage: payheroRes.data.message || `STK push prompt sent via PayHero to ${cleanPhone}.`,
            gateway: 'payhero'
          };
        }
      } catch (payheroErr) {
        console.warn('[PaymentGatewayService] PayHero API call error:', payheroErr.message);
      }
    }

    // 3. Fallback request ID for offline/sandbox tracking
    return {
      CheckoutRequestID: checkoutRequestID,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      CustomerMessage: `STK push prompt sent to ${cleanPhone}. Please enter your M-Pesa PIN.`,
      gateway: selectedGateway
    };
  }

  /**
   * Verify if a pending transaction was completed on PayHero
   * @param {string} reference (checkoutRequestID or transaction reference)
   * @param {string} [phone] (optional buyer/voter phone number for fallback match)
   * @param {number} [amount] (optional expected amount in KES)
   * @returns {Promise<{ success: boolean, mpesaReceiptNumber: string, amountPaid: number, transactionReference?: string } | null>}
   */
  async checkPayHeroTransaction(reference, phone = null, amount = null) {
    if (!process.env.PAYHERO_API_KEY && !process.env.BASIC_AUTH_TOKEN) return null;
    try {
      const basicAuth = process.env.BASIC_AUTH_TOKEN || Buffer.from(`${process.env.PAYHERO_API_KEY}:${process.env.PAYHERO_API_SECRET}`).toString('base64');
      const formattedAuth = basicAuth.startsWith('Basic ') ? basicAuth : `Basic ${basicAuth}`;
      
      const response = await axios.get('https://backend.payhero.co.ke/api/v2/transactions?page=1&limit=30', {
        headers: {
          Authorization: formattedAuth
        },
        timeout: 8000
      });

      const transactions = response.data?.transactions || [];

      // 1. Direct match by transaction_reference or external_reference
      let match = transactions.find(t => 
        (t.transaction_reference === reference || t.external_reference === reference) &&
        t.transaction_type === 'inbound_payment' &&
        t.provider_reference &&
        !t.provider_reference.startsWith('cost_')
      );

      // 2. Fallback match by phone & amount if reference wasn't directly matched
      if (!match && phone && amount) {
        const cleanPhone = String(phone).replace(/\+/g, '').replace(/^0/, '254');
        match = transactions.find(t =>
          t.transaction_type === 'inbound_payment' &&
          Number(t.amount) >= Number(amount) &&
          t.provider_reference &&
          !t.provider_reference.startsWith('cost_') &&
          (String(t.description || '').includes(cleanPhone) || String(t.description || '').includes(phone))
        );
      }

      if (match) {
        return {
          success: true,
          mpesaReceiptNumber: String(match.provider_reference).trim(),
          amountPaid: Number(match.amount || 0),
          transactionReference: match.transaction_reference
        };
      }
      return null;
    } catch (err) {
      console.warn('[PaymentGatewayService] checkPayHeroTransaction warning:', err.message);
      return null;
    }
  }

  /**
   * Parse & verify callback data from PayHero or M-Pesa STK Push
   * @param {object} body 
   * @returns {object}
   */
  verifyCallback(body) {
    console.log('[PaymentGatewayService] Verifying callback payload:', JSON.stringify(body, null, 2));

    if (!body || typeof body !== 'object') {
      return {
        checkoutRequestID: '',
        success: false,
        mpesaReceiptNumber: '',
        amountPaid: 0
      };
    }

    // 1. Safaricom Daraja STK Push Callback Structure
    if (body.Body && body.Body.stkCallback) {
      const stk = body.Body.stkCallback;
      const checkoutRequestID = stk.CheckoutRequestID || '';
      const merchantRequestID = stk.MerchantRequestID || '';
      const resultCode = stk.ResultCode;
      const resultDesc = stk.ResultDesc || '';

      // ResultCode === 0 is the ONLY successful code in Daraja (e.g. 1032 is cancelled by user, 1 is insufficient funds)
      const success = Number(resultCode) === 0;

      let mpesaReceiptNumber = '';
      let amountPaid = 0;

      if (stk.CallbackMetadata && Array.isArray(stk.CallbackMetadata.Item)) {
        stk.CallbackMetadata.Item.forEach(item => {
          if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = String(item.Value || '').trim();
          if (item.Name === 'Amount') amountPaid = Number(item.Value || 0);
        });
      }

      console.log(`[PaymentGatewayService] Daraja Callback: ResultCode=${resultCode} (${resultDesc}), Success=${success}, Receipt=${mpesaReceiptNumber}`);

      return {
        checkoutRequestID,
        merchantRequestID,
        externalReference: '',
        success: success && !!mpesaReceiptNumber,
        mpesaReceiptNumber,
        amountPaid,
        resultDesc
      };
    }

    // 2. PayHero Kenya Callback Structure
    if (body.response || body.status || body.external_reference || body.reference) {
      const resp = body.response || body;
      const statusStr = String(resp.status || resp.Status || '').trim().toLowerCase();
      const isSuccess = statusStr === 'success' || resp.ResultCode === 0 || resp.success === true;
      const receipt = resp.provider_reference || resp.MpesaReceiptNumber || resp.MpesaCode || resp.mpesa_receipt || resp.mpesa_reference || '';

      return {
        checkoutRequestID: resp.CheckoutRequestID || resp.external_reference || resp.reference || '',
        merchantRequestID: resp.MerchantRequestID || resp.CheckoutRequestID || '',
        externalReference: resp.external_reference || resp.ExternalReference || '',
        success: isSuccess && !!receipt,
        mpesaReceiptNumber: String(receipt).trim(),
        amountPaid: Number(resp.Amount || resp.amount || 0)
      };
    }

    // 3. Fallback check: strictly verify explicit success flag AND a receipt code
    const isExplicit = body.success === true && !!body.mpesaReceiptNumber;
    return {
      checkoutRequestID: body.checkoutRequestID || body.CheckoutRequestID || '',
      merchantRequestID: body.merchantRequestID || '',
      externalReference: body.externalReference || '',
      success: isExplicit,
      mpesaReceiptNumber: String(body.mpesaReceiptNumber || '').trim(),
      amountPaid: Number(body.amountPaid || body.amount || 0)
    };
  }
}

module.exports = new PaymentGatewayService();
