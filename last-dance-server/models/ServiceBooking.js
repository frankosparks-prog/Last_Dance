const mongoose = require('mongoose');

const ServiceBookingSchema = new mongoose.Schema({
    bookingRef: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    serviceItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LastDanceServiceItem',
        required: true
    },
    serviceTitle: {
        type: String,
        required: true,
        trim: true
    },
    serviceCategory: {
        type: String,
        required: true,
        trim: true
    },
    serviceImageUrl: {
        type: String,
        default: ''
    },

    // Client Details (Frictionless Guest - No password or login required)
    clientName: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true
    },
    clientPhone: {
        type: String,
        required: [true, 'Client phone number is required'],
        trim: true,
        index: true
    },
    clientEmail: {
        type: String,
        required: [true, 'Client email address is required'],
        trim: true,
        lowercase: true,
        index: true
    },

    // Preferred place of service or merchandise collection
    preferredLocation: {
        type: String,
        required: [true, 'Preferred place of service or product collection is required'],
        trim: true
    },
    scheduledDate: {
        type: String,
        default: ''
    },
    scheduledTimeSlot: {
        type: String,
        default: ''
    },
    clientNotes: {
        type: String,
        default: '',
        trim: true
    },

    // Financial Breakdown
    totalPriceKES: {
        type: Number,
        required: true,
        min: 0
    },
    depositAmountKES: {
        type: Number,
        required: true,
        min: 0
    },
    remainingBalanceKES: {
        type: Number,
        required: true,
        min: 0
    },

    // 1. Upfront Deposit Payment (Client-Initiated upon Booking)
    depositCheckoutRequestID: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    depositStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending',
        index: true
    },
    depositReceiptNumber: {
        type: String,
        default: ''
    },
    depositPaidAt: {
        type: Date
    },

    // 2. Remaining Balance Payout (Admin-Initiated after Service/Product Delivery)
    balanceCheckoutRequestID: {
        type: String,
        default: '',
        index: true
    },
    balancePhone: {
        type: String,
        default: ''
    },
    balanceStatus: {
        type: String,
        enum: ['unprompted', 'pending', 'completed', 'failed'],
        default: 'unprompted',
        index: true
    },
    balanceReceiptNumber: {
        type: String,
        default: ''
    },
    balancePaidAt: {
        type: Date
    },

    // Overall Operational Booking State
    status: {
        type: String,
        enum: ['deposit_pending', 'confirmed', 'provider_assigned', 'in_progress', 'completed', 'cancelled'],
        default: 'deposit_pending',
        index: true
    },

    // Service Provider Assignment (Linked by Admin via Dashboard)
    assignedProvider: {
        name: { type: String, default: '', trim: true },
        phone: { type: String, default: '', trim: true },
        assignedAt: { type: Date },
        assignmentNotes: { type: String, default: '', trim: true }
    },

    // Notifications Tracking
    emailConfirmationSent: {
        type: Boolean,
        default: false
    },
    smsConfirmationSent: {
        type: Boolean,
        default: false
    },
    balanceSmsSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LastDanceServiceBooking', ServiceBookingSchema);

