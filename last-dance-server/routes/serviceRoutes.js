// server/routes/serviceRoutes.js
// Routes for Marketplace Services & Merchandise, Client Bookings, and Admin Management

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { role } = require('../middleware/roleMiddleware');
const { upload } = require('../utils/cloudinary');

/* ==========================================================================
   PUBLIC GUEST ROUTES (NO AUTHENTICATION REQUIRED)
   ========================================================================== */

// 1. Get active services catalog (Public)
router.get('/', serviceController.getServices);

// 2. Query bookings by guest phone number ("Find My Bookings")
router.get('/my-bookings', serviceController.getMyBookingsByPhone);

// 3. Check M-Pesa payment status (polling for deposit or balance payment)
router.get('/payment-status/:checkoutRequestID', serviceController.checkPaymentStatus);

// 4. View public digital booking pass by reference code
router.get('/booking/:bookingRef', serviceController.getBookingByRef);

// 4b. Re-prompt upfront deposit payment (Retry M-Pesa STK Push)
router.post('/booking/:bookingRef/pay-deposit', serviceController.retryDepositPayment);

// 5. Get single service details by ID or Slug
router.get('/:identifier', serviceController.getServiceByIdOrSlug);

// 6. Initiate Service Booking (M-Pesa STK Push for Upfront Deposit)
router.post('/book', serviceController.bookService);


/* ==========================================================================
   ADMIN MANAGEMENT ROUTES (PROTECTED VIA JWT)
   ========================================================================== */

// 7. Get all services (including inactive & provider contacts)
router.get('/admin/all', protect, role('admin'), serviceController.adminGetServices);

// 8. Create new service/merchandise item (Configurable price & upfront deposit, Cloudinary upload)
router.post('/admin/create', protect, role('admin'), upload.single('image'), serviceController.adminCreateService);

// 9. Update service details, prices, or status (Cloudinary upload)
router.put('/admin/:id', protect, role('admin'), upload.single('image'), serviceController.adminUpdateService);

// 10. Delete a service item
router.delete('/admin/:id', protect, role('admin'), serviceController.adminDeleteService);

// 11. Get all client bookings (Filterable by status, balance, category, search)
router.get('/admin/bookings/list', protect, role('admin'), serviceController.adminGetBookings);

// 12. Link / Assign Service Provider to Client Booking
router.patch('/admin/bookings/:id/assign-provider', protect, role('admin'), serviceController.adminAssignProvider);

// 13. Prompt Remaining Balance STK Push to Client Phone upon Delivery
router.post('/admin/bookings/:id/request-balance', protect, role('admin'), serviceController.adminRequestBalancePayout);

// 14. Update Booking Operational Status
router.patch('/admin/bookings/:id/status', protect, role('admin'), serviceController.adminUpdateBookingStatus);

module.exports = router;

