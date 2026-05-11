const express = require('express');
const router = express.Router();
const PageContent = require('../models/PageContent');

// GET all pages (summary)
router.get('/', async (req, res) => {
    try {
        const pages = await PageContent.find().select('slug title updatedAt');
        res.json(pages);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET specific page by slug
router.get('/:slug', async (req, res) => {
    try {
        const page = await PageContent.findOne({ slug: req.params.slug });
        if (!page) {
            // Return empty if not found, frontend will handle "not created yet"
            return res.json({ slug: req.params.slug, title: req.params.slug, content: '' });
        }
        res.json(page);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE or UPDATE page
router.post('/', async (req, res) => {
    const { slug, title, content } = req.body;
    try {
        let page = await PageContent.findOne({ slug });
        if (page) {
            page.title = title;
            page.content = content;
            page.updatedAt = Date.now();
            await page.save();
        } else {
            page = new PageContent({ slug, title, content });
            await page.save();
        }
        res.json(page);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE page
router.delete('/:id', async (req, res) => {
    try {
        await PageContent.findByIdAndDelete(req.params.id);
        res.json({ message: 'Page deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
