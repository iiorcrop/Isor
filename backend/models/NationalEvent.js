const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
    label: { type: String, required: true },
    name: { type: String, required: true },
    fieldType: { 
        type: String, 
        enum: ['text', 'number', 'email', 'phone', 'select', 'textarea'], 
        default: 'text' 
    },
    required: { type: Boolean, default: true },
    options: [{ type: String }] // For 'select' dropdown options
});

const nationalEventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String },
    eventDate: { type: Date, required: true },
    location: { type: String },
    description: { type: String },
    bannerImage: { type: String },
    isFree: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    customFields: [customFieldSchema],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NationalEvent', nationalEventSchema);
