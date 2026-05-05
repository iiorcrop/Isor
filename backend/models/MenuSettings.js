const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    label: { type: String, required: true },
    link: { type: String, default: '#' },
    isDropdown: { type: Boolean, default: false },
    children: [{
        label: { type: String },
        link: { type: String }
    }]
});

const menuSettingsSchema = new mongoose.Schema({
    items: [menuItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('MenuSettings', menuSettingsSchema);
