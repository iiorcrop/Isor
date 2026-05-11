const express = require('express');
const router = express.Router();
const FooterSettings = require('../models/FooterSettings');

// GET footer settings
router.get('/', async (req, res) => {
    try {
        let settings = await FooterSettings.findOne();
        if (!settings) {
            settings = new FooterSettings();
            await settings.save();
        }
        res.json(settings);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// UPDATE footer settings
router.post('/', async (req, res) => {
    try {
        let settings = await FooterSettings.findOne();
        if (settings) {
            Object.assign(settings, req.body);
            settings.updatedAt = Date.now();
            await settings.save();
        } else {
            settings = new FooterSettings(req.body);
            await settings.save();
        }
        res.json(settings);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
