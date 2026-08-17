const express = require('express');
const router = express.Router();
const BrainstormSession = require('../models/BrainstormSession');
const { upload, uploadToStorageServer } = require('../utils/fileUploader');

// GET all brainstorm sessions
router.get('/', async (req, res) => {
    try {
        const sessions = await BrainstormSession.find().sort({ order: 1, date: -1, createdAt: -1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE brainstorm session
router.post('/', upload.single('pdf'), async (req, res) => {
    try {
        let pdfUrl = req.body.pdfUrl || '';
        if (req.file) {
            pdfUrl = await uploadToStorageServer(req.file);
        }

        if (!pdfUrl) {
            return res.status(400).json({ message: 'PDF file or URL is required' });
        }

        const session = new BrainstormSession({
            title: req.body.title,
            pdfUrl,
            description: req.body.description,
            date: req.body.date || Date.now(),
            order: req.body.order || 0
        });

        await session.save();
        res.status(201).json(session);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE brainstorm session
router.patch('/:id', upload.single('pdf'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.pdfUrl = await uploadToStorageServer(req.file);
        }

        const session = await BrainstormSession.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(session);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE brainstorm session
router.delete('/:id', async (req, res) => {
    try {
        await BrainstormSession.findByIdAndDelete(req.params.id);
        res.json({ message: 'Brainstorm session deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
