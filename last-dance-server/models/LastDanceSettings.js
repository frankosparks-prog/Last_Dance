const mongoose = require('mongoose');

const LastDanceSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'global',
        unique: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    activePaymentGateway: {
        type: String,
        enum: ['mpesa', 'payhero'],
        default: 'mpesa'
    },
    eventDate: {
        type: String,
        default: '2026-10-26'
    },
    eventTitle: {
        type: String,
        default: 'Last Dance'
    },
    tagline: {
        type: String,
        default: 'One Last Night. One Last Dance.'
    },
    ticketPriceKES: {
        type: Number,
        default: 500
    },
    musicUrl: {
        type: String,
        default: ''
    },
    categories: {
        type: [String],
        default: [
            'Mr & Miss Last Dance',
            'Most Likely to Succeed',
            'Best Dressed / Most Stylish',
            'Life of the Party',
            'Power Couple',
            'Campus Icon',
            'Comeback King/Queen',
            'Squad of the Year',
            'Most Missed'
        ]
    },
    votePackages: [{
        label: String,
        votes: Number,
        priceKES: Number,
        discountText: String,
        isPopular: Boolean
    }],
    accommodationSettings: {
        enabled: {
            type: Boolean,
            default: true
        },
        hostListingFeeKES: {
            type: Number,
            default: 100
        },
        hostRefundFeeKES: {
            type: Number,
            default: 50
        },
        clientBookingFeeKES: {
            type: Number,
            default: 100
        },
        disclaimerText: {
            type: String,
            default: 'Last Dance Festival is a marketplace platform connector only. We are not the property owner, landlord, or insurer. All accommodations are agreed directly between host and guest.'
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LastDanceSettings', LastDanceSettingsSchema);
