const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String },
    description: { type: String },
    images: [{ type: String }], // Array of image paths
    isLatest: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
