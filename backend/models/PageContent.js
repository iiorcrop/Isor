const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    pdfs: [{
        url: { type: String },
        filename: { type: String }
    }],
    lastUpdatedBy: { type: String, default: 'Admin' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PageContent', pageContentSchema);
