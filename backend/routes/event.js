const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { upload, uploadMultipleToStorageServer } = require('../utils/fileUploader');

// GET all events (optional ?type= filter)
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.type) {
            if (req.query.type === 'events') {
                query.$or = [{ type: 'events' }, { type: { $exists: false } }, { type: '' }, { type: null }];
            } else {
                query.type = req.query.type;
            }
        }
        const events = await Event.find(query).sort({ date: -1, createdAt: -1 });
        res.json(events);
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// GET latest events (top 3 general events)
router.get('/latest', async (req, res) => {
    try {
        const events = await Event.find({ isLatest: true, $or: [{ type: 'events' }, { type: { $exists: false } }, { type: '' }, { type: null }] }).sort({ date: -1 }).limit(3);
        res.json(events);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE event
router.post('/', upload.array('images', 20), async (req, res) => {
    try {
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = await uploadMultipleToStorageServer(req.files);
        } else if (req.body.images) {
            imagePaths = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }
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
            updateData.images = await uploadMultipleToStorageServer(req.files);
        } else if (req.body.images) {
            updateData.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
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
