// server/controllers/serviceController.js
// Handles Marketplace Services & Merchandise, Bookings, Payments, and Notifications

const crypto = require('crypto');
const ServiceItem = require('../models/ServiceItem');
const ServiceBooking = require('../models/ServiceBooking');
const paymentGatewayService = require('../services/paymentGatewayService');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { 
    sendBookingConfirmationSms, 
    sendProviderAssignedSms, 
    sendBalanceCompletedSms, 
    formatKenyanPhone 
} = require('../services/smsService');
const { sendServiceBookingEmail } = require('../utils/serviceMailer');

// Preset categories for easy management
const DEFAULT_CATEGORIES = [
    'Makeup Artist',
    'Nail Tech',
    'Merchandise',
    'Hair & Styling',
    'Photography',
    'Other'
];

/* ==========================================================================
   PUBLIC GUEST CONTROLLERS (NO LOGIN REQUIRED)
   ========================================================================== */

/**
 * 1. Get active services catalog for public marketplace
 * IMPORTANT: Exclude private provider contacts and internal notes!
 */
exports.getServices = async (req, res) => {
    try {
        const { category, search } = req.query;
        const query = { isActive: true };

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search && search.trim()) {
            query.$or = [
                { title: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        // Project only public fields (hide providerName, providerContact, internalNotes)
        const services = await ServiceItem.find(query)
            .select('-providerName -providerContact -internalNotes')
            .sort({ featured: -1, sortOrder: 1, createdAt: -1 });

        res.json({
            success: true,
            count: services.length,
            services,
            categories: DEFAULT_CATEGORIES
        });
    } catch (err) {
        console.error('[Services] getServices error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch services: ' + err.message });
    }
};

/**
 * 2. Get single service details (Public)
 */
exports.getServiceByIdOrSlug = async (req, res) => {
    try {
        const { identifier } = req.params;
        const query = identifier.match(/^[0-9a-fA-F]{24}$/)
            ? { _id: identifier }
            : { slug: identifier };

        const service = await ServiceItem.findOne({ ...query, isActive: true })
            .select('-providerName -providerContact -internalNotes');

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found or is currently inactive.' });
        }

        res.json({ success: true, service });
    } catch (err) {
        console.error('[Services] getServiceByIdOrSlug error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 3. Book a Service or Product & Trigger Upfront Deposit STK Push
 */
exports.bookService = async (req, res) => {
    try {
        const {
            serviceId,
            name,
            email,
            phone,
            preferredLocation,
            scheduledDate,
            scheduledTimeSlot,
            clientNotes
        } = req.body;

        if (!serviceId || !name || !email || !phone || !preferredLocation) {
            return res.status(400).json({
                success: false,
                message: 'Service ID, Name, Email, Phone number, and Preferred Place of Service / Product Collection are required.'
            });
        }

        const service = await ServiceItem.findById(serviceId);
        if (!service || !service.isActive) {
            return res.status(404).json({ success: false, message: 'Selected service or product is not available.' });
        }

        // Format Kenyan phone (e.g. 254712345678)
        const cleanPhone = formatKenyanPhone(phone);
        if (!cleanPhone || cleanPhone.length < 10) {
            return res.status(400).json({ success: false, message: 'Please provide a valid Safaricom/Kenyan phone number for M-Pesa payment.' });
        }

        const totalPrice = Number(service.totalPriceKES) || 0;
        const depositAmount = Number(service.depositAmountKES) || 50;
        const remainingBalance = Math.max(0, totalPrice - depositAmount);

        // Generate unique booking reference (e.g. SB-A9C3F1)
        const bookingRef = `SB-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Initiate M-Pesa STK Push for Upfront Deposit
        const LastDanceSettings = require('../models/LastDanceSettings');
        const settings = await LastDanceSettings.findOne({ key: 'global' });
        const activeGateway = settings?.activePaymentGateway || process.env.ACTIVE_PAYMENT_GATEWAY || 'payhero';

        const dummyUserId = '000000000000000000000000';
        const stkResult = await paymentGatewayService.initiateDeposit(
            dummyUserId,
            cleanPhone,
            depositAmount,
            activeGateway
        );
        const checkoutRequestID = stkResult.CheckoutRequestID;

        // Save pending booking record
        const booking = await ServiceBooking.create({
            bookingRef,
            serviceItem: service._id,
            serviceTitle: service.title,
            serviceCategory: service.category,
            serviceImageUrl: service.imageUrl || '',
            clientName: name.trim(),
            clientPhone: cleanPhone,
            clientEmail: email.trim().toLowerCase(),
            preferredLocation: preferredLocation.trim(),
            scheduledDate: scheduledDate || '',
            scheduledTimeSlot: scheduledTimeSlot || '',
            clientNotes: clientNotes ? clientNotes.trim() : '',
            totalPriceKES: totalPrice,
            depositAmountKES: depositAmount,
            remainingBalanceKES: remainingBalance,
            depositCheckoutRequestID: checkoutRequestID,
            depositStatus: 'pending',
            status: 'deposit_pending'
        });

        // Broadcast realtime activity event
        if (global.io) {
            global.io.emit('last_dance:activity_feed', {
                message: `✨ New booking started for "${service.title}" by ${name.trim()}!`,
                timestamp: new Date()
            });
        }

        res.json({
            success: true,
            message: `STK push prompt sent to ${cleanPhone}. Please enter your M-Pesa PIN to complete your deposit of KES ${depositAmount}.`,
            bookingRef,
            checkoutRequestID,
            depositAmountKES: depositAmount,
            remainingBalanceKES: remainingBalance
        });
    } catch (err) {
        console.error('[Services] bookService error:', err);
        res.status(500).json({ success: false, message: 'Failed to initiate booking: ' + (err.message || 'M-Pesa error') });
    }
};

/**
 * 4. Check Payment Status (Poll for Deposit or Balance Completion)
 */
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { checkoutRequestID } = req.params;
        if (!checkoutRequestID) {
            return res.status(400).json({ success: false, message: 'CheckoutRequestID required' });
        }

        // Check if matching deposit or balance
        const booking = await ServiceBooking.findOne({
            $or: [
                { depositCheckoutRequestID: checkoutRequestID },
                { balanceCheckoutRequestID: checkoutRequestID }
            ]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking transaction not found' });
        }

        const isDeposit = booking.depositCheckoutRequestID === checkoutRequestID;

        // If already completed
        if (isDeposit && booking.depositStatus === 'completed') {
            return res.json({
                success: true,
                type: 'service_deposit',
                status: 'completed',
                bookingRef: booking.bookingRef,
                receipt: booking.depositReceiptNumber,
                booking
            });
        }

        if (!isDeposit && booking.balanceStatus === 'completed') {
            return res.json({
                success: true,
                type: 'service_balance',
                status: 'completed',
                bookingRef: booking.bookingRef,
                receipt: booking.balanceReceiptNumber,
                booking
            });
        }

        // If pending, reconcile with gateway query
        try {
            const confirmedTx = await paymentGatewayService.checkPayHeroTransaction(checkoutRequestID);

            if (confirmedTx && confirmedTx.failed) {
                if (isDeposit) {
                    booking.depositStatus = 'failed';
                    await booking.save();
                    if (global.io) {
                        global.io.emit(`last_dance:service_booking_failed:${checkoutRequestID}`, {
                            success: false,
                            status: 'failed',
                            message: confirmedTx.reason || 'Payment cancelled or declined on device.'
                        });
                    }
                } else {
                    booking.balanceStatus = 'failed';
                    await booking.save();
                }
                return res.json({ success: false, status: 'failed', message: confirmedTx.reason || 'Payment cancelled.' });
            }

            if (confirmedTx && confirmedTx.pending) {
                return res.json({
                    success: true,
                    type: isDeposit ? 'service_deposit' : 'service_balance',
                    status: 'pending',
                    message: 'Payment is awaiting customer M-Pesa PIN entry.',
                    booking
                });
            }

            if (confirmedTx && confirmedTx.success && confirmedTx.mpesaReceiptNumber) {
                const expectedAmount = isDeposit ? booking.depositAmountKES : booking.remainingBalanceKES;
                if (confirmedTx.amountPaid && confirmedTx.amountPaid < expectedAmount) {
                    console.warn(`[Services] Underpayment: expected ${expectedAmount}, received ${confirmedTx.amountPaid}`);
                    if (isDeposit) {
                        booking.depositStatus = 'failed';
                        await booking.save();
                    }
                    return res.json({ success: false, status: 'failed', message: `Underpayment: expected KES ${expectedAmount}, received KES ${confirmedTx.amountPaid}.` });
                }

                if (isDeposit) {
                    booking.depositStatus = 'completed';
                    booking.depositReceiptNumber = confirmedTx.mpesaReceiptNumber;
                    booking.depositPaidAt = new Date();
                    booking.status = 'confirmed';
                    await booking.save();

                    // Send email confirmation
                    if (!booking.emailConfirmationSent) {
                        try {
                            await sendServiceBookingEmail({ booking });
                            booking.emailConfirmationSent = true;
                            await booking.save();
                            console.log(`[Services] Email sent to ${booking.clientEmail} for Ref ${booking.bookingRef}`);
                        } catch (mailErr) {
                            console.error('[Services] Mailer error:', mailErr.message);
                        }
                    }

                    // Send SMS confirmation
                    if (!booking.smsConfirmationSent) {
                        try {
                            await sendBookingConfirmationSms({ booking });
                            booking.smsConfirmationSent = true;
                            await booking.save();
                            console.log(`[Services] SMS sent to ${booking.clientPhone} for Ref ${booking.bookingRef}`);
                        } catch (smsErr) {
                            console.error('[Services] SMS error:', smsErr.message);
                        }
                    }

                    if (global.io) {
                        global.io.emit(`last_dance:service_booking_paid:${checkoutRequestID}`, {
                            success: true,
                            bookingRef: booking.bookingRef,
                            receipt: booking.depositReceiptNumber
                        });
                        global.io.emit('last_dance:activity_feed', {
                            message: `🎉 Booking confirmed: "${booking.serviceTitle}" for ${booking.clientName}!`,
                            timestamp: new Date()
                        });
                    }

                    return res.json({
                        success: true,
                        type: 'service_deposit',
                        status: 'completed',
                        bookingRef: booking.bookingRef,
                        receipt: booking.depositReceiptNumber,
                        booking
                    });
                } else {
                    // Balance payment reconciliation
                    booking.balanceStatus = 'completed';
                    booking.balanceReceiptNumber = confirmedTx.mpesaReceiptNumber;
                    booking.balancePaidAt = new Date();
                    booking.status = 'completed';
                    await booking.save();

                    if (!booking.balanceSmsSent) {
                        try {
                            await sendBalanceCompletedSms({ booking, receiptNumber: confirmedTx.mpesaReceiptNumber });
                            booking.balanceSmsSent = true;
                            await booking.save();
                        } catch (smsErr) {
                            console.error('[Services] Balance SMS error:', smsErr.message);
                        }
                    }

                    if (global.io) {
                        global.io.emit(`last_dance:service_balance_paid:${checkoutRequestID}`, {
                            success: true,
                            bookingRef: booking.bookingRef,
                            receipt: booking.balanceReceiptNumber
                        });
                    }

                    return res.json({
                        success: true,
                        type: 'service_balance',
                        status: 'completed',
                        bookingRef: booking.bookingRef,
                        receipt: booking.balanceReceiptNumber,
                        booking
                    });
                }
            }
        } catch (syncErr) {
            // Non-blocking query error
        }

        const currentStatus = isDeposit ? booking.depositStatus : booking.balanceStatus;
        return res.json({
            success: true,
            type: isDeposit ? 'service_deposit' : 'service_balance',
            status: currentStatus,
            booking
        });
    } catch (err) {
        console.error('[Services] checkPaymentStatus error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 4b. Retry Deposit Payment STK Push (For clients whose upfront deposit failed or timed out)
 */
exports.retryDepositPayment = async (req, res) => {
    try {
        const { bookingRef } = req.params;
        const { phone } = req.body;

        const booking = await ServiceBooking.findOne({ bookingRef: bookingRef.trim().toUpperCase() });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found with reference ' + bookingRef });
        }

        if (booking.depositStatus === 'completed') {
            return res.status(400).json({ success: false, message: 'Deposit for this booking has already been paid.' });
        }

        const rawPhone = phone || booking.clientPhone;
        const cleanPhone = formatKenyanPhone(rawPhone);
        if (!cleanPhone) {
            return res.status(400).json({ success: false, message: 'Valid Kenyan phone number required (e.g. 0712345678).' });
        }

        const { getOrCreateSettings } = require('./lastDanceController');
        const settings = await getOrCreateSettings();
        const activeGateway = settings?.activePaymentGateway || 'payhero';

        const dummyUserId = '000000000000000000000000';
        const stkResult = await paymentGatewayService.initiateDeposit(
            dummyUserId,
            cleanPhone,
            booking.depositAmountKES,
            activeGateway
        );

        booking.depositCheckoutRequestID = stkResult.CheckoutRequestID;
        booking.depositStatus = 'pending';
        booking.status = 'deposit_pending';
        booking.clientPhone = cleanPhone;
        await booking.save();

        res.json({
            success: true,
            message: `STK push prompt sent to ${cleanPhone}. Please enter your M-Pesa PIN to complete deposit of KES ${booking.depositAmountKES}.`,
            bookingRef: booking.bookingRef,
            checkoutRequestID: stkResult.CheckoutRequestID,
            depositAmountKES: booking.depositAmountKES
        });
    } catch (err) {
        console.error('[Services] retryDepositPayment error:', err);
        res.status(500).json({ success: false, message: 'Failed to initiate deposit payment: ' + (err.message || 'M-Pesa error') });
    }
};

/**
 * 5. Get Booking by Reference (Public digital pass view)
 */
exports.getBookingByRef = async (req, res) => {
    try {
        const { bookingRef } = req.params;
        if (!bookingRef) {
            return res.status(400).json({ success: false, message: 'Booking reference is required.' });
        }

        const booking = await ServiceBooking.findOne({ bookingRef: bookingRef.trim().toUpperCase() });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found with reference ' + bookingRef });
        }

        res.json({ success: true, booking });
    } catch (err) {
        console.error('[Services] getBookingByRef error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 6. Frictionless Guest Lookup by Phone Number ("Find My Bookings")
 */
exports.getMyBookingsByPhone = async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number parameter is required.' });
        }

        const cleanPhone = formatKenyanPhone(phone);
        const bookings = await ServiceBooking.find({ clientPhone: cleanPhone })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (err) {
        console.error('[Services] getMyBookingsByPhone error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};


/* ==========================================================================
   ADMIN MANAGEMENT CONTROLLERS (PROTECTED VIA JWT)
   ========================================================================== */

/**
 * 7. Admin: Get all service items (including private provider info)
 */
exports.adminGetServices = async (req, res) => {
    try {
        const services = await ServiceItem.find().sort({ sortOrder: 1, createdAt: -1 });
        res.json({ success: true, count: services.length, services });
    } catch (err) {
        console.error('[Services Admin] adminGetServices error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 8. Admin: Create a new service or merchandise item
 */
exports.adminCreateService = async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            totalPriceKES,
            depositAmountKES,
            stockOrSlots,
            providerName,
            providerContact,
            internalNotes,
            featured,
            isActive
        } = req.body;

        let finalImageUrl = req.body.imageUrl || '';

        // If file uploaded via Multer, stream to Cloudinary
        if (req.file && req.file.buffer) {
            try {
                const uploadResult = await uploadToCloudinary(req.file.buffer, {
                    folder: 'last_dance_services'
                });
                finalImageUrl = uploadResult.secure_url || uploadResult.url;
            } catch (cloudErr) {
                console.error('[Services Admin] Cloudinary upload failed:', cloudErr);
            }
        } else if (finalImageUrl && finalImageUrl.startsWith('data:image/')) {
            try {
                const uploadResult = await uploadToCloudinary(finalImageUrl, {
                    folder: 'last_dance_services'
                });
                finalImageUrl = uploadResult.secure_url || uploadResult.url;
            } catch (cloudErr) {
                console.error('[Services Admin] Cloudinary base64 upload failed:', cloudErr);
            }
        }

        if (!title || !category || totalPriceKES === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Title, Category, and Total Price (KES) are required.'
            });
        }

        const deposit = depositAmountKES !== undefined ? Number(depositAmountKES) : 50;
        const total = Number(totalPriceKES);

        if (deposit > total) {
            return res.status(400).json({
                success: false,
                message: 'Upfront deposit cannot be greater than the total price.'
            });
        }

        const service = await ServiceItem.create({
            title: title.trim(),
            category: category.trim(),
            description: description ? description.trim() : '',
            imageUrl: finalImageUrl || '',
            totalPriceKES: total,
            depositAmountKES: deposit,
            stockOrSlots: stockOrSlots !== undefined ? Number(stockOrSlots) : -1,
            providerName: providerName ? providerName.trim() : '',
            providerContact: providerContact ? providerContact.trim() : '',
            internalNotes: internalNotes ? internalNotes.trim() : '',
            featured: !!featured,
            isActive: isActive !== undefined ? !!isActive : true
        });

        res.status(201).json({
            success: true,
            message: 'Service / Merchandise item created successfully.',
            service
        });
    } catch (err) {
        console.error('[Services Admin] adminCreateService error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 9. Admin: Update an existing service item
 */
exports.adminUpdateService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await ServiceItem.findById(id);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }

        const updateData = { ...req.body };

        // Cloudinary support for file buffer or base64
        if (req.file && req.file.buffer) {
            try {
                const uploadResult = await uploadToCloudinary(req.file.buffer, {
                    folder: 'last_dance_services'
                });
                updateData.imageUrl = uploadResult.secure_url || uploadResult.url;
            } catch (cloudErr) {
                console.error('[Services Admin] Cloudinary update upload failed:', cloudErr);
            }
        } else if (updateData.imageUrl && updateData.imageUrl.startsWith('data:image/')) {
            try {
                const uploadResult = await uploadToCloudinary(updateData.imageUrl, {
                    folder: 'last_dance_services'
                });
                updateData.imageUrl = uploadResult.secure_url || uploadResult.url;
            } catch (cloudErr) {
                console.error('[Services Admin] Cloudinary base64 update failed:', cloudErr);
            }
        }

        if (updateData.totalPriceKES !== undefined) updateData.totalPriceKES = Number(updateData.totalPriceKES);
        if (updateData.depositAmountKES !== undefined) updateData.depositAmountKES = Number(updateData.depositAmountKES);
        if (updateData.stockOrSlots !== undefined) updateData.stockOrSlots = Number(updateData.stockOrSlots);
        if (updateData.depositAmountKES !== undefined) updateData.depositAmountKES = Number(updateData.depositAmountKES);
        if (updateData.stockOrSlots !== undefined) updateData.stockOrSlots = Number(updateData.stockOrSlots);

        const updated = await ServiceItem.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        res.json({
            success: true,
            message: 'Service updated successfully.',
            service: updated
        });
    } catch (err) {
        console.error('[Services Admin] adminUpdateService error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 10. Admin: Delete a service item
 */
exports.adminDeleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await ServiceItem.findByIdAndDelete(id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }
        res.json({ success: true, message: 'Service deleted successfully.' });
    } catch (err) {
        console.error('[Services Admin] adminDeleteService error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 11. Admin: Get all service bookings with filters
 */
exports.adminGetBookings = async (req, res) => {
    try {
        const { status, balanceStatus, category, search, page = 1, limit = 50 } = req.query;
        const query = {};

        if (status && status !== 'All') {
            query.status = status;
        }

        if (balanceStatus && balanceStatus !== 'All') {
            query.balanceStatus = balanceStatus;
        }

        if (category && category !== 'All') {
            query.serviceCategory = category;
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { bookingRef: regex },
                { clientName: regex },
                { clientPhone: regex },
                { clientEmail: regex },
                { serviceTitle: regex },
                { preferredLocation: regex },
                { depositReceiptNumber: regex }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [bookings, totalCount] = await Promise.all([
            ServiceBooking.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            ServiceBooking.countDocuments(query)
        ]);

        // Compute metrics
        const allBookings = await ServiceBooking.find();
        const metrics = {
            totalBookings: allBookings.length,
            confirmedBookings: allBookings.filter(b => b.depositStatus === 'completed').length,
            totalDepositsKES: allBookings.filter(b => b.depositStatus === 'completed').reduce((sum, b) => sum + (b.depositAmountKES || 0), 0),
            totalBalancesCollectedKES: allBookings.filter(b => b.balanceStatus === 'completed').reduce((sum, b) => sum + (b.remainingBalanceKES || 0), 0),
            pendingBalancesKES: allBookings.filter(b => b.depositStatus === 'completed' && b.balanceStatus !== 'completed').reduce((sum, b) => sum + (b.remainingBalanceKES || 0), 0),
            providersAssigned: allBookings.filter(b => b.assignedProvider?.name).length
        };

        res.json({
            success: true,
            bookings,
            totalCount,
            page: Number(page),
            totalPages: Math.ceil(totalCount / Number(limit)),
            metrics
        });
    } catch (err) {
        console.error('[Services Admin] adminGetBookings error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 12. Admin: Assign Service Provider to Client Booking
 */
exports.adminAssignProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const { providerName, providerPhone, assignmentNotes, notifyClient } = req.body;

        if (!providerName || !providerName.trim()) {
            return res.status(400).json({ success: false, message: 'Provider name is required.' });
        }

        const booking = await ServiceBooking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        booking.assignedProvider = {
            name: providerName.trim(),
            phone: providerPhone ? providerPhone.trim() : '',
            assignedAt: new Date(),
            assignmentNotes: assignmentNotes ? assignmentNotes.trim() : ''
        };

        if (booking.status === 'confirmed' || booking.status === 'deposit_pending') {
            booking.status = 'provider_assigned';
        }

        await booking.save();

        // Optionally send SMS to client
        if (notifyClient && booking.clientPhone) {
            try {
                await sendProviderAssignedSms({
                    booking,
                    providerName: providerName.trim(),
                    providerPhone: providerPhone ? providerPhone.trim() : ''
                });
            } catch (smsErr) {
                console.error('[Services Admin] Assign SMS error:', smsErr.message);
            }
        }

        if (global.io) {
            global.io.emit(`last_dance:service_booking_updated:${booking.bookingRef}`, booking);
        }

        res.json({
            success: true,
            message: `Specialist "${providerName}" assigned to booking ${booking.bookingRef}.`,
            booking
        });
    } catch (err) {
        console.error('[Services Admin] adminAssignProvider error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * 13. Admin: Prompt Remaining Balance STK Push to Client Phone upon Delivery
 */
exports.adminRequestBalancePayout = async (req, res) => {
    try {
        const { id } = req.params;
        const { phone } = req.body;

        const booking = await ServiceBooking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        if (booking.remainingBalanceKES <= 0) {
            return res.status(400).json({ success: false, message: 'This booking has no remaining balance.' });
        }

        if (booking.balanceStatus === 'completed') {
            return res.status(400).json({ success: false, message: 'Remaining balance has already been fully paid.' });
        }

        // Use custom phone if provided, otherwise client's registered phone
        const targetPhone = formatKenyanPhone(phone || booking.clientPhone);
        if (!targetPhone) {
            return res.status(400).json({ success: false, message: 'Valid phone number required for M-Pesa prompt.' });
        }

        const dummyUserId = '000000000000000000000000';
        const stkResult = await paymentGatewayService.initiateDeposit(
            dummyUserId,
            targetPhone,
            booking.remainingBalanceKES
        );

        booking.balanceCheckoutRequestID = stkResult.CheckoutRequestID;
        booking.balancePhone = targetPhone;
        booking.balanceStatus = 'pending';
        await booking.save();

        if (global.io) {
            global.io.emit(`last_dance:service_booking_updated:${booking.bookingRef}`, booking);
        }

        res.json({
            success: true,
            message: `STK push prompt of KES ${booking.remainingBalanceKES} dispatched to ${targetPhone}.`,
            checkoutRequestID: stkResult.CheckoutRequestID,
            remainingBalanceKES: booking.remainingBalanceKES,
            booking
        });
    } catch (err) {
        console.error('[Services Admin] adminRequestBalancePayout error:', err);
        res.status(500).json({ success: false, message: 'Failed to trigger balance prompt: ' + (err.message || 'M-Pesa error') });
    }
};

/**
 * 14. Admin: Update Booking Operational Status
 */
exports.adminUpdateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['deposit_pending', 'confirmed', 'provider_assigned', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid booking status.' });
        }

        const booking = await ServiceBooking.findByIdAndUpdate(id, { status }, { new: true });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        if (global.io) {
            global.io.emit(`last_dance:service_booking_updated:${booking.bookingRef}`, booking);
        }

        res.json({ success: true, message: `Status updated to ${status}.`, booking });
    } catch (err) {
        console.error('[Services Admin] adminUpdateBookingStatus error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

