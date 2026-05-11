const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true }, // e.g., 'about', 'downloads'
    title: { type: String, required: true },
    content: { type: String, default: '' }, // HTML or Markdown
    lastUpdatedBy: { type: String, default: 'Admin' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PageContent', pageContentSchema);
