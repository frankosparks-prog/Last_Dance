const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Candidate name is required'],
        trim: true
    },
    photoUrl: {
        type: String,
        required: [true, 'Candidate photo URL is required']
    },
    oneLiner: {
        type: String,
        required: [true, 'One-liner slogan is required'],
        trim: true,
        maxlength: 120
    },
    pitch: {
        type: String,
        required: [true, 'Pitch description is required'],
        trim: true,
        maxlength: 1000
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        index: true
    },
    isApproved: {
        type: Boolean,
        default: false,
        index: true
    },
    voteCount: {
        type: Number,
        default: 0,
        index: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        default: ''
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LastDanceCandidate', CandidateSchema);
