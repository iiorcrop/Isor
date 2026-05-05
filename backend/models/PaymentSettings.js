const mongoose = require('mongoose');

const paymentSettingsSchema = new mongoose.Schema({
    bankName: { type: String, default: 'STATE BANK OF INDIA' },
    accountNumber: { type: String, default: '52032213529' },
    ifscCode: { type: String, default: 'SBIN0020074' },
    branchName: { type: String, default: 'RAJENDRANAGAR BRANCH' },
    upiId: { type: String },
    qrCodeUrl: { type: String },
    activeGateway: { type: String, enum: ['BankTransfer', 'Razorpay', 'Stripe'], default: 'BankTransfer' },
    razorpayKey: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema);
