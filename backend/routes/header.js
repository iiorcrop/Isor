const express = require('express');
const router = express.Router();
const { upload, uploadToStorageServer } = require('../utils/fileUploader');
const HeaderSettings = require('../models/HeaderSettings');

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
            updateData.logoUrl = await uploadToStorageServer(req.file);
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
