// server/controllers/accommodationController.js
// Handles Accommodations Marketplace: Host Enlisting, OTP Verification, Guest Bookings, Payments, and Admin Auditing

const crypto = require('crypto');
const mongoose = require('mongoose');
const AccommodationListing = require('../models/AccommodationListing');
const AccommodationBooking = require('../models/AccommodationBooking');
const AccommodationOtp = require('../models/AccommodationOtp');
const LastDanceSettings = require('../models/LastDanceSettings');
const paymentGatewayService = require('../services/paymentGatewayService');
const { 
    formatKenyanPhone, 
    sendAccommodationOtpSms, 
    sendHostEnlistingConfirmedSms, 
    sendGuestAccommodationBookingSms, 
    sendHostAccommodationBookedSms,
    sendHostRefundProcessedSms
} = require('../services/smsService');
const { sendGuestAccommodationEmail } = require('../utils/accommodationMailer');

const ZONES = ['Campus Pavilion', 'Egerton Gate', 'Njokerio', 'Hostels Area', 'Town Center', 'Other'];
const PROPERTY_TYPES = ['Bedsitter', '1 Bedroom', '2 Bedroom', 'Private Room', 'Hostel Room', 'Full House'];

// In-memory OTP store to prevent 10s Mongoose buffering when DB is starting/reconnecting
const memoryOtpStore = new Map();

// Helper to retrieve accommodation settings with defaults
async function getAccommodationSettings() {
    if (mongoose.connection.readyState !== 1) {
        return {
            enabled: true,
            hostListingFeeKES: 100,
            hostRefundFeeKES: 50,
            clientBookingFeeKES: 100,
            disclaimerText: 'Last Dance Festival is a marketplace platform connector only. We are not the property owner, landlord, or insurer. All accommodations are agreed directly between host and guest.',
            activePaymentGateway: 'mpesa'
        };
    }
    let settings = await LastDanceSettings.findOne({ key: 'global' });
    if (!settings) {
        settings = await LastDanceSettings.create({ key: 'global' });
    }
    return {
        enabled: settings.accommodationSettings?.enabled !== false,
        hostListingFeeKES: settings.accommodationSettings?.hostListingFeeKES || 100,
        hostRefundFeeKES: settings.accommodationSettings?.hostRefundFeeKES || 50,
        clientBookingFeeKES: settings.accommodationSettings?.clientBookingFeeKES || 100,
        disclaimerText: settings.accommodationSettings?.disclaimerText || 'Last Dance Festival is a marketplace platform connector only. We are not the property owner, landlord, or insurer. All accommodations are agreed directly between host and guest.',
        activePaymentGateway: settings.activePaymentGateway || 'mpesa'
    };
}

/* ==========================================================================
   PUBLIC HOST & GUEST CONTROLLERS
   ========================================================================== */

/**
 * 1. Send OTP Verification Code to Host Phone via TextSMS
 */
exports.sendHostOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required.' });
        }

        const cleanPhone = formatKenyanPhone(phone);
        if (!cleanPhone || cleanPhone.length < 10) {
            return res.status(400).json({ success: false, message: 'Please enter a valid Kenyan phone number (e.g. 0712345678).' });
        }

        // Generate 6-digit numeric OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Immediately store in memory cache (guarantees zero buffering delays)
        memoryOtpStore.set(cleanPhone, {
            phone: cleanPhone,
            otpCode,
            isVerified: false,
            expiresAt
        });

        // Upsert OTP record in Mongo if DB connected
        if (mongoose.connection.readyState === 1) {
            try {
                await AccommodationOtp.findOneAndUpdate(
                    { phone: cleanPhone },
                    { otpCode, isVerified: false, expiresAt },
                    { upsert: true, new: true }
                );
            } catch (dbErr) {
                console.warn('[Accommodations] DB OTP upsert warning:', dbErr.message);
            }
        }

        // Dispatch OTP via TextSMS Kenya
        const smsResult = await sendAccommodationOtpSms({ phone: cleanPhone, otpCode });
        console.log(`[Accommodations] OTP SMS result for ${cleanPhone}:`, smsResult);

        if (!smsResult.success) {
            return res.status(502).json({
                success: false,
                message: `Failed to deliver SMS: ${smsResult.error || 'Gateway error'}. Please verify your phone number.`
            });
        }

        res.json({
            success: true,
            message: `Verification code sent to ${cleanPhone}. Please enter the 6-digit code.`,
            phone: cleanPhone
        });
    } catch (err) {
        console.error('[Accommodations] sendHostOtp error:', err);
        res.status(500).json({ success: false, message: 'Failed to send OTP code: ' + (err.message || 'Server error') });
    }
};

/**
 * 2. Verify Host OTP Code
 */
exports.verifyHostOtp = async (req, res) => {
    try {
        const phone = req.body.phone;
        const code = req.body.code || req.body.otpCode;
        if (!phone || !code) {
            return res.status(400).json({ success: false, message: 'Phone number and verification code are required.' });
        }

        const cleanPhone = formatKenyanPhone(phone);
        let record = null;

        // Try reading from MongoDB if connected
        if (mongoose.connection.readyState === 1) {
            try {
                record = await AccommodationOtp.findOne({ phone: cleanPhone });
            } catch (dbErr) {
                console.warn('[Accommodations] DB OTP query warning:', dbErr.message);
            }
        }

        // Fallback to in-memory OTP cache
        if (!record && memoryOtpStore.has(cleanPhone)) {
            record = memoryOtpStore.get(cleanPhone);
        }

        if (!record) {
            return res.status(400).json({ success: false, message: 'No verification code was requested for this number.' });
        }

        if (new Date() > new Date(record.expiresAt)) {
            return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
        }

        if (String(record.otpCode).trim() !== String(code).trim()) {
            return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
        }

        // Mark verified in memory
        record.isVerified = true;
        memoryOtpStore.set(cleanPhone, {
            ...record,
            isVerified: true
        });

        // Persist to DB if connected
        if (mongoose.connection.readyState === 1) {
            try {
                if (typeof record.save === 'function') {
                    await record.save();
                } else {
                    await AccommodationOtp.findOneAndUpdate({ phone: cleanPhone }, { isVerified: true });
                }
            } catch (dbErr) {
                console.warn('[Accommodations] DB OTP mark verified warning:', dbErr.message);
            }
        }

        res.json({
            success: true,
            message: 'Phone number successfully verified!',
            phone: cleanPhone,
            verified: true
        });
    } catch (err) {
        console.error('[Accommodations] verifyHostOtp error:', err);
        res.status(500).json({ success: false, message: 'Failed to verify code: ' + (err.message || 'Server error') });
    }
};

/**
 * 3. Enlist Property & Dispatch Host Enlisting Fee STK Push (KES 100)
 */
exports.enlistProperty = async (req, res) => {
    try {
        const settings = await getAccommodationSettings();
        if (!settings.enabled) {
            return res.status(403).json({ success: false, message: 'Accommodation marketplace is currently closed.' });
        }

        const {
            title,
            propertyType,
            locationZone,
            specificAddress,
            description,
            pricePerNightKES,
            maxGuests,
            bedrooms,
            beds,
            amenities,
            houseRules,
            images,
            hostName,
            hostPhone,
            hostWhatsApp,
            termsAccepted
        } = req.body;

        // Mandatory Terms Check
        if (!termsAccepted) {
            return res.status(400).json({ 
                success: false, 
                message: 'You must review and accept the Platform Connector Terms of Service to enlist your property.' 
            });
        }

        // Image Constraints: At least 1, at most 3
        if (!images || !Array.isArray(images) || images.length < 1 || images.length > 3) {
            return res.status(400).json({ 
                success: false, 
                message: 'You must upload at least 1 image and at most 3 images for your property.' 
            });
        }

        if (!title || !propertyType || !locationZone || !specificAddress || !pricePerNightKES || !hostName || !hostPhone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill in all required property, location, and host contact details.' 
            });
        }

        const cleanPhone = formatKenyanPhone(hostPhone);
        const cleanWhatsApp = formatKenyanPhone(hostWhatsApp || hostPhone);

        // Verify phone possession check
        let isPhoneVerified = false;
        if (mongoose.connection.readyState === 1) {
            try {
                const otpRecord = await AccommodationOtp.findOne({ phone: cleanPhone, isVerified: true });
                if (otpRecord) isPhoneVerified = true;
            } catch (dbErr) {
                console.warn('[Accommodations] DB OTP verification lookup warning:', dbErr.message);
            }
        }
        if (!isPhoneVerified && memoryOtpStore.has(cleanPhone)) {
            const memRecord = memoryOtpStore.get(cleanPhone);
            if (memRecord && memRecord.isVerified) {
                isPhoneVerified = true;
            }
        }

        if (!isPhoneVerified) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please verify your phone number via SMS OTP before submitting your property.' 
            });
        }

        const enlistingFee = settings.hostListingFeeKES;
        const refundAmount = settings.hostRefundFeeKES;
        const listingRef = `HS-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Trigger M-Pesa STK push for the enlisting fee
        const dummyUserId = '000000000000000000000000';
        const stkResult = await paymentGatewayService.initiateDeposit(
            dummyUserId,
            cleanPhone,
            enlistingFee,
            settings.activePaymentGateway
        );

        const listing = await AccommodationListing.create({
            listingRef,
            title: title.trim(),
            propertyType,
            locationZone,
            specificAddress: specificAddress.trim(),
            description: description ? description.trim() : '',
            pricePerNightKES: Number(pricePerNightKES),
            maxGuests: Number(maxGuests) || 2,
            bedrooms: Number(bedrooms) || 1,
            beds: Number(beds) || 1,
            amenities: Array.isArray(amenities) ? amenities : [],
            houseRules: houseRules || {
                noParties: true,
                noSmoking: true,
                noExtraVisitors: true,
                quietHours: '10:00 PM - 6:00 AM'
            },
            images,
            hostName: hostName.trim(),
            hostPhone: cleanPhone,
            hostWhatsApp: cleanWhatsApp,
            isPhoneVerified: true,
            termsAccepted: true,
            termsAcceptedAt: new Date(),
            enlistingFeeKES: enlistingFee,
            enlistingCheckoutRequestID: stkResult.CheckoutRequestID,
            enlistingPaymentStatus: 'pending',
            refundEligible: true,
            refundAmountKES: refundAmount,
            refundStatus: 'pending_approval',
            status: 'draft'
        });

        res.json({
            success: true,
            message: `STK push prompt sent to ${cleanPhone}. Please enter your M-Pesa PIN to complete your KES ${enlistingFee} enlisting fee.`,
            listingRef,
            checkoutRequestID: stkResult.CheckoutRequestID,
            enlistingFeeKES: enlistingFee,
            refundAmountKES: refundAmount,
            listing
        });
    } catch (err) {
        console.error('[Accommodations] enlistProperty error:', err);
        res.status(500).json({ success: false, message: 'Failed to enlist property: ' + (err.message || 'M-Pesa error') });
    }
};

/**
 * 4. Poll Host Enlisting Fee Payment Status
 */
exports.checkEnlistingStatus = async (req, res) => {
    try {
        const { checkoutRequestID } = req.params;
        const listing = await AccommodationListing.findOne({ enlistingCheckoutRequestID: checkoutRequestID });

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Enlisting transaction record not found.' });
        }

        if (listing.enlistingPaymentStatus === 'completed') {
            return res.json({
                success: true,
                status: 'completed',
                listingRef: listing.listingRef,
                receipt: listing.enlistingReceiptNumber,
                listing
            });
        }

        // Reconcile via Gateway query
        try {
            const confirmedTx = await paymentGatewayService.checkPayHeroTransaction(checkoutRequestID);

            if (confirmedTx && confirmedTx.failed) {
                listing.enlistingPaymentStatus = 'failed';
                await listing.save();
                return res.json({ success: false, status: 'failed', message: confirmedTx.reason || 'Payment cancelled.' });
            }

            if (confirmedTx && confirmedTx.pending) {
                return res.json({
                    success: true,
                    status: 'pending',
                    message: 'Awaiting M-Pesa PIN entry on host handset.',
                    listing
                });
            }

            if (confirmedTx && confirmedTx.success && confirmedTx.mpesaReceiptNumber) {
                listing.enlistingPaymentStatus = 'completed';
                listing.enlistingReceiptNumber = confirmedTx.mpesaReceiptNumber;
                listing.enlistingPaidAt = new Date();
                listing.status = 'active'; // Activate property on verified receipt
                await listing.save();

                // Dispatch Host SMS
                try {
                    await sendHostEnlistingConfirmedSms({ listing });
                } catch (smsErr) {
                    console.error('[Accommodations] Host enlisting SMS error:', smsErr.message);
                }

                if (global.io) {
                    global.io.emit(`last_dance:accommodation_enlisting_paid:${checkoutRequestID}`, {
                        success: true,
                        listingRef: listing.listingRef,
                        receipt: listing.enlistingReceiptNumber
                    });
                }

                return res.json({
                    success: true,
                    status: 'completed',
                    listingRef: listing.listingRef,
                    receipt: listing.enlistingReceiptNumber,
                    listing
                });
            }
        } catch (syncErr) {
            // Non-blocking query error
        }

        res.json({
            success: true,
            status: listing.enlistingPaymentStatus,
            listing
        });
    } catch (err) {
        console.error('[Accommodations] checkEnlistingStatus error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 5. Get Public Active Accommodation Listings (Filters: zone, propertyType, maxPrice, search)
 * IMPORTANT: Exclude private host contacts and specific door/flat numbers from public unbooked cards!
 */
exports.getListings = async (req, res) => {
    try {
        const { zone, propertyType, maxPrice, search, guests } = req.query;

        // Fallback when MongoDB is offline / reconnecting
        if (mongoose.connection.readyState !== 1) {
            const fallbackListings = [
                {
                    _id: 'mock-acc-1',
                    listingRef: 'HS-7F2A10',
                    title: 'Modern Furnished Bedsitter near Egerton Main Gate',
                    propertyType: 'Bedsitter',
                    locationZone: 'Egerton Main Gate',
                    pricePerNightKES: 1200,
                    maxGuests: 2,
                    bedrooms: 1,
                    beds: 1,
                    amenities: ['High-Speed Wi-Fi', 'Hot Shower', 'Perimeter Security / Gate Guard'],
                    houseRules: { noParties: true, noSmoking: true, quietHours: '10:00 PM' },
                    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80'],
                    status: 'active'
                },
                {
                    _id: 'mock-acc-2',
                    listingRef: 'HS-8B3C44',
                    title: 'Spacious 1-Bedroom Apartment (Njokerio Zone)',
                    propertyType: '1 Bedroom Apartment',
                    locationZone: 'Njokerio',
                    pricePerNightKES: 1800,
                    maxGuests: 3,
                    bedrooms: 1,
                    beds: 2,
                    amenities: ['High-Speed Wi-Fi', 'Hot Shower', 'Kitchen / Cooking Amenities'],
                    houseRules: { noParties: true, noSmoking: true, quietHours: '10:00 PM' },
                    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80'],
                    status: 'active'
                }
            ];
            return res.json({
                success: true,
                count: fallbackListings.length,
                listings: fallbackListings,
                zones: ZONES,
                propertyTypes: PROPERTY_TYPES,
                bookingFeeKES: 100,
                hostListingFeeKES: 100,
                hostRefundFeeKES: 50,
                disclaimerText: 'Last Dance Festival is a marketplace platform connector only. We are not the property owner or insurer.',
                isMockFallback: true
            });
        }
        const query = { status: 'active', enlistingPaymentStatus: 'completed' };

        if (zone && zone !== 'All') {
            query.locationZone = zone;
        }

        if (propertyType && propertyType !== 'All') {
            query.propertyType = propertyType;
        }

        if (maxPrice && !isNaN(Number(maxPrice))) {
            query.pricePerNightKES = { $lte: Number(maxPrice) };
        }

        if (guests && !isNaN(Number(guests))) {
            query.maxGuests = { $gte: Number(guests) };
        }

        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } },
                { locationZone: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        // Hide specific flat number and host phone from public unbooked cards
        const listings = await AccommodationListing.find(query)
            .select('-hostPhone -hostWhatsApp -specificAddress -enlistingCheckoutRequestID -adminNotes')
            .sort({ isFeatured: -1, createdAt: -1 });

        const settings = await getAccommodationSettings();

        res.json({
            success: true,
            count: listings.length,
            listings,
            zones: ZONES,
            propertyTypes: PROPERTY_TYPES,
            bookingFeeKES: settings.clientBookingFeeKES,
            hostListingFeeKES: settings.hostListingFeeKES,
            hostRefundFeeKES: settings.hostRefundFeeKES,
            disclaimerText: settings.disclaimerText
        });
    } catch (err) {
        console.error('[Accommodations] getListings error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch accommodation listings: ' + err.message });
    }
};

/**
 * 6. Get Single Listing Details (Public Preview)
 */
exports.getListingByIdOrRef = async (req, res) => {
    try {
        const { identifier } = req.params;
        const query = identifier.match(/^[0-9a-fA-F]{24}$/)
            ? { _id: identifier }
            : { listingRef: identifier.toUpperCase() };

        const listing = await AccommodationListing.findOne({ ...query, status: { $in: ['active', 'booked'] } })
            .select('-hostPhone -hostWhatsApp -specificAddress -enlistingCheckoutRequestID -adminNotes');

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Accommodation listing not found.' });
        }

        res.json({ success: true, listing });
    } catch (err) {
        console.error('[Accommodations] getListingByIdOrRef error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 7. Guest: Book Accommodation & Dispatch KES 100 Connection / Down Payment STK Push
 */
exports.bookAccommodation = async (req, res) => {
    try {
        const settings = await getAccommodationSettings();
        if (!settings.enabled) {
            return res.status(403).json({ success: false, message: 'Accommodation bookings are currently closed.' });
        }

        const {
            listingId,
            guestName,
            guestPhone,
            guestEmail,
            guestCount,
            checkInDate,
            checkOutDate,
            guestNotes,
            termsAccepted
        } = req.body;

        if (!termsAccepted) {
            return res.status(400).json({ 
                success: false, 
                message: 'You must accept the Platform Terms of Service acknowledging the platform is a connector only.' 
            });
        }

        if (!listingId || !guestName || !guestPhone || !guestEmail || !checkInDate) {
            return res.status(400).json({ 
                success: false, 
                message: 'Guest Name, Phone, Email, and Check-in Date are required.' 
            });
        }

        const listing = await AccommodationListing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Property listing not found.' });
        }

        if (listing.status !== 'active') {
            return res.status(400).json({ success: false, message: 'This property is already booked or currently unavailable.' });
        }

        const cleanGuestPhone = formatKenyanPhone(guestPhone);
        const connectionFee = settings.clientBookingFeeKES;
        const bookingRef = `AB-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Trigger M-Pesa STK push for the KES 100 connection fee
        const dummyUserId = '000000000000000000000000';
        const stkResult = await paymentGatewayService.initiateDeposit(
            dummyUserId,
            cleanGuestPhone,
            connectionFee,
            settings.activePaymentGateway
        );

        const booking = await AccommodationBooking.create({
            bookingRef,
            listing: listing._id,
            listingTitle: listing.title,
            listingPropertyType: listing.propertyType,
            listingZone: listing.locationZone,
            guestName: guestName.trim(),
            guestPhone: cleanGuestPhone,
            guestEmail: guestEmail.trim().toLowerCase(),
            guestCount: Number(guestCount) || 1,
            checkInDate,
            checkOutDate: checkOutDate || '2026-10-27',
            guestNotes: guestNotes ? guestNotes.trim() : '',
            termsAccepted: true,
            connectionFeeKES: connectionFee,
            checkoutRequestID: stkResult.CheckoutRequestID,
            paymentStatus: 'pending',
            status: 'pending_payment'
        });

        res.json({
            success: true,
            message: `STK push prompt sent to ${cleanGuestPhone}. Please enter your M-Pesa PIN to complete payment of KES ${connectionFee}.`,
            bookingRef,
            checkoutRequestID: stkResult.CheckoutRequestID,
            connectionFeeKES: connectionFee,
            booking
        });
    } catch (err) {
        console.error('[Accommodations] bookAccommodation error:', err);
        res.status(500).json({ success: false, message: 'Failed to initiate accommodation booking: ' + (err.message || 'M-Pesa error') });
    }
};

/**
 * 8. Poll Guest Booking Payment Status (Reveals Host WhatsApp & Call Handset on Confirmation)
 */
exports.checkBookingStatus = async (req, res) => {
    try {
        const { checkoutRequestID } = req.params;
        const booking = await AccommodationBooking.findOne({ checkoutRequestID }).populate('listing');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking transaction record not found.' });
        }

        if (booking.paymentStatus === 'completed') {
            return res.json({
                success: true,
                status: 'completed',
                bookingRef: booking.bookingRef,
                receipt: booking.mpesaReceiptNumber,
                hostDetails: booking.hostDetails,
                booking
            });
        }

        // Reconcile via Gateway Query
        try {
            const confirmedTx = await paymentGatewayService.checkPayHeroTransaction(checkoutRequestID);

            if (confirmedTx && confirmedTx.failed) {
                booking.paymentStatus = 'failed';
                booking.status = 'cancelled';
                await booking.save();
                return res.json({ success: false, status: 'failed', message: confirmedTx.reason || 'Payment cancelled.' });
            }

            if (confirmedTx && confirmedTx.pending) {
                return res.json({
                    success: true,
                    status: 'pending',
                    message: 'Awaiting M-Pesa PIN confirmation on guest handset.',
                    booking
                });
            }

            if (confirmedTx && confirmedTx.success && confirmedTx.mpesaReceiptNumber) {
                booking.paymentStatus = 'completed';
                booking.mpesaReceiptNumber = confirmedTx.mpesaReceiptNumber;
                booking.paidAt = new Date();
                booking.status = 'confirmed';

                const listing = booking.listing;
                if (listing) {
                    booking.hostDetails = {
                        name: listing.hostName,
                        phone: listing.hostPhone,
                        whatsApp: listing.hostWhatsApp || listing.hostPhone,
                        specificAddress: listing.specificAddress
                    };
                    listing.status = 'booked';
                    await listing.save();
                }

                await booking.save();

                // Send SMS notifications
                try {
                    await sendGuestAccommodationBookingSms({ booking, listing });
                    booking.guestSmsSent = true;
                    if (listing) {
                        await sendHostAccommodationBookedSms({ booking, listing });
                        booking.hostSmsSent = true;
                    }
                    await booking.save();
                } catch (smsErr) {
                    console.error('[Accommodations] Booking SMS error:', smsErr.message);
                }

                // Send Email notification to guest
                try {
                    await sendGuestAccommodationEmail({ booking, listing });
                    booking.guestEmailSent = true;
                    await booking.save();
                } catch (mailErr) {
                    console.error('[Accommodations] Booking Email error:', mailErr.message);
                }

                if (global.io) {
                    global.io.emit(`last_dance:accommodation_booking_paid:${checkoutRequestID}`, {
                        success: true,
                        bookingRef: booking.bookingRef,
                        receipt: booking.mpesaReceiptNumber
                    });
                }

                return res.json({
                    success: true,
                    status: 'completed',
                    bookingRef: booking.bookingRef,
                    receipt: booking.mpesaReceiptNumber,
                    hostDetails: booking.hostDetails,
                    booking
                });
            }
        } catch (syncErr) {
            // Non-blocking query error
        }

        res.json({
            success: true,
            status: booking.paymentStatus,
            booking
        });
    } catch (err) {
        console.error('[Accommodations] checkBookingStatus error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 9. View Verified Guest Booking Pass / Receipt by Reference
 */
exports.getBookingByRef = async (req, res) => {
    try {
        const { bookingRef } = req.params;
        const booking = await AccommodationBooking.findOne({ bookingRef: bookingRef.trim().toUpperCase() })
            .populate('listing');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Accommodation booking not found.' });
        }

        // Only reveal full host contact if payment is completed
        const isPaid = booking.paymentStatus === 'completed';
        const responseData = booking.toObject();

        if (!isPaid) {
            delete responseData.hostDetails;
        }

        res.json({
            success: true,
            isPaid,
            booking: responseData
        });
    } catch (err) {
        console.error('[Accommodations] getBookingByRef error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 10. Frictionless Lookup by Phone Number ("Find My Bookings & Enlistments")
 */
exports.getMyAccommodationsByPhone = async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number parameter is required.' });
        }

        const cleanPhone = formatKenyanPhone(phone);
        const [guestBookings, hostListings] = await Promise.all([
            AccommodationBooking.find({ guestPhone: cleanPhone }).sort({ createdAt: -1 }),
            AccommodationListing.find({ hostPhone: cleanPhone }).sort({ createdAt: -1 })
        ]);

        res.json({
            success: true,
            guestBookings,
            hostListings
        });
    } catch (err) {
        console.error('[Accommodations] getMyAccommodationsByPhone error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};


/* ==========================================================================
   ADMIN MANAGEMENT & FINANCIAL AUDITING CONTROLLERS
   ========================================================================== */

/**
 * 11. Admin: Get all Accommodation Listings (with host contacts & filter by status)
 */
exports.adminGetListings = async (req, res) => {
    try {
        const { status, zone } = req.query;
        const query = {};

        if (status && status !== 'All') query.status = status;
        if (zone && zone !== 'All') query.locationZone = zone;

        const listings = await AccommodationListing.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: listings.length, listings });
    } catch (err) {
        console.error('[Accommodations Admin] adminGetListings error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 12. Admin: Directly Enlist Property (No OTP verification, No M-Pesa fee, Immediately Active)
 */
exports.adminEnlistListing = async (req, res) => {
    try {
        const {
            title,
            propertyType,
            locationZone,
            specificAddress,
            description,
            pricePerNightKES,
            maxGuests,
            bedrooms,
            beds,
            amenities,
            houseRules,
            images,
            hostName,
            hostPhone,
            hostWhatsApp,
            adminNotes
        } = req.body;

        if (!title || !propertyType || !locationZone || !specificAddress || !pricePerNightKES || !hostName || !hostPhone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill in all required property, location, and host contact details.' 
            });
        }

        if (!images || !Array.isArray(images) || images.length < 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide at least 1 photo for the listing.' 
            });
        }

        const cleanPhone = formatKenyanPhone(hostPhone);
        const cleanWhatsApp = formatKenyanPhone(hostWhatsApp || hostPhone);
        const listingRef = `HS-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        const listing = await AccommodationListing.create({
            listingRef,
            title: title.trim(),
            propertyType,
            locationZone,
            specificAddress: specificAddress.trim(),
            description: description ? description.trim() : '',
            pricePerNightKES: Number(pricePerNightKES),
            maxGuests: Number(maxGuests) || 2,
            bedrooms: Number(bedrooms) || 1,
            beds: Number(beds) || 1,
            amenities: Array.isArray(amenities) ? amenities : [],
            houseRules: houseRules || {
                noParties: true,
                noSmoking: true,
                noExtraVisitors: true,
                quietHours: '10:00 PM - 6:00 AM'
            },
            images,
            hostName: hostName.trim(),
            hostPhone: cleanPhone,
            hostWhatsApp: cleanWhatsApp,
            isPhoneVerified: true, // Auto-verified by Admin
            termsAccepted: true,
            termsAcceptedAt: new Date(),
            enlistingFeeKES: 0,
            enlistingPaymentStatus: 'completed',
            enlistingReceiptNumber: `ADMIN-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
            enlistingPaidAt: new Date(),
            refundEligible: false,
            refundAmountKES: 0,
            refundStatus: 'not_applicable',
            adminNotes: adminNotes || 'Directly enlisted via Admin Panel',
            status: 'active'
        });

        res.json({
            success: true,
            message: `Property "${listing.title}" enlisted successfully and is now active on the marketplace!`,
            listing
        });
    } catch (err) {
        console.error('[Accommodations Admin] adminEnlistListing error:', err);
        res.status(500).json({ success: false, message: 'Failed to create listing: ' + (err.message || 'Server error') });
    }
};

/**
 * 13. Admin: Update Listing Status (Moderate / Approve / Reject / Deactivate / Reactivate)
 */
exports.adminUpdateListingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const validStatuses = ['draft', 'active', 'booked', 'unlisted', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid listing status.' });
        }

        const listing = await AccommodationListing.findByIdAndUpdate(
            id,
            { 
                status, 
                adminNotes: adminNotes ? adminNotes.trim() : undefined,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found.' });
        }

        const statusMessage = status === 'unlisted' ? 'Listing has been deactivated (unlisted from public marketplace).' :
                              status === 'active' ? 'Listing is now active on the marketplace.' :
                              `Status updated to ${status}.`;

        res.json({ success: true, message: statusMessage, listing });
    } catch (err) {
        console.error('[Accommodations Admin] adminUpdateListingStatus error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 13. Admin: Unified Financial Audit Ledger (All Host Enlisting Fees & Guest Booking Fees)
 */
exports.adminGetTransactions = async (req, res) => {
    try {
        const { type, search } = req.query;

        // Fetch completed or pending host enlisting transactions
        const hostQuery = { enlistingPaymentStatus: { $in: ['completed', 'pending', 'failed'] } };
        // Fetch guest booking connection transactions
        const guestQuery = { paymentStatus: { $in: ['completed', 'pending', 'failed'] } };

        if (search && search.trim()) {
            const s = search.trim();
            hostQuery.$or = [
                { listingRef: { $regex: s, $options: 'i' } },
                { hostPhone: { $regex: s, $options: 'i' } },
                { enlistingReceiptNumber: { $regex: s, $options: 'i' } },
                { title: { $regex: s, $options: 'i' } }
            ];
            guestQuery.$or = [
                { bookingRef: { $regex: s, $options: 'i' } },
                { guestPhone: { $regex: s, $options: 'i' } },
                { mpesaReceiptNumber: { $regex: s, $options: 'i' } },
                { guestName: { $regex: s, $options: 'i' } }
            ];
        }

        const [hostListings, guestBookings] = await Promise.all([
            AccommodationListing.find(hostQuery).sort({ createdAt: -1 }),
            AccommodationBooking.find(guestQuery).sort({ createdAt: -1 })
        ]);

        const transactions = [];

        // Map Host Enlisting Payments
        if (!type || type === 'All' || type === 'host_enlisting') {
            hostListings.forEach(l => {
                transactions.push({
                    id: l._id,
                    type: 'host_enlisting',
                    typeLabel: 'Host Enlisting Fee',
                    reference: l.listingRef,
                    itemTitle: l.title,
                    payerName: l.hostName,
                    payerPhone: l.hostPhone,
                    amountKES: l.enlistingFeeKES || 100,
                    receiptNumber: l.enlistingReceiptNumber || '-',
                    status: l.enlistingPaymentStatus,
                    checkoutRequestID: l.enlistingCheckoutRequestID,
                    createdAt: l.enlistingPaidAt || l.createdAt,
                    refundStatus: l.refundStatus
                });
            });
        }

        // Map Guest Connection Payments
        if (!type || type === 'All' || type === 'guest_booking') {
            guestBookings.forEach(b => {
                transactions.push({
                    id: b._id,
                    type: 'guest_booking',
                    typeLabel: 'Guest Connection Fee',
                    reference: b.bookingRef,
                    itemTitle: b.listingTitle,
                    payerName: b.guestName,
                    payerPhone: b.guestPhone,
                    amountKES: b.connectionFeeKES || 100,
                    receiptNumber: b.mpesaReceiptNumber || '-',
                    status: b.paymentStatus,
                    checkoutRequestID: b.checkoutRequestID,
                    createdAt: b.paidAt || b.createdAt,
                    refundStatus: 'not_applicable'
                });
            });
        }

        // Sort unified transactions descending by date
        transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (err) {
        console.error('[Accommodations Admin] adminGetTransactions error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 14. Admin: Financial Audit Metrics & Unbooked Refund Eligibility
 */
exports.adminGetMetrics = async (req, res) => {
    try {
        const [totalListings, activeListings, bookedListings, completedEnlistments, completedBookings, unbookedEligibleListings] = await Promise.all([
            AccommodationListing.countDocuments(),
            AccommodationListing.countDocuments({ status: 'active' }),
            AccommodationListing.countDocuments({ status: 'booked' }),
            AccommodationListing.find({ enlistingPaymentStatus: 'completed' }),
            AccommodationBooking.find({ paymentStatus: 'completed' }),
            AccommodationListing.find({ 
                status: 'active', 
                enlistingPaymentStatus: 'completed',
                refundStatus: { $in: ['pending_approval', 'eligible'] }
            })
        ]);

        const totalEnlistingRevenueKES = completedEnlistments.reduce((acc, curr) => acc + (curr.enlistingFeeKES || 100), 0);
        const totalBookingRevenueKES = completedBookings.reduce((acc, curr) => acc + (curr.connectionFeeKES || 100), 0);
        const totalRevenueKES = totalEnlistingRevenueKES + totalBookingRevenueKES;

        res.json({
            success: true,
            metrics: {
                totalListings,
                activeListings,
                bookedListings,
                totalEnlistingRevenueKES,
                totalBookingRevenueKES,
                totalRevenueKES,
                unbookedEligibleCount: unbookedEligibleListings.length,
                unbookedEligibleListings
            }
        });
    } catch (err) {
        console.error('[Accommodations Admin] adminGetMetrics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 15. Admin: Process or Record KES 50 Refund for Unbooked Property
 */
exports.adminProcessRefund = async (req, res) => {
    try {
        const { id } = req.params;
        const { receiptNumber, notes } = req.body;

        const listing = await AccommodationListing.findById(id);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found.' });
        }

        if (listing.status === 'booked') {
            return res.status(400).json({ success: false, message: 'This property was booked by a guest and is not eligible for unbooked refund.' });
        }

        if (listing.refundStatus === 'refunded') {
            return res.status(400).json({ success: false, message: 'This listing has already been refunded.' });
        }

        const refundAmount = listing.refundAmountKES || 50;
        const cleanReceipt = (receiptNumber && receiptNumber.trim()) ? receiptNumber.trim() : `RF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        listing.refundStatus = 'refunded';
        listing.refundReceiptNumber = cleanReceipt;
        listing.refundProcessedAt = new Date();
        listing.adminNotes = notes ? `${listing.adminNotes || ''} [Refund: ${notes}]` : listing.adminNotes;
        await listing.save();

        // Dispatch SMS confirmation to host
        try {
            await sendHostRefundProcessedSms({ listing, receiptNumber: cleanReceipt });
        } catch (smsErr) {
            console.error('[Accommodations Admin] Refund SMS error:', smsErr.message);
        }

        res.json({
            success: true,
            message: `KES ${refundAmount} refund processed for host ${listing.hostName} (Receipt: ${cleanReceipt}).`,
            listing
        });
    } catch (err) {
        console.error('[Accommodations Admin] adminProcessRefund error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 16. Admin: Get Configurable Settings
 */
exports.adminGetSettings = async (req, res) => {
    try {
        const settings = await getAccommodationSettings();
        res.json({ success: true, settings });
    } catch (err) {
        console.error('[Accommodations Admin] adminGetSettings error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 17. Admin: Update Configurable Settings
 */
exports.adminUpdateSettings = async (req, res) => {
    try {
        const { hostListingFeeKES, hostRefundFeeKES, clientBookingFeeKES, enabled, disclaimerText } = req.body;

        let settings = await LastDanceSettings.findOne({ key: 'global' });
        if (!settings) {
            settings = await LastDanceSettings.create({ key: 'global' });
        }

        if (!settings.accommodationSettings) {
            settings.accommodationSettings = {};
        }

        if (hostListingFeeKES !== undefined) settings.accommodationSettings.hostListingFeeKES = Number(hostListingFeeKES);
        if (hostRefundFeeKES !== undefined) settings.accommodationSettings.hostRefundFeeKES = Number(hostRefundFeeKES);
        if (clientBookingFeeKES !== undefined) settings.accommodationSettings.clientBookingFeeKES = Number(clientBookingFeeKES);
        if (enabled !== undefined) settings.accommodationSettings.enabled = !!enabled;
        if (disclaimerText !== undefined) settings.accommodationSettings.disclaimerText = disclaimerText.trim();

        await settings.save();

        res.json({
            success: true,
            message: 'Accommodation settings updated successfully.',
            settings: settings.accommodationSettings
        });
    } catch (err) {
        console.error('[Accommodations Admin] adminUpdateSettings error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
