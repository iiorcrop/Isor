const express = require('express');
const router = express.Router();
const TopBarSettings = require('../models/TopBarSettings');

// Get Top Bar Settings
router.get('/', async (req, res) => {
    try {
        let settings = await TopBarSettings.findOne();
        if (!settings) {
            settings = await TopBarSettings.create({});
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Top Bar Settings
router.post('/', async (req, res) => {
    try {
        let settings = await TopBarSettings.findOne();
        if (settings) {
            settings = await TopBarSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
        } else {
            settings = await TopBarSettings.create(req.body);
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
