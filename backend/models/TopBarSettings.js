const mongoose = require('mongoose');

const topBarSchema = new mongoose.Schema({
    location: {
        type: String,
        default: 'Hyderabad, Telangana, India'
    },
    phone: {
        type: String,
        default: '+91-40-2301-5291'
    },
    socialLinks: {
        facebook: { type: String, default: '#' },
        twitter: { type: String, default: '#' },
        linkedin: { type: String, default: '#' },
        youtube: { type: String, default: '#' }
    }
}, { timestamps: true });

module.exports = mongoose.model('TopBarSettings', topBarSchema);
