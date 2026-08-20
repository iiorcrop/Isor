const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    awardBy: { type: String, required: true }, // e.g. "Indian Society of Oilseeds Research (ICAR)"
    category: { type: String }, // e.g. "Research Excellence", "Lifetime Achievement", "Young Scientist"
    cashPrize: { type: String }, // e.g. "₹25,000 & Citation"
    frequency: { type: String }, // e.g. "Annual", "Biennial"
    eligibility: { type: String }, // e.g. "Open to ISOR Members under 40 years"
    description: { type: String }, // Full description and guidelines
    mainPhoto: { type: String }, // Image URL
    documentUrl: { type: String }, // PDF application form or document URL
    applicationDeadline: { type: String }, // e.g. "31st December 2026"
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Award', awardSchema);
