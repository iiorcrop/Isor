const mongoose = require('mongoose');

const QuickLinkSchema = new mongoose.Schema({
    title: { type: String, required: true },
    icon: { type: String, default: 'FileText' }, // Lucide icon name
    link: { type: String, default: '#' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuickLink', QuickLinkSchema);
