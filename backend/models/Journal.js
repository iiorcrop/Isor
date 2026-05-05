const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g. Vol. 40 (2023)
    year: { type: String, required: true },
    volume: { type: String },
    issues: { type: String, default: 'Issues 1 & 2' },
    articleCount: { type: String },
    pdfUrl: { type: String },
    coverImageUrl: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Journal', journalSchema);
