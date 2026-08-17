const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'NationalEvent', required: true },
    eventTitle: { type: String, required: true },
    registrationNo: { type: String, required: true, unique: true },
    applicantName: { type: String, required: true },
    applicantEmail: { type: String, required: true },
    applicantPhone: { type: String },
    responses: { type: Map, of: String }, // Stores custom form responses
    paymentScreenshot: { type: String },
    paymentStatus: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    rejectionReason: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
