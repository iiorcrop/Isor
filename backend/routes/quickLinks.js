const express = require('express');
const router = express.Router();
const QuickLink = require('../models/QuickLink');

// GET all links
router.get('/', async (req, res) => {
    try {
        const links = await QuickLink.find().sort({ order: 1, createdAt: -1 });
        res.json(links);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET active links (for frontend)
router.get('/active', async (req, res) => {
    try {
        const links = await QuickLink.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.json(links);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST add link
router.post('/', async (req, res) => {
    try {
        const link = new QuickLink(req.body);
        await link.save();
        res.status(201).json(link);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update link
router.put('/:id', async (req, res) => {
    try {
        const link = await QuickLink.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(link);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE link
router.delete('/:id', async (req, res) => {
    try {
        await QuickLink.findByIdAndDelete(req.params.id);
        res.json({ message: 'Link deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
