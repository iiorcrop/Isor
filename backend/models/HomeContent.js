const mongoose = require('mongoose');

// About Content Model
const AboutSchema = new mongoose.Schema({
    title: { type: String, default: 'About ISOR' },
    content: [{ type: String }], // Array of paragraphs
    updatedAt: { type: Date, default: Date.now }
});

// Stats Model (e.g., 1984, 42+ Volumes)
const StatSchema = new mongoose.Schema({
    label: { type: String, required: true },
    value: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
});

// Announcement Model
const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, default: Date.now },
    badge: { type: String, default: 'New' }, // e.g., New, Important, Urgent
    badgeColor: { type: String, default: 'success' },
    link: { type: String, default: '#' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const About = mongoose.model('About', AboutSchema);
const Stat = mongoose.model('Stat', StatSchema);
const Announcement = mongoose.model('Announcement', AnnouncementSchema);

module.exports = { About, Stat, Announcement };
