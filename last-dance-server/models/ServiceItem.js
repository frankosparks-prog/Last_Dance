const mongoose = require('mongoose');

const ServiceItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Service title is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        default: 'Makeup Artist',
        index: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    imageUrl: {
        type: String,
        default: ''
    },
    // Total price the client will ultimately pay
    totalPriceKES: {
        type: Number,
        required: [true, 'Total price in KES is required'],
        min: [0, 'Total price cannot be negative']
    },
    // Upfront booking commitment / deposit amount (configurable via admin panel)
    depositAmountKES: {
        type: Number,
        required: [true, 'Upfront deposit amount in KES is required'],
        default: 50,
        min: [0, 'Deposit amount cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    stockOrSlots: {
        type: Number,
        default: -1 // -1 means unlimited slots
    },
    // Internal Admin Notes / Provider details (NEVER displayed on public user UI)
    providerName: {
        type: String,
        default: '',
        trim: true
    },
    providerContact: {
        type: String,
        default: '',
        trim: true
    },
    internalNotes: {
        type: String,
        default: '',
        trim: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Helper slug generator
ServiceItemSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
    }
    next();
});

module.exports = mongoose.model('LastDanceServiceItem', ServiceItemSchema);

