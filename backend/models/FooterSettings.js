const mongoose = require('mongoose');

const footerSettingsSchema = new mongoose.Schema({
    address: { type: String, default: 'ICAR-Directorate of Oilseeds Research,\nRajendranagar, Hyderabad – 500 030\nTelangana, India' },
    email: { type: String, default: 'isor.hyderabad@gmail.com' },
    phone: { type: String, default: '+91-40-2301-5291' },
    website: { type: String, default: 'www.isor.org.in' },
    socialLinks: {
        facebook: { type: String, default: '#' },
        twitter: { type: String, default: '#' },
        linkedin: { type: String, default: '#' },
        youtube: { type: String, default: '#' }
    },
    aboutShort: { type: String, default: 'Indian Society of Oilseeds Research' },
    copyrightText: { type: String, default: 'Indian Society of Oilseeds Research. All Rights Reserved.' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FooterSettings', footerSettingsSchema);
