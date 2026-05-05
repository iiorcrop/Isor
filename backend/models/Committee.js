const mongoose = require('mongoose');

const committeeMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    organization: { type: String },
    period: { type: String },
    subGroup: { type: String },
    photoUrl: { type: String },
    committeeType: { 
        type: String, 
        enum: ['Executive', 'Editorial', 'Advisory', 'PastPresidents'], 
        required: true 
    },
    order: { type: Number, default: 0 },
    image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Committee', committeeMemberSchema);
