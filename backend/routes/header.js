const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const HeaderSettings = require('../models/HeaderSettings');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/logos';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// GET settings
router.get('/', async (req, res) => {
    try {
        let settings = await HeaderSettings.findOne();
        if (!settings) {
            settings = await HeaderSettings.create({});
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST update settings (with logo upload)
router.post('/', upload.single('logo'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.logoUrl = `/uploads/logos/${req.file.filename}`;
        }

        let settings = await HeaderSettings.findOne();
        if (settings) {
            settings = await HeaderSettings.findOneAndUpdate({}, updateData, { new: true });
        } else {
            settings = await HeaderSettings.create(updateData);
        }
        res.json(settings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
