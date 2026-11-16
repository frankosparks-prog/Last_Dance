const mongoose = require('mongoose');

const AccommodationOtpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        index: true
    },
    otpCode: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '10m' } // Automatically cleans up after 10 minutes
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AccommodationOtp', AccommodationOtpSchema);
