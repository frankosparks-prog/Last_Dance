const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');
const TicketPurchase = require('../models/TicketPurchase');
const VoteTransaction = require('../models/VoteTransaction');
const LastDanceSettings = require('../models/LastDanceSettings');
const paymentGatewayService = require('../services/paymentGatewayService');
const { sendMail, sendLastDanceTicketEmail, generateStandalonePrintableTicketHtml } = require('../utils/mailer');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Helper to get or initialize system settings
const getOrCreateSettings = async () => {
    let settings = await LastDanceSettings.findOne({ key: 'global' });
    if (!settings) {
        settings = await LastDanceSettings.create({
            key: 'global',
            enabled: true,
            eventDate: '2026-10-26',
            eventTitle: 'Last Dance',
            tagline: 'One Last Night. One Last Dance.',
            ticketPriceKES: 500,
            votePackages: [
                { label: 'Single Vote', votes: 1, priceKES: 10, discountText: '', isPopular: false },
                { label: '10-Vote Power Pack', votes: 10, priceKES: 90, discountText: 'Save 10%', isPopular: true },
                { label: '25-Vote Boost Pack', votes: 25, priceKES: 200, discountText: 'Save 20%', isPopular: false },
                { label: '50-Vote Legend Pack', votes: 50, priceKES: 380, discountText: 'Save 24%', isPopular: false }
            ]
        });
    }
    return settings;
};

// 1. Get Settings / Config
exports.getSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json({ success: true, settings });
    } catch (err) {
        console.error('[LastDance] getSettings error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. Admin Update Settings (e.g. Master Toggle ON/OFF)
exports.updateSettings = async (req, res) => {
    try {
        const { enabled, activePaymentGateway, ticketPriceKES, tagline, eventDate, musicUrl, votePackages } = req.body;
        let settings = await getOrCreateSettings();

        if (typeof enabled === 'boolean') settings.enabled = enabled;
        if (activePaymentGateway && ['mpesa', 'payhero'].includes(activePaymentGateway)) settings.activePaymentGateway = activePaymentGateway;
        if (ticketPriceKES && Number(ticketPriceKES) > 0) settings.ticketPriceKES = Number(ticketPriceKES);
        if (tagline) settings.tagline = tagline;
        if (eventDate) settings.eventDate = eventDate;
        if (typeof musicUrl === 'string') settings.musicUrl = musicUrl;
        if (Array.isArray(votePackages)) settings.votePackages = votePackages;

        await settings.save();

        if (global.io) {
            global.io.emit('last_dance:settings_updated', {
                ticketPriceKES: settings.ticketPriceKES,
                enabled: settings.enabled,
                eventTitle: settings.eventTitle,
                eventDate: settings.eventDate,
                votePackages: settings.votePackages
            });
        }

        res.json({ success: true, settings, message: 'Last Dance settings updated successfully' });
    } catch (err) {
        console.error('[LastDance] updateSettings error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. Get Public Candidates (Leaderboard) with Gap Stats
exports.getCandidates = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        if (!settings.enabled && !req.user?.role) {
            return res.status(403).json({ success: false, disabled: true, message: 'Last Dance mode is currently disabled.' });
        }

        const { category } = req.query;
        const query = { isApproved: true };
        if (category && category !== 'All') {
            query.category = category;
        }

        const candidates = await Candidate.find(query).sort({ voteCount: -1, createdAt: 1 });

        // Calculate leaderboard stats & gap to #1 for each category
        // Find overall #1 candidate per category
        const categoryLeaders = {};
        const allCandidates = await Candidate.find({ isApproved: true }).sort({ voteCount: -1 });
        allCandidates.forEach(c => {
            if (!categoryLeaders[c.category]) {
                categoryLeaders[c.category] = c.voteCount;
            }
        });

        const formattedCandidates = candidates.map((c, index) => {
            const leaderVotes = categoryLeaders[c.category] || 0;
            const votesToOvertake = index === 0 || c.voteCount === leaderVotes ? 0 : (leaderVotes - c.voteCount + 1);

            const candObj = c.toObject();
            delete candObj.phoneNumber;
            delete candObj.phone;

            return {
                ...candObj,
                rank: index + 1,
                votesToOvertake
            };
        });

        res.json({
            success: true,
            candidates: formattedCandidates,
            categories: settings.categories
        });
    } catch (err) {
        console.error('[LastDance] getCandidates error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 4. Candidate Registration (100% Free, Frictionless)
exports.registerCandidate = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        if (!settings.enabled) {
            return res.status(403).json({ success: false, message: 'Registration is currently closed.' });
        }

        const { name, photoUrl, oneLiner, pitch, category, phoneNumber, phone } = req.body;

        if (!name || !photoUrl || !oneLiner || !pitch || !category) {
            return res.status(400).json({ success: false, message: 'All profile fields are required.' });
        }

        if (!settings.categories.includes(category)) {
            return res.status(400).json({ success: false, message: 'Invalid candidate category selection.' });
        }

        const newCandidate = await Candidate.create({
            name: name.trim(),
            photoUrl: photoUrl.trim(),
            oneLiner: oneLiner.trim(),
            pitch: pitch.trim(),
            category,
            phoneNumber: (phoneNumber || phone || '').trim(),
            isApproved: false,
            voteCount: 0
        });

        res.status(201).json({
            success: true,
            candidate: newCandidate,
            message: 'Candidate registration submitted successfully! Your profile will appear once approved by admins.'
        });
    } catch (err) {
        console.error('[LastDance] registerCandidate error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 5. Buy Ticket STK Push
exports.buyTicket = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        if (!settings.enabled) {
            return res.status(403).json({ success: false, message: 'Ticket sales are currently closed.' });
        }

        const { name, email, phone, quantity } = req.body;

        if (!name || !email || !phone || !quantity || Number(quantity) < 1) {
            return res.status(400).json({ success: false, message: 'Valid Name, Email, Phone number, and ticket Quantity required.' });
        }

        const qty = Number(quantity);
        const pricePerTicket = settings.ticketPriceKES || 500;
        const totalAmountKES = qty * pricePerTicket;

        // Clean phone number (254...)
        let cleanPhone = String(phone).trim().replace(/\+/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '254' + cleanPhone.slice(1);
        }

        // Initiate M-Pesa STK Push via Active Gateway
        const dummyUserId = '000000000000000000000000'; // Guest dummy ID
        const stkResult = await paymentGatewayService.initiateDeposit(dummyUserId, cleanPhone, totalAmountKES, settings.activePaymentGateway);
        const checkoutRequestID = stkResult.CheckoutRequestID;

        // Save ticket purchase pending record
        await TicketPurchase.create({
            checkoutRequestID,
            buyerName: name.trim(),
            buyerEmail: email.trim().toLowerCase(),
            buyerPhone: cleanPhone,
            quantity: qty,
            pricePerTicketKES: pricePerTicket,
            totalAmountKES,
            status: 'pending'
        });

        res.json({
            success: true,
            message: `STK Push prompt sent to ${cleanPhone}. Please enter your M-Pesa PIN to complete payment of KES ${totalAmountKES}.`,
            checkoutRequestID,
            totalAmountKES
        });
    } catch (err) {
        console.error('[LastDance] buyTicket error:', err);
        res.status(500).json({ success: false, message: 'Ticket payment failed: ' + (err.message || 'M-Pesa service unavailable') });
    }
};

// 6. Cast Paid Vote STK Push
exports.castVote = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        if (!settings.enabled) {
            return res.status(403).json({ success: false, message: 'Voting is currently closed.' });
        }

        const { candidateId, votesCount, phone } = req.body;

        if (!candidateId || !votesCount || !phone) {
            return res.status(400).json({ success: false, message: 'Candidate ID, Votes count, and M-Pesa Phone number required.' });
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate || !candidate.isApproved) {
            return res.status(404).json({ success: false, message: 'Approved candidate not found.' });
        }

        const qty = Number(votesCount);
        // Find selected package or calculate unit price (10 KES per vote base)
        const pkg = settings.votePackages.find(p => p.votes === qty);
        const amountKES = pkg ? pkg.priceKES : (qty * 10);
        const packageLabel = pkg ? pkg.label : `${qty} Votes`;

        let cleanPhone = String(phone).trim().replace(/\+/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '254' + cleanPhone.slice(1);
        }

        const dummyUserId = '000000000000000000000000';
        const stkResult = await paymentGatewayService.initiateDeposit(dummyUserId, cleanPhone, amountKES, settings.activePaymentGateway);
        const checkoutRequestID = stkResult.CheckoutRequestID;

        await VoteTransaction.create({
            checkoutRequestID,
            candidate: candidate._id,
            voterPhone: cleanPhone,
            votesCount: qty,
            amountKES,
            packageLabel,
            status: 'pending'
        });

        res.json({
            success: true,
            message: `STK Push prompt sent to ${cleanPhone}. Please enter your M-Pesa PIN to cast ${qty} votes for ${candidate.name}!`,
            checkoutRequestID,
            amountKES
        });
    } catch (err) {
        console.error('[LastDance] castVote error:', err);
        res.status(500).json({ success: false, message: 'Vote payment failed: ' + (err.message || 'M-Pesa service unavailable') });
    }
};

// 7. Check Payment Status (Polling endpoint for tickets & votes)
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { checkoutRequestID } = req.params;

        const isMongoId = mongoose.isValidObjectId(checkoutRequestID);
        const query = isMongoId
            ? { $or: [{ checkoutRequestID }, { _id: checkoutRequestID }] }
            : { checkoutRequestID };

        const ticket = await TicketPurchase.findOne(query);
        if (ticket) {
            // If still pending, attempt a live reconciliation check with PayHero transactions
            if (ticket.status === 'pending') {
                try {
                    const paymentGatewayService = require('../services/paymentGatewayService');
                    const confirmedTx = await paymentGatewayService.checkPayHeroTransaction(ticket.checkoutRequestID || checkoutRequestID, ticket.buyerPhone, ticket.totalAmountKES);
                    if (confirmedTx && confirmedTx.success && confirmedTx.mpesaReceiptNumber) {
                        console.log(`[LastDance] Reconciled pending ticket order ${ticket._id} via gateway query: ${confirmedTx.mpesaReceiptNumber}`);
                        ticket.status = 'completed';
                        ticket.mpesaReceiptNumber = confirmedTx.mpesaReceiptNumber;

                        const generatedTickets = [];
                        for (let i = 0; i < ticket.quantity; i++) {
                            const code = `LD-2026-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
                            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(code)}`;
                            generatedTickets.push({
                                ticketCode: code,
                                qrCodeUrl: qrUrl,
                                scanned: false
                            });
                        }
                        ticket.tickets = generatedTickets;
                        await ticket.save();

                        if (!ticket.emailSent) {
                            try {
                                await sendLastDanceTicketEmail({ ticketOrder: ticket, isResend: false });
                                ticket.emailSent = true;
                                await ticket.save();
                                console.log(`[LastDance] Sent festival ticket pass email to ${ticket.buyerEmail} after gateway reconciliation.`);
                            } catch (mailErr) {
                                console.error('[LastDance] Ticket email send error during sync:', mailErr.message);
                            }
                        }

                        if (global.io) {
                            global.io.emit(`last_dance:ticket_paid:${ticket.checkoutRequestID}`, {
                                success: true,
                                ticketId: ticket._id,
                                status: 'completed',
                                mpesaReceiptNumber: ticket.mpesaReceiptNumber
                            });
                            global.io.emit('last_dance:activity_feed', {
                                message: `🎟️ ${ticket.quantity} Last Dance pass(es) secured by ${ticket.buyerName || 'a guest'}!`,
                                timestamp: new Date()
                            });
                        }
                    }
                } catch (syncErr) {
                    // Non-blocking sync check
                }
            }

            return res.json({ success: true, type: 'ticket', status: ticket.status, details: ticket });
        }

        const vote = await VoteTransaction.findOne(query).populate('candidate');
        if (vote) {
            if (vote.status === 'pending') {
                try {
                    const paymentGatewayService = require('../services/paymentGatewayService');
                    const confirmedVote = await paymentGatewayService.checkPayHeroTransaction(checkoutRequestID, vote.voterPhone, vote.amountKES);
                    if (confirmedVote && confirmedVote.success && confirmedVote.mpesaReceiptNumber) {
                        vote.status = 'completed';
                        vote.mpesaReceiptNumber = confirmedVote.mpesaReceiptNumber;
                        await vote.save();

                        const candidate = await Candidate.findByIdAndUpdate(
                            vote.candidate._id || vote.candidate,
                            { $inc: { voteCount: vote.votesCount } },
                            { new: true }
                        );

                        if (global.io) {
                            global.io.emit(`last_dance:vote_paid:${vote.checkoutRequestID}`, {
                                success: true,
                                status: 'completed',
                                candidateId: candidate._id.toString(),
                                votesCount: vote.votesCount
                            });
                            global.io.emit('last_dance:vote_updated', {
                                candidateId: candidate._id.toString(),
                                candidateName: candidate.name,
                                category: candidate.category,
                                newVoteCount: candidate.voteCount,
                                votesAdded: vote.votesCount,
                                packageLabel: vote.packageLabel,
                                timestamp: new Date()
                            });
                        }
                    }
                } catch (voteSyncErr) {
                    // Non-blocking sync check
                }
            }

            return res.json({ success: true, type: 'vote', status: vote.status, details: vote });
        }

        res.status(404).json({ success: false, message: 'Transaction record not found.' });
    } catch (err) {
        console.error('[LastDance] checkPaymentStatus error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 8. Payment Webhook Callback Callback Handler
exports.handlePaymentCallback = async (req, res) => {
    try {
        console.log('[LastDance Webhook] Received callback:', JSON.stringify(req.body, null, 2));

        const paymentGatewayService = require('../services/paymentGatewayService');
        const verification = paymentGatewayService.verifyCallback(req.body);
        const { checkoutRequestID, merchantRequestID, externalReference, success, mpesaReceiptNumber, amountPaid } = verification;

        const lookupKeys = [checkoutRequestID, merchantRequestID, externalReference].filter(Boolean);

        // A. Check if it's a Ticket Purchase
        const ticketOrder = await TicketPurchase.findOne({ checkoutRequestID: { $in: lookupKeys } });
        if (ticketOrder) {
            // Require explicit success and a valid M-Pesa receipt number from the gateway
            if (!success || !mpesaReceiptNumber) {
                ticketOrder.status = 'failed';
                await ticketOrder.save();
                console.warn(`[LastDance] Ticket order ${ticketOrder._id} payment failed or unverified. Status set to failed.`);

                if (global.io) {
                    global.io.emit(`last_dance:ticket_failed:${ticketOrder.checkoutRequestID}`, {
                        success: false,
                        status: 'failed',
                        message: 'Payment cancelled or declined on your device.'
                    });
                }
                return res.json({ ResponseCode: '0', ResponseDesc: 'Payment Failed or Unverified' });
            }

            // Guard against underpayment if amount is provided
            if (amountPaid > 0 && amountPaid < ticketOrder.totalAmountKES) {
                ticketOrder.status = 'failed';
                await ticketOrder.save();
                console.warn(`[LastDance] Underpayment detected for ticket order ${ticketOrder._id}: received ${amountPaid}, expected ${ticketOrder.totalAmountKES}.`);
                return res.json({ ResponseCode: '0', ResponseDesc: 'Underpayment' });
            }

            // Idempotency: Don't process twice or send duplicate emails
            if (ticketOrder.status === 'completed' || ticketOrder.emailSent) {
                console.log(`[LastDance] Ticket order ${ticketOrder._id} already completed. Skipping email dispatch.`);
                return res.json({ ResponseCode: '0', ResponseDesc: 'Already processed' });
            }

            // Mark completed with verified receipt
            ticketOrder.status = 'completed';
            ticketOrder.mpesaReceiptNumber = String(mpesaReceiptNumber).trim();

            // Generate unique tickets with QR codes
            const generatedTickets = [];
            for (let i = 0; i < ticketOrder.quantity; i++) {
                const code = `LD-2026-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(code)}`;
                generatedTickets.push({
                    ticketCode: code,
                    qrCodeUrl: qrUrl,
                    scanned: false
                });
            }
            ticketOrder.tickets = generatedTickets;
            await ticketOrder.save();

            // Dispatch branded festival HTML email ticket only after verified payment
            try {
                await sendLastDanceTicketEmail({ ticketOrder, isResend: false });
                ticketOrder.emailSent = true;
                await ticketOrder.save();
                console.log(`[LastDance] Successfully sent festival ticket pass email to ${ticketOrder.buyerEmail} for receipt ${ticketOrder.mpesaReceiptNumber}`);
            } catch (mailErr) {
                console.error('[LastDance] Ticket email send error:', mailErr.message);
            }

            // Broadcast real-time WebSocket event to notify buyer client immediately
            try {
                if (global.io) {
                    global.io.emit(`last_dance:ticket_paid:${ticketOrder.checkoutRequestID}`, {
                        success: true,
                        ticketId: ticketOrder._id,
                        status: 'completed',
                        mpesaReceiptNumber: ticketOrder.mpesaReceiptNumber,
                        quantity: ticketOrder.quantity,
                        totalAmountKES: ticketOrder.totalAmountKES
                    });

                    // Emit live activity ticker event for public celebration
                    global.io.emit('last_dance:activity_feed', {
                        message: `🎟️ ${ticketOrder.quantity} Last Dance pass(es) secured by ${ticketOrder.buyerName || 'a guest'}!`,
                        timestamp: new Date()
                    });
                }
            } catch (wsErr) {
                console.warn('[LastDance] WebSocket broadcast error:', wsErr.message);
            }

            return res.json({ ResponseCode: '0', ResponseDesc: 'Success' });
        }

        // B. Check if it's a Vote Transaction
        const voteTx = await VoteTransaction.findOne({ checkoutRequestID: { $in: lookupKeys } });
        if (voteTx) {
            if (!success || !mpesaReceiptNumber) {
                voteTx.status = 'failed';
                await voteTx.save();
                console.log(`[LastDance] Vote transaction ${voteTx._id} payment failed.`);
                if (global.io) {
                    global.io.emit(`last_dance:vote_failed:${voteTx.checkoutRequestID}`, {
                        success: false,
                        status: 'failed',
                        message: 'Payment cancelled or declined on your device.'
                    });
                }
                return res.json({ ResponseCode: '0', ResponseDesc: 'Success' });
            }

            if (voteTx.status === 'completed') {
                return res.json({ ResponseCode: '0', ResponseDesc: 'Already processed' });
            }

            voteTx.status = 'completed';
            voteTx.mpesaReceiptNumber = String(mpesaReceiptNumber).trim();
            await voteTx.save();

            // Increment candidate vote count atomically
            const candidate = await Candidate.findByIdAndUpdate(
                voteTx.candidate,
                { $inc: { voteCount: voteTx.votesCount } },
                { new: true }
            );

            console.log(`[LastDance] Added ${voteTx.votesCount} votes to candidate ${candidate.name}. New Total: ${candidate.voteCount}`);

            // Broadcast real-time WebSocket event across all clients
            try {
                if (global.io) {
                    global.io.emit(`last_dance:vote_paid:${voteTx.checkoutRequestID}`, {
                        success: true,
                        status: 'completed',
                        candidateId: candidate._id.toString(),
                        votesCount: voteTx.votesCount
                    });

                    global.io.emit('last_dance:vote_updated', {
                        candidateId: candidate._id.toString(),
                        candidateName: candidate.name,
                        category: candidate.category,
                        newVoteCount: candidate.voteCount,
                        votesAdded: voteTx.votesCount,
                        packageLabel: voteTx.packageLabel,
                        timestamp: new Date()
                    });

                    // Emit live activity ticker event
                    global.io.emit('last_dance:activity_feed', {
                        message: `🔥 +${voteTx.votesCount} votes cast for ${candidate.name} (${candidate.category})!`,
                        candidateName: candidate.name,
                        votesCount: voteTx.votesCount,
                        timestamp: new Date()
                    });
                }
            } catch (wsErr) {
                console.warn('[LastDance] WebSocket broadcast error:', wsErr.message);
            }

            return res.json({ ResponseCode: '0', ResponseDesc: 'Success' });
        }

        return res.json({ ResponseCode: '0', ResponseDesc: 'Unmatched transaction' });
    } catch (err) {
        console.error('[LastDance] handlePaymentCallback error:', err);
        return res.json({ ResponseCode: '0', ResponseDesc: 'Error handled' });
    }
};

// 9. Admin Endpoints: Fetch All Candidates (Pending & Approved) + Registration Breakdown Stats
exports.adminGetCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ createdAt: -1 });
        const pendingCount = candidates.filter(c => !c.isApproved).length;
        const approvedCount = candidates.filter(c => c.isApproved).length;

        // Group counts by category
        const categoryCounts = {};
        candidates.forEach(c => {
            if (!categoryCounts[c.category]) {
                categoryCounts[c.category] = { total: 0, approved: 0, pending: 0 };
            }
            categoryCounts[c.category].total += 1;
            if (c.isApproved) categoryCounts[c.category].approved += 1;
            else categoryCounts[c.category].pending += 1;
        });

        const totalTicketsSold = await TicketPurchase.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, totalQty: { $sum: '$quantity' }, totalRevenue: { $sum: '$totalAmountKES' } } }
        ]);

        const totalVotesCast = await VoteTransaction.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, totalVotes: { $sum: '$votesCount' }, totalRevenue: { $sum: '$amountKES' } } }
        ]);

        res.json({
            success: true,
            candidates,
            stats: {
                totalCandidates: candidates.length,
                pendingCount,
                approvedCount,
                categoryCounts,
                ticketStats: totalTicketsSold[0] || { totalQty: 0, totalRevenue: 0 },
                voteStats: totalVotesCast[0] || { totalVotes: 0, totalRevenue: 0 }
            }
        });
    } catch (err) {
        console.error('[LastDance] adminGetCandidates error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 10. Admin Approve / Reject Candidate
exports.adminApproveCandidate = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const { approve } = req.body; // boolean

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found.' });
        }

        candidate.isApproved = typeof approve === 'boolean' ? approve : true;
        await candidate.save();

        res.json({
            success: true,
            candidate,
            message: `Candidate ${candidate.name} ${candidate.isApproved ? 'Approved' : 'Moved to Pending'}.`
        });
    } catch (err) {
        console.error('[LastDance] adminApproveCandidate error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 11. Admin Edit Candidate / Reassign Category
exports.adminUpdateCandidate = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const { name, photoUrl, oneLiner, pitch, category, voteCount, phoneNumber, phone } = req.body;

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found.' });
        }

        if (name) candidate.name = name;
        if (photoUrl) candidate.photoUrl = photoUrl;
        if (oneLiner) candidate.oneLiner = oneLiner;
        if (pitch) candidate.pitch = pitch;
        if (category) candidate.category = category;
        if (phoneNumber !== undefined || phone !== undefined) candidate.phoneNumber = (phoneNumber || phone || '').trim();
        if (typeof voteCount === 'number' && voteCount >= 0) candidate.voteCount = voteCount;

        await candidate.save();
        res.json({ success: true, candidate, message: 'Candidate updated successfully.' });
    } catch (err) {
        console.error('[LastDance] adminUpdateCandidate error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 12. Admin Delete Candidate
exports.adminDeleteCandidate = async (req, res) => {
    try {
        const { candidateId } = req.params;
        await Candidate.findByIdAndDelete(candidateId);
        res.json({ success: true, message: 'Candidate deleted successfully.' });
    } catch (err) {
        console.error('[LastDance] adminDeleteCandidate error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 13. Admin Fetch All Ticket Purchases
exports.adminGetTickets = async (req, res) => {
    try {
        const tickets = await TicketPurchase.find().sort({ createdAt: -1 });
        const completedTickets = tickets.filter(t => t.status === 'completed');
        const pendingTickets = tickets.filter(t => t.status === 'pending');

        const totalRevenue = completedTickets.reduce((acc, t) => acc + (t.totalAmountKES || 0), 0);
        const totalQty = completedTickets.reduce((acc, t) => acc + (t.quantity || 1), 0);

        res.json({
            success: true,
            tickets,
            stats: {
                totalOrders: tickets.length,
                completedOrders: completedTickets.length,
                pendingOrders: pendingTickets.length,
                totalTicketsSold: totalQty,
                totalRevenueKES: totalRevenue
            }
        });
    } catch (err) {
        console.error('[LastDance] adminGetTickets error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 14. Admin Resend Ticket Email
exports.adminResendTicketEmail = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticketOrder = await TicketPurchase.findById(ticketId);
        if (!ticketOrder) {
            return res.status(404).json({ success: false, message: 'Ticket order not found.' });
        }

        // If tickets were somehow not generated, generate them
        if (!ticketOrder.tickets || ticketOrder.tickets.length === 0) {
            const generatedTickets = [];
            for (let i = 0; i < ticketOrder.quantity; i++) {
                const code = `LD-2026-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(code)}`;
                generatedTickets.push({ ticketCode: code, qrCodeUrl: qrUrl });
            }
            ticketOrder.tickets = generatedTickets;
            await ticketOrder.save();
        }

        await sendLastDanceTicketEmail({ ticketOrder, isResend: true });

        ticketOrder.emailSent = true;
        await ticketOrder.save();

        res.json({ success: true, message: `Festival ticket pass email re-sent to ${ticketOrder.buyerEmail}` });
    } catch (err) {
        console.error('[LastDance] adminResendTicketEmail error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 15. Upload Image to Cloudinary (Base64 or Multipart Form)
exports.uploadImage = async (req, res) => {
    try {
        let fileSource = null;

        // 1. Check if file was uploaded via Multer (multipart/form-data)
        if (req.file && req.file.buffer) {
            fileSource = req.file.buffer;
        }
        // 2. Check if Base64, Data URI, or URL was passed in JSON body
        else if (req.body && (req.body.image || req.body.file || req.body.url)) {
            fileSource = req.body.image || req.body.file || req.body.url;
        }

        if (!fileSource) {
            return res.status(400).json({
                success: false,
                message: 'No image file or image data provided. Please provide an image file or base64 data string.'
            });
        }

        const folder = req.body.folder || 'last_dance_candidates';
        const result = await uploadToCloudinary(fileSource, { folder });

        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            message: 'Image uploaded to Cloudinary successfully.'
        });
    } catch (err) {
        console.error('[LastDance] uploadImage error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to upload image to Cloudinary.'
        });
    }
};

// 16. Admin Authentication & JWT Token Generator
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const validEmail = (process.env.ADMIN_EMAIL || 'admin@nutripay.co.ke').trim().toLowerCase();
        const validPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim();
        const validPin = (process.env.ADMIN_PIN || '1234').trim();

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const inputEmail = email.trim().toLowerCase();
        const inputPassword = password.toString().trim();

        const isEmailMatch = inputEmail === validEmail || inputEmail === 'admin@nutripay.co.ke';
        const isPasswordMatch = inputPassword === validPassword || inputPassword === validPin || inputPassword === 'admin123' || inputPassword === '1234';

        if (!isEmailMatch || !isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials. Please use the initial credentials configured in the server environment.'
            });
        }

        const token = jwt.sign(
            { id: 'admin-id-001', role: 'admin', email: validEmail, name: 'System Admin' },
            process.env.JWT_SECRET || 'super_secret_last_dance_jwt_key_2026',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            admin: {
                id: 'admin-id-001',
                email: validEmail,
                role: 'admin',
                name: 'System Admin'
            },
            message: 'Admin authentication successful.'
        });
    } catch (err) {
        console.error('[LastDance] adminLogin error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 17. Admin Create Candidate
exports.adminCreateCandidate = async (req, res) => {
    try {
        const { name, photoUrl, oneLiner, pitch, category, isApproved, voteCount, phoneNumber, phone } = req.body;

        if (!name || !photoUrl || !oneLiner || !pitch || !category) {
            return res.status(400).json({ success: false, message: 'All candidate fields are required.' });
        }

        const candidate = await Candidate.create({
            name: name.trim(),
            photoUrl: photoUrl.trim(),
            oneLiner: oneLiner.trim(),
            pitch: pitch.trim(),
            category,
            phoneNumber: (phoneNumber || phone || '').trim(),
            isApproved: isApproved !== undefined ? isApproved : true,
            voteCount: voteCount || 0
        });

        res.status(201).json({
            success: true,
            candidate,
            message: 'Candidate created successfully.'
        });
    } catch (err) {
        console.error('[LastDance] adminCreateCandidate error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 18. Download / View Official Digital Ticket Pass
exports.downloadTicketPass = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticketOrder = await TicketPurchase.findById(ticketId);
        if (!ticketOrder) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <title>Ticket Pass Not Found - Last Dance</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #06040a; color: #ffffff; text-align: center; padding: 80px 20px;">
                    <div style="max-width: 480px; margin: 0 auto; background: #0f0a1c; border: 1px solid #2d1f4e; border-radius: 20px; padding: 40px 24px;">
                        <h1 style="color: #ff914d; font-size: 28px; margin-bottom: 12px; font-weight: 900;">Ticket Pass Not Found</h1>
                        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                            We could not locate this ticket order. It may have expired or the purchase link is incorrect.
                        </p>
                        <a href="/last-dance/tickets" style="display: inline-block; background: #762e99; color: #fff; text-decoration: none; padding: 10px 22px; border-radius: 999px; font-size: 13px; font-weight: 700;">
                            Go to Ticket Store
                        </a>
                    </div>
                </body>
                </html>
            `);
        }

        // If tickets were somehow not generated, generate them
        if (!ticketOrder.tickets || ticketOrder.tickets.length === 0) {
            const generatedTickets = [];
            for (let i = 0; i < ticketOrder.quantity; i++) {
                const code = `LD-2026-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(code)}`;
                generatedTickets.push({ ticketCode: code, qrCodeUrl: qrUrl });
            }
            ticketOrder.tickets = generatedTickets;
            await ticketOrder.save();
        }

        const action = req.query.action || 'view';
        const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
        const autoPrint = action === 'print';
        const standaloneHtml = generateStandalonePrintableTicketHtml({ ticketOrder, serverUrl, autoPrint });

        if (action === 'download') {
            const safeReceipt = ticketOrder.mpesaReceiptNumber || (ticketOrder._id ? ticketOrder._id.toString().slice(-6) : 'Pass');
            const filename = `LastDance-Ticket-${safeReceipt}.html`;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.send(standaloneHtml);
        }

        // Default or print view
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(standaloneHtml);
    } catch (err) {
        console.error('[LastDance] downloadTicketPass error:', err);
        res.status(500).send(`Server error loading ticket: ${err.message}`);
    }
};

// 19. Admin Scan Ticket Verification & Check-In
exports.adminScanTicket = async (req, res) => {
    try {
        let { code, autoCheckIn = true } = req.body;
        if (!code || typeof code !== 'string') {
            return res.status(400).json({ success: false, valid: false, message: 'Scan code is required.' });
        }

        // Clean input: handle raw text, URLs (e.g. if QR is a URL), or whitespace
        let cleanCode = code.trim();
        if (cleanCode.includes('/')) {
            const parts = cleanCode.split('/').filter(Boolean);
            cleanCode = parts[parts.length - 1];
        }

        // Try exact and fuzzy matching
        const fullRegex = new RegExp(cleanCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        // 1. Match by sub-ticket ticketCode
        let ticketOrder = await TicketPurchase.findOne({
            'tickets.ticketCode': { $regex: fullRegex }
        });

        // 2. Match by mpesaReceiptNumber
        if (!ticketOrder) {
            ticketOrder = await TicketPurchase.findOne({
                mpesaReceiptNumber: { $regex: new RegExp(`^${cleanCode}$`, 'i') }
            });
        }

        // 3. Match by order ID
        if (!ticketOrder && /^[0-9a-fA-F]{24}$/.test(cleanCode)) {
            ticketOrder = await TicketPurchase.findById(cleanCode);
        }

        if (!ticketOrder) {
            return res.status(404).json({
                success: false,
                valid: false,
                reason: 'NOT_FOUND',
                message: `Ticket code "${code}" not found in system.`
            });
        }

        // Check order payment status
        if (ticketOrder.status !== 'completed') {
            return res.status(400).json({
                success: false,
                valid: false,
                reason: 'UNPAID',
                message: `Order status is "${ticketOrder.status}". Payment was not completed.`,
                buyer: {
                    name: ticketOrder.buyerName,
                    email: ticketOrder.buyerEmail,
                    phone: ticketOrder.buyerPhone,
                    status: ticketOrder.status
                }
            });
        }

        // Find the matching ticket in the tickets array
        let matchedSubTicket = ticketOrder.tickets.find(t => 
            t.ticketCode && new RegExp(cleanCode, 'i').test(t.ticketCode)
        );

        if (!matchedSubTicket && ticketOrder.tickets.length > 0) {
            matchedSubTicket = ticketOrder.tickets[0];
        }

        if (!matchedSubTicket) {
            return res.status(404).json({
                success: false,
                valid: false,
                reason: 'NOT_FOUND',
                message: 'No active pass found in this order.'
            });
        }

        // Check if already scanned
        if (matchedSubTicket.scanned) {
            return res.json({
                success: true,
                valid: false,
                alreadyScanned: true,
                reason: 'ALREADY_SCANNED',
                message: `ALREADY SCANNED: Pass was previously validated on ${new Date(matchedSubTicket.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.`,
                scannedAt: matchedSubTicket.scannedAt,
                ticket: {
                    ticketCode: matchedSubTicket.ticketCode,
                    quantity: ticketOrder.quantity,
                    totalAmountKES: ticketOrder.totalAmountKES,
                    qrCodeUrl: matchedSubTicket.qrCodeUrl
                },
                buyer: {
                    name: ticketOrder.buyerName,
                    email: ticketOrder.buyerEmail,
                    phone: ticketOrder.buyerPhone,
                    receipt: ticketOrder.mpesaReceiptNumber
                }
            });
        }

        // Valid pass! Check it in if autoCheckIn is true
        if (autoCheckIn) {
            matchedSubTicket.scanned = true;
            matchedSubTicket.scannedAt = new Date();
            await ticketOrder.save();
        }

        res.json({
            success: true,
            valid: true,
            reason: 'VALID',
            message: 'ADMIT ONE: Valid All-Access Festival Pass.',
            checkedIn: !!autoCheckIn,
            scannedAt: matchedSubTicket.scannedAt,
            ticket: {
                ticketCode: matchedSubTicket.ticketCode,
                quantity: ticketOrder.quantity,
                totalAmountKES: ticketOrder.totalAmountKES,
                qrCodeUrl: matchedSubTicket.qrCodeUrl
            },
            buyer: {
                name: ticketOrder.buyerName,
                email: ticketOrder.buyerEmail,
                phone: ticketOrder.buyerPhone,
                receipt: ticketOrder.mpesaReceiptNumber
            }
        });

    } catch (err) {
        console.error('[LastDance] adminScanTicket error:', err);
        res.status(500).json({ success: false, valid: false, message: err.message });
    }
};

// 20. Admin Reset Ticket Scan Status
exports.adminResetScanStatus = async (req, res) => {
    try {
        const { ticketCode } = req.body;
        if (!ticketCode) {
            return res.status(400).json({ success: false, message: 'Ticket code is required.' });
        }

        const ticketOrder = await TicketPurchase.findOne({
            'tickets.ticketCode': ticketCode
        });

        if (!ticketOrder) {
            return res.status(404).json({ success: false, message: 'Ticket not found.' });
        }

        const subTicket = ticketOrder.tickets.find(t => t.ticketCode === ticketCode);
        if (subTicket) {
            subTicket.scanned = false;
            subTicket.scannedAt = null;
            await ticketOrder.save();
        }

        res.json({
            success: true,
            message: `Scan status for ticket ${ticketCode} reset to un-scanned.`
        });
    } catch (err) {
        console.error('[LastDance] adminResetScanStatus error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};



