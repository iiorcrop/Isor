const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Config for Event Images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/events';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 1024 * 1024 * 1024 } // 1GB limit
});

// GET all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: -1, createdAt: -1 });
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
        const imagePaths = req.files.map(file => `/uploads/events/${file.filename}`);
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
            const newImagePaths = req.files.map(file => `/uploads/events/${file.filename}`);
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
        const event = await Event.findById(req.params.id);
        if (event && event.images) {
            event.images.forEach(img => {
                const filePath = path.join(__dirname, '..', img);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
        }
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
