const mongoose = require('mongoose');

const NewsTickerSchema = new mongoose.Schema({
    text: { type: String, required: true },
    link: { type: String, default: '' },
    isPdf: { type: Boolean, default: false },
    pdfUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isNewItem: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NewsTicker', NewsTickerSchema);
