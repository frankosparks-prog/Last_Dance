const mongoose = require('mongoose');

const AccommodationBookingSchema = new mongoose.Schema({
    bookingRef: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true // e.g. "AB-789ABC"
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccommodationListing',
        required: true,
        index: true
    },
    listingTitle: {
        type: String,
        required: true
    },
    listingPropertyType: {
        type: String,
        default: 'Bedsitter'
    },
    listingZone: {
        type: String,
        default: 'Egerton Gate'
    },
    // Guest Information
    guestName: {
        type: String,
        required: [true, 'Guest name is required'],
        trim: true
    },
    guestPhone: {
        type: String,
        required: [true, 'Guest phone is required'],
        trim: true // 254XXXXXXXXX
    },
    guestEmail: {
        type: String,
        required: [true, 'Guest email is required'],
        trim: true,
        lowercase: true
    },
    guestCount: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    checkInDate: {
        type: String,
        required: [true, 'Check-in date is required'] // e.g. "2026-10-26"
    },
    checkOutDate: {
        type: String,
        default: '2026-10-27'
    },
    guestNotes: {
        type: String,
        default: '',
        trim: true
    },
    termsAccepted: {
        type: Boolean,
        required: true,
        default: true
    },
    // Booking Down Payment / Connection Fee
    connectionFeeKES: {
        type: Number,
        required: true,
        default: 100
    },
    checkoutRequestID: {
        type: String,
        required: true,
        index: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
        index: true
    },
    mpesaReceiptNumber: {
        type: String,
        default: ''
    },
    paidAt: {
        type: Date
    },
    // Host Information Snapshot (Revealed to guest only after verified payment)
    hostDetails: {
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        whatsApp: { type: String, default: '' },
        specificAddress: { type: String, default: '' }
    },
    // Notifications State
    guestSmsSent: { type: Boolean, default: false },
    guestEmailSent: { type: Boolean, default: false },
    hostSmsSent: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['pending_payment', 'confirmed', 'cancelled', 'completed'],
        default: 'pending_payment',
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AccommodationBooking', AccommodationBookingSchema);
