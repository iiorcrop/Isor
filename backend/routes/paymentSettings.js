const express = require('express');
const router = express.Router();
const PaymentSettings = require('../models/PaymentSettings');

// GET settings
router.get('/', async (req, res) => {
    try {
        console.log('Fetching payment settings...');
        let settings = await PaymentSettings.findOne();
        if (!settings) {
            console.log('No settings found, creating default...');
            settings = await PaymentSettings.create({});
        }
        res.json(settings);
    } catch (err) { 
        console.error('GET Payment Settings Error:', err);
        res.status(500).json({ message: err.message }); 
    }
});

// UPDATE settings
router.post('/', async (req, res) => {
    try {
        console.log('Updating payment settings with payload:', req.body);
        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        let settings = await PaymentSettings.findOne();
        if (!settings) {
            console.log('No existing settings, creating new...');
            settings = new PaymentSettings(updateData);
        } else {
            console.log('Updating existing settings...');
            Object.assign(settings, updateData);
        }
        
        const saved = await settings.save();
        console.log('Settings saved successfully');
        res.json(saved);
    } catch (err) { 
        console.error('Payment Settings Update Error:', err);
        res.status(400).json({ message: err.message }); 
    }
});

module.exports = router;
