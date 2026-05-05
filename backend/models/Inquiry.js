const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['New', 'Read', 'Replied'], default: 'New' },
    ipAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
