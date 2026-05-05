const express = require('express');
const router = express.Router();
const ContactSettings = require('../models/ContactSettings');
const Inquiry = require('../models/Inquiry');

// 1. SETTINGS: GET
router.get('/settings', async (req, res) => {
    try {
        let settings = await ContactSettings.findOne();
        if (!settings) {
            settings = await ContactSettings.create({
                address: 'ICAR-IIOR, Rajendranagar, Hyderabad-500 030, Telangana, India',
                phone: '+91-40-24016141',
                email: 'isor1984@gmail.com',
                workingHours: 'Mon - Sat: 9:30 AM - 5:30 PM'
            });
        }
        res.json(settings);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. SETTINGS: UPDATE (Admin)
router.patch('/settings', async (req, res) => {
    try {
        const settings = await ContactSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json(settings);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 3. INQUIRIES: POST (Public)
router.post('/inquiry', async (req, res) => {
    try {
        const inquiry = new Inquiry(req.body);
        await inquiry.save();
        res.status(201).json({ message: 'Thank you! Your message has been sent.' });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 4. INQUIRIES: GET (Admin)
router.get('/inquiries', async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort('-createdAt');
        res.json(inquiries);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 5. INQUIRIES: UPDATE STATUS (Admin)
router.patch('/inquiry/:id/status', async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(inquiry);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 6. INQUIRIES: DELETE (Admin)
router.delete('/inquiry/:id', async (req, res) => {
    try {
        await Inquiry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Inquiry deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
