const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    link: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', BannerSchema);
