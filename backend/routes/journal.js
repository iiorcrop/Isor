const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const { upload, uploadToStorageServer } = require('../utils/fileUploader');

// GET all active journals
router.get('/', async (req, res) => {
    try {
        const journals = await Journal.find({ isActive: true }).sort('-year -order');
        res.json(journals);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET all journals (Admin)
router.get('/admin', async (req, res) => {
    try {
        const journals = await Journal.find().sort('-year -order');
        res.json(journals);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE journal
router.post('/', upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const journalData = {
            ...req.body,
            coverImageUrl: req.files['cover'] ? await uploadToStorageServer(req.files['cover'][0]) : null,
            pdfUrl: req.files['pdf'] ? await uploadToStorageServer(req.files['pdf'][0]) : null
        };
        const journal = new Journal(journalData);
        await journal.save();
        res.status(201).json(journal);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// UPDATE journal
router.patch('/:id', upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.files['cover']) updateData.coverImageUrl = await uploadToStorageServer(req.files['cover'][0]);
        if (req.files['pdf']) updateData.pdfUrl = await uploadToStorageServer(req.files['pdf'][0]);

        const journal = await Journal.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(journal);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE journal
router.delete('/:id', async (req, res) => {
    try {
        await Journal.findByIdAndDelete(req.params.id);
        res.json({ message: 'Journal deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
