const express = require('express');
const router = express.Router();
const lastDanceController = require('../controllers/lastDanceController');
const { protect } = require('../middleware/authMiddleware');
const { role } = require('../middleware/roleMiddleware');
const { upload } = require('../utils/cloudinary');

/* ==========================================================================
   PUBLIC FRICTIONLESS GUEST ROUTES (NO AUTH REQUIRED)
   ========================================================================== */

// Get system config & active status
router.get('/settings', lastDanceController.getSettings);

// Get active categories list & nominee counts breakdown
router.get('/categories', lastDanceController.getCategories);

// Get approved candidates list with rankings & gap stats
router.get('/candidates', lastDanceController.getCandidates);

// Cloudinary Image / Avatar Upload (supports multipart file or base64)
router.post('/upload-image', upload.single('image'), lastDanceController.uploadImage);

// Admin Authentication Login
router.post('/admin/login', lastDanceController.adminLogin);

// Candidate Registration (100% Free)
router.post('/register', lastDanceController.registerCandidate);

// Buy Event Access Ticket (KES 500 base - M-Pesa STK Push)
router.post('/buy-ticket', lastDanceController.buyTicket);

// Cast Paid Vote (M-Pesa STK Push)
router.post('/cast-vote', lastDanceController.castVote);

// Check M-Pesa Payment Status (polling for tickets & votes)
router.get('/payment-status/:checkoutRequestID', lastDanceController.checkPaymentStatus);

// Download or View Official Ticket Pass (Public with Ticket ID)
router.get('/tickets/:ticketId/download', lastDanceController.downloadTicketPass);
router.get('/tickets/:ticketId/pass', lastDanceController.downloadTicketPass);

// M-Pesa / PayHero Webhook Callback Handler (Public Webhook)
router.post('/callback', lastDanceController.handlePaymentCallback);

/* ==========================================================================
   ADMIN MANAGEMENT ROUTES (PROTECTED)
   ========================================================================== */

// Get all candidate registrations (pending + approved) and overall statistics
router.get('/admin/candidates', protect, role('admin'), lastDanceController.adminGetCandidates);

// Admin Create Candidate directly
router.post('/admin/candidates', protect, role('admin'), lastDanceController.adminCreateCandidate);

// Approve or Reject Candidate (Visibility Gate)
router.patch('/admin/candidates/:candidateId/approve', protect, role('admin'), lastDanceController.adminApproveCandidate);

// Update Candidate details or reassign category
router.put('/admin/candidates/:candidateId', protect, role('admin'), lastDanceController.adminUpdateCandidate);

// Delete Candidate
router.delete('/admin/candidates/:candidateId', protect, role('admin'), lastDanceController.adminDeleteCandidate);

// Get all ticket purchases & statistics
router.get('/admin/tickets', protect, role('admin'), lastDanceController.adminGetTickets);

// Resend digital ticket email
router.post('/admin/tickets/:ticketId/resend', protect, role('admin'), lastDanceController.adminResendTicketEmail);

// Ticket QR Code Gate Scanner & Validation Check-In
router.post('/admin/tickets/scan', protect, role('admin'), lastDanceController.adminScanTicket);

// Reset Ticket Scan Status (for re-entry or administrative testing)
router.post('/admin/tickets/reset-scan', protect, role('admin'), lastDanceController.adminResetScanStatus);

// Update Module Settings (e.g. Turn Module ON/OFF, Active Payment Gateway)
router.post('/admin/settings', protect, role('admin'), lastDanceController.updateSettings);

// Category Management (Add, Reorder, Rename with auto-migration, Delete with safe reassignment)
router.post('/admin/categories', protect, role('admin'), lastDanceController.adminAddCategory);
router.put('/admin/categories/reorder', protect, role('admin'), lastDanceController.adminReorderCategories);
router.put('/admin/categories/:oldCategoryName', protect, role('admin'), lastDanceController.adminUpdateCategory);
router.delete('/admin/categories/:categoryName', protect, role('admin'), lastDanceController.adminDeleteCategory);

module.exports = router;
