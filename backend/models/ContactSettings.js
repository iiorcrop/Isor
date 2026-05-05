const mongoose = require('mongoose');

const contactSettingsSchema = new mongoose.Schema({
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    workingHours: { type: String },
    mapUrl: { type: String }, // Embed URL for Google Maps
    socialLinks: {
        facebook: String,
        twitter: String,
        linkedin: String,
        youtube: String
    }
}, { timestamps: true });

module.exports = mongoose.model('ContactSettings', contactSettingsSchema);
