const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { upload, uploadMultipleToStorageServer } = require('../utils/fileUploader');

// GET all events (optional ?type= filter)
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.type) {
            query.type = req.query.type;
        }
        const events = await Event.find(query).sort({ date: -1, createdAt: -1 });
        res.json(events);
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// GET latest events (top 3)
router.get('/latest', async (req, res) => {
    try {
        const events = await Event.find({ isLatest: true }).sort({ date: -1 }).limit(3);
        res.json(events);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE event
router.post('/', upload.array('images', 20), async (req, res) => {
    try {
        const imagePaths = await uploadMultipleToStorageServer(req.files);
        const event = new Event({
            ...req.body,
            images: imagePaths
        });
        await event.save();
        res.status(201).json(event);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// UPDATE event
router.patch('/:id', upload.array('images', 20), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.files && req.files.length > 0) {
            const newImagePaths = await uploadMultipleToStorageServer(req.files);
            // Option: append or replace? Let's replace if new images provided, 
            // or we could add logic to manage existing images.
            // For simplicity, we'll replace the gallery if new images are uploaded.
            updateData.images = newImagePaths;
        }

        const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(event);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE event
router.delete('/:id', async (req, res) => {
    try {
        // Since files are stored on remote server, we don't delete them from local filesystem.
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
