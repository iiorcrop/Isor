const mongoose = require('mongoose');

const brainstormSessionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    isSecure: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BrainstormSession', brainstormSessionSchema);
