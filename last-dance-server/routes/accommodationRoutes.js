// server/routes/accommodationRoutes.js
// Routes for Accommodations Marketplace (Host Enlisting, OTP, Guest Bookings, and Admin Audit)

const express = require('express');
const router = express.Router();
const accommodationController = require('../controllers/accommodationController');
const { protect } = require('../middleware/authMiddleware');
const { role } = require('../middleware/roleMiddleware');

/* ==========================================================================
   PUBLIC GUEST & HOST ROUTES
   ========================================================================== */

// 1. Send OTP to host phone
router.post('/send-otp', accommodationController.sendHostOtp);

// 2. Verify OTP for host phone
router.post('/verify-otp', accommodationController.verifyHostOtp);

// 3. Enlist property (triggers KES 100 enlisting fee STK push)
router.post('/enlist', accommodationController.enlistProperty);

// 4. Poll status for host enlisting fee
router.get('/enlist-status/:checkoutRequestID', accommodationController.checkEnlistingStatus);

// 5. Get all public active listings
router.get('/', accommodationController.getListings);

// 6. Frictionless lookup of bookings & listings by guest/host phone
router.get('/my-bookings', accommodationController.getMyAccommodationsByPhone);

// 7. Get single listing preview
router.get('/listing/:identifier', accommodationController.getListingByIdOrRef);

// 8. Guest books accommodation (triggers KES 100 connection fee STK push)
router.post('/book', accommodationController.bookAccommodation);

// 9. Poll status for guest booking connection fee
router.get('/booking-status/:checkoutRequestID', accommodationController.checkBookingStatus);

// 10. View verified booking details / receipt pass by reference
router.get('/booking/:bookingRef', accommodationController.getBookingByRef);


/* ==========================================================================
   ADMIN MANAGEMENT & FINANCIAL AUDITING ROUTES
   ========================================================================== */

// 11. Admin: Get all listings with host details
router.get('/admin/listings', protect, role('admin'), accommodationController.adminGetListings);

// 12. Admin: Update listing status (moderate, approve, reject, unlist)
router.patch('/admin/listings/:id/status', protect, role('admin'), accommodationController.adminUpdateListingStatus);

// 13. Admin: Unified Financial Audit Ledger (Host enlisting fees + Guest booking fees)
router.get('/admin/transactions', protect, role('admin'), accommodationController.adminGetTransactions);

// 14. Admin: Financial Audit Metrics & Unbooked Refund Eligibility
router.get('/admin/metrics', protect, role('admin'), accommodationController.adminGetMetrics);

// 15. Admin: Process or Record KES 50 Refund for Unbooked Property
router.post('/admin/refund/:id', protect, role('admin'), accommodationController.adminProcessRefund);

// 16. Admin: Get and Update Configurable Settings
router.get('/admin/settings', protect, role('admin'), accommodationController.adminGetSettings);
router.put('/admin/settings', protect, role('admin'), accommodationController.adminUpdateSettings);

module.exports = router;
