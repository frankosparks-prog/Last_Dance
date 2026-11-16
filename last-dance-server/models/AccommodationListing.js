const mongoose = require('mongoose');

const AccommodationListingSchema = new mongoose.Schema({
    listingRef: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true // e.g. "HS-789ABC"
    },
    title: {
        type: String,
        required: [true, 'Property title is required'],
        trim: true
    },
    propertyType: {
        type: String,
        required: true,
        enum: ['Bedsitter', '1 Bedroom', '2 Bedroom', 'Private Room', 'Hostel Room', 'Full House'],
        default: 'Bedsitter',
        index: true
    },
    locationZone: {
        type: String,
        required: [true, 'Location zone is required'],
        enum: ['Egerton Main Gate', 'Njokerio', 'Wright', 'Booster', '420', 'Sumkam', 'Ahero', 'Ng\'ondu', 'Njoro', 'Other'],
        index: true
    },
    specificAddress: {
        type: String,
        required: [true, 'Specific address or court name is required'],
        trim: true // e.g. "Greenfields Court, Block B, Door 3"
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    pricePerNightKES: {
        type: Number,
        required: [true, 'Price per night in KES is required'],
        min: [0, 'Price cannot be negative']
    },
    maxGuests: {
        type: Number,
        required: true,
        default: 2,
        min: 1
    },
    bedrooms: {
        type: Number,
        default: 1
    },
    beds: {
        type: Number,
        default: 1
    },
    amenities: [{
        type: String // e.g. 'WiFi', 'Hot Shower', 'Clean Water', 'Backup Power', 'Security Guard', 'Balcony', 'Parking'
    }],
    houseRules: {
        noParties: { type: Boolean, default: true },
        noSmoking: { type: Boolean, default: true },
        noExtraVisitors: { type: Boolean, default: true },
        quietHours: { type: String, default: '10:00 PM - 6:00 AM' },
        checkInTime: { type: String, default: '12:00 PM' },
        checkOutTime: { type: String, default: '10:00 AM' },
        customRules: { type: String, default: '' }
    },
    images: {
        type: [String],
        validate: {
            validator: function(val) {
                return Array.isArray(val) && val.length >= 1 && val.length <= 3;
            },
            message: 'A listing must have between 1 and 3 photos'
        }
    },
    // Host Information & Verification
    hostName: {
        type: String,
        required: true,
        trim: true
    },
    hostPhone: {
        type: String,
        required: true,
        trim: true // 254XXXXXXXXX
    },
    hostWhatsApp: {
        type: String,
        required: true,
        trim: true // 254XXXXXXXXX
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    termsAccepted: {
        type: Boolean,
        required: true,
        default: false
    },
    termsAcceptedAt: {
        type: Date,
        default: Date.now
    },
    // Host Enlisting Payment
    enlistingFeeKES: {
        type: Number,
        default: 100
    },
    enlistingCheckoutRequestID: {
        type: String,
        default: '',
        index: true
    },
    enlistingPaymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
        index: true
    },
    enlistingReceiptNumber: {
        type: String,
        default: ''
    },
    enlistingPaidAt: {
        type: Date
    },
    // Listing State
    status: {
        type: String,
        enum: ['draft', 'active', 'booked', 'unlisted', 'rejected'],
        default: 'draft',
        index: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    // Refund Tracking for unbooked houses
    refundEligible: {
        type: Boolean,
        default: false
    },
    refundAmountKES: {
        type: Number,
        default: 50
    },
    refundStatus: {
        type: String,
        enum: ['not_applicable', 'pending_approval', 'refunded', 'forfeited'],
        default: 'not_applicable'
    },
    refundReceiptNumber: {
        type: String,
        default: ''
    },
    refundProcessedAt: {
        type: Date
    },
    adminNotes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AccommodationListing', AccommodationListingSchema);
