const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    membershipId: { type: String, unique: true },
    title: { type: String, enum: ['Dr.', 'Mr.', 'Ms.', 'Prof.'], required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    designation: { type: String },
    organization: { type: String },
    address: { type: String },
    qualification: { type: String },
    specialization: { type: String },
    membershipType: { 
        type: String, 
        enum: ['Annual', 'Life', 'Student'],
        required: true 
    },
    membershipYear: { type: String },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true },
    phone: { type: String },
    
    // Proposers
    proposers: [{
        name: String,
        address: String
    }],

    // Payment Info
    paymentStatus: { 
        type: String, 
        enum: ['Pending', 'Completed', 'Rejected'], 
        default: 'Pending' 
    },
    transactionId: { type: String },
    paymentProofUrl: { type: String },
    paymentDate: { type: Date },

    role: { type: String, default: 'member' },
    isVerified: { type: Boolean, default: false },
    approvalStatus: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
